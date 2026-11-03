import React, { useState, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import {
  RecipientItem,
  SenderInfo,
  PrintSettings,
  EnvelopeFormat,
} from './types';
import { DEFAULT_DIRECTORY, DEFAULT_SENDER } from './data/defaultDirectory';
import { TopBar } from './components/TopBar';
import { DataTable } from './components/DataTable';
import { EnvelopeView } from './components/EnvelopeView';
import { PrintArea } from './components/PrintArea';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { SenderSettingsModal } from './components/SenderSettingsModal';
import { PrinterGuideModal } from './components/PrinterGuideModal';
import { BatchPrintModal } from './components/BatchPrintModal';
import { PrintStationModal } from './components/PrintStationModal';
import { exportToCsv } from './utils/googleSheets';
import { downloadPrintableHtml, printViaHiddenIframe } from './utils/printHelpers';

export default function App() {
  // Directory items (initialized with 247 educational service area records)
  const [items, setItems] = useState<RecipientItem[]>(() => {
    try {
      const saved = localStorage.getItem('envelope_recipients_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_DIRECTORY;
  });

  // Selected item to view/edit on canvas (Recipient)
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_DIRECTORY[0]?.id || '0');

  // Sender details (default to office #0 or saved)
  const [sender, setSender] = useState<SenderInfo>(() => {
    try {
      const saved = localStorage.getItem('envelope_sender_info');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    const initialItem = DEFAULT_DIRECTORY[0];
    return {
      id: initialItem?.id || '0',
      organization: initialItem?.organization || DEFAULT_SENDER.organization,
      address: initialItem?.address || DEFAULT_SENDER.address,
      postalCode: initialItem?.postalCode || DEFAULT_SENDER.postalCode,
      docNumber: '',
    };
  });

  // Print & Envelope settings (Default to TH Sarabun PSK 16pt, attached Garuda emblem)
  const [settings, setSettings] = useState<PrintSettings>(() => {
    const defaults: PrintSettings = {
      format: 'small', // 10.8 x 23.5 ซม.
      orientation: 'landscape',
      fontSizePt: 16, // ปรับเล็กลงตามคำขอ (default: 16pt)
      senderFontSizePt: 14,
      lineHeight: 1.25,
      recipientParagraphGapMm: 0, // ช่องว่างระหว่างชื่อสำนักงานกับที่อยู่ (0 มม. ชิดพอดี)
      garudaStyle: 'attached_black', // ตราครุฑตามแนบ
      reserveLogo: true,
      logoPlaceholderText: 'เว้นที่ว่างตราครุฑ',
      showLogoBorderInPrint: false,
      includeGarudaArtwork: true,
      customLogoUrl: '',
      logoWidthMm: 13.5, // สัดส่วนตราครุฑ
      logoHeightMm: 15,  // ซองเล็กครุฑสูง 1.5 ซม. (15 มม.)
      showSender: true,
      senderPosition: 'top-left',
      docNumberPrefix: 'ที่ ศธ ',
      docNumberPlaceholder: '...................................................',
      postalBoxMode: 'filled', // ใส่เลข ปณ. ในตารางแดง
      showPostalBoxes: true,
      postalBoxColor: 'red',
      nudgeX: 0,
      nudgeY: 0,
      recipientNudgeX: 0,
      recipientNudgeY: 0,
      stampMark: 'none',
    };

    try {
      const saved = localStorage.getItem('envelope_print_settings');
      if (saved) {
        return { ...defaults, ...JSON.parse(saved) };
      }
    } catch (e) {
      // ignore
    }
    return defaults;
  });

  // Modal visibility states
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [isSenderSettingsOpen, setIsSenderSettingsOpen] = useState(false);
  const [isPrinterGuideOpen, setIsPrinterGuideOpen] = useState(false);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  const [isPrintStationOpen, setIsPrintStationOpen] = useState(false);
  const [printStationItems, setPrintStationItems] = useState<RecipientItem[]>([]);

  // Active items being printed by window.print()
  const [activePrintItems, setActivePrintItems] = useState<RecipientItem[]>([]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Currently viewed recipient item
  const currentItem = useMemo(() => {
    return items.find((i) => i.id === selectedId) || items[0] || DEFAULT_DIRECTORY[0];
  }, [items, selectedId]);

  // Selected for printing count
  const selectedCount = useMemo(() => {
    return items.filter((i) => i.selected).length;
  }, [items]);

  // Sync items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('envelope_recipients_data', JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items]);

  // Handle format toggle (small 10.8x23.5 cm vs A4 landscape)
  const handleUpdateFormat = (format: EnvelopeFormat) => {
    const updated: PrintSettings = {
      ...settings,
      format,
      orientation: 'landscape',
      logoHeightMm: format === 'small' ? 15 : 30, // ซองเล็ก 1.5 ซม. / A4 3 ซม.
      logoWidthMm: format === 'small' ? 13.5 : 27,
    };
    setSettings(updated);
    showToast(
      format === 'small'
        ? 'สลับเป็นซองเล็ก (10.8 × 23.5 ซม. · ครุฑสูง 1.5 ซม.)'
        : 'สลับเป็นหน้าซอง A4 แนวนอน (29.7 × 21.0 ซม. · ครุฑสูง 3 ซม.)'
    );
  };

  // Set any item from the list as the SENDER
  const handleSetAsSender = (item: RecipientItem) => {
    const newSender: SenderInfo = {
      ...sender,
      id: item.id,
      organization: item.organization,
      address: item.address,
      postalCode: item.postalCode || '',
    };
    setSender(newSender);
    try {
      localStorage.setItem('envelope_sender_info', JSON.stringify(newSender));
    } catch (e) {
      // ignore
    }
    showToast(`กำหนด "${item.organization}" เป็นผู้ส่งเรียบร้อย`);
  };

  // Swap current sender and current recipient
  const handleSwapSenderRecipient = () => {
    // Current sender info
    const prevSenderOrg = sender.organization;
    const prevSenderAddress = sender.address;
    const prevSenderPostal = sender.postalCode;

    // Current recipient info
    const prevRecipient = currentItem;

    // New Sender becomes previous recipient
    const updatedSender: SenderInfo = {
      ...sender,
      id: prevRecipient.id,
      organization: prevRecipient.organization,
      address: prevRecipient.address,
      postalCode: prevRecipient.postalCode || '',
    };

    // New Recipient becomes previous sender
    const updatedRecipient: RecipientItem = {
      id: sender.id || 'sender-swap',
      recipient: `ผู้อำนวยการ${prevSenderOrg.replace('สำนักงาน', '') || 'หน่วยงาน'}`,
      organization: prevSenderOrg,
      address: prevSenderAddress,
      postalCode: prevSenderPostal,
      category: 'other',
      selected: true,
    };

    setSender(updatedSender);
    // If the sender exists in items, select it, otherwise update current item
    const existingIndex = items.findIndex((i) => i.id === updatedRecipient.id);
    if (existingIndex >= 0) {
      setSelectedId(items[existingIndex].id);
    } else {
      setItems((prev) => [updatedRecipient, ...prev]);
      setSelectedId(updatedRecipient.id);
    }

    try {
      localStorage.setItem('envelope_sender_info', JSON.stringify(updatedSender));
    } catch (e) {
      // ignore
    }

    showToast('สลับตำแหน่งผู้ส่งและผู้รับเรียบร้อย');
  };

  // Toggle single item selection
  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Toggle all selection
  const handleToggleSelectAll = (select: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: select })));
    showToast(select ? `เลือกทั้งสิ้น ${items.length} รายการ` : 'ยกเลิกการเลือกทั้งหมด');
  };

  // Update item in list
  const handleUpdateItem = (updated: RecipientItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    showToast(`อัปเดตข้อมูลซอง #${updated.id} สำเร็จ`);
  };

  // Add new custom item
  const handleAddNewItem = (newItem: RecipientItem) => {
    setItems((prev) => [newItem, ...prev]);
    setSelectedId(newItem.id);
    showToast(`เพิ่มรายชื่อ ${newItem.recipient} เรียบร้อย`);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast('ลบรายการเรียบร้อย');
  };

  // Import data from Google Sheets or CSV
  const handleImportData = (newItems: RecipientItem[], sourceName: string) => {
    setItems(newItems);
    if (newItems.length > 0) {
      setSelectedId(newItems[0].id);
    }
    showToast(`นำเข้าข้อมูลจาก ${sourceName} สำเร็จ (${newItems.length} รายการ)`);
  };

  // Execute direct system print synchronously without setTimeout
  const executeSystemPrint = (toPrint: RecipientItem[]) => {
    if (toPrint.length === 0) return;

    // 1. Synchronously update print items in React DOM
    flushSync(() => {
      setActivePrintItems(toPrint);
    });

    // 2. Open PrintStationModal so the user ALWAYS has the instant "แบบพร้อมปริ้น" on screen
    setPrintStationItems(toPrint);
    setIsPrintStationOpen(true);

    // 3. Immediately trigger window.print() synchronously within the active user gesture
    try {
      window.focus();
      window.print();
    } catch (e) {
      console.warn('Direct window.print() error:', e);
    }

    // 4. Also trigger print via hidden iframe in parallel
    printViaHiddenIframe(toPrint, sender, settings);
  };

  // Direct 1-Click Print (prints selected envelopes, or current envelope if none selected)
  const handleDirectPrint = () => {
    const selected = items.filter((i) => i.selected);
    const toPrint = selected.length > 0 ? selected : [currentItem];
    showToast(`สั่งพิมพ์ทันที (${toPrint.length} ซอง)...`);
    executeSystemPrint(toPrint);
  };

  // Print single envelope
  const handlePrintSingle = () => {
    showToast('สั่งพิมพ์ซองนี้ทันที...');
    executeSystemPrint([currentItem]);
  };

  // Print batch / selected
  const handleExecutePrint = (itemsToPrint: RecipientItem[]) => {
    if (itemsToPrint.length === 0) return;
    showToast(`สั่งพิมพ์ (${itemsToPrint.length} ซอง)...`);
    executeSystemPrint(itemsToPrint);
  };

  // Save current envelope as HTML
  const handleSaveSingleHtml = () => {
    downloadPrintableHtml(
      [currentItem],
      sender,
      settings,
      `ซองจดหมาย-${currentItem.organization || currentItem.recipient}.html`
    );
    showToast('ดาวน์โหลดไฟล์เอกสาร HTML เรียบร้อย');
  };

  // Save batch as HTML
  const handleSaveBatchHtml = () => {
    const selected = items.filter((i) => i.selected);
    const target = selected.length > 0 ? selected : [currentItem];
    downloadPrintableHtml(
      target,
      sender,
      settings,
      `พิมพ์ซองจดหมาย-${target.length}ซอง.html`
    );
    showToast(`ดาวน์โหลดไฟล์ HTML (${target.length} ซอง) เรียบร้อย`);
  };

  // Export CSV
  const handleExportCsv = () => {
    const selected = items.filter((i) => i.selected);
    const toExport = selected.length > 0 ? selected : items;
    exportToCsv(toExport, `รายชื่อผู้รับซองจดหมาย-${toExport.length}รายการ.csv`);
    showToast(`ส่งออกข้อมูล CSV (${toExport.length} รายการ) สำเร็จ`);
  };

  // Items for PrintArea: Always kept pre-synchronized
  const itemsForPrint = useMemo(() => {
    if (activePrintItems.length > 0) return activePrintItems;
    const selected = items.filter((i) => i.selected);
    return selected.length > 0 ? selected : [currentItem];
  }, [activePrintItems, items, currentItem]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Screen App Container (hidden during browser print) */}
      <div id="screen-app" className="flex flex-col h-full w-full overflow-hidden">
        {/* Top Header */}
        <TopBar
          selectedCount={selectedCount}
          totalCount={items.length}
          settings={settings}
          onUpdateFormat={handleUpdateFormat}
          onUpdateSettings={(updated) => setSettings({ ...settings, ...updated })}
          onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
          onOpenSenderSettings={() => setIsSenderSettingsOpen(true)}
          onOpenPrinterGuide={() => setIsPrinterGuideOpen(true)}
          onDirectPrint={handleDirectPrint}
          onBatchPrint={() => setIsBatchPrintOpen(true)}
          onBatchSaveHtml={handleSaveBatchHtml}
        />

        {/* Main Split Layout: Left Table + Right Envelope Canvas */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Search, Directory & Sender/Recipient Selection (420px) */}
          <div className="w-[430px] max-w-[48%] h-full shrink-0 flex flex-col">
            <DataTable
              items={items}
              selectedItem={currentItem}
              currentSender={sender}
              onSelectItem={(item) => setSelectedId(item.id)}
              onSetAsSender={handleSetAsSender}
              onSwapSenderRecipient={handleSwapSenderRecipient}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onAddNewItem={handleAddNewItem}
              onDeleteItem={handleDeleteItem}
              onExportCsv={handleExportCsv}
              onOpenGoogleSheet={() => setIsGoogleSheetsOpen(true)}
            />
          </div>

          {/* Right Panel: Interactive Envelope Canvas */}
          <div className="flex-1 h-full min-w-0">
            <EnvelopeView
              item={currentItem}
              sender={sender}
              settings={settings}
              onUpdateItem={handleUpdateItem}
              onUpdateSender={setSender}
              onUpdateSettings={(updated) => setSettings({ ...settings, ...updated })}
              onSwapSenderRecipient={handleSwapSenderRecipient}
              onOpenSenderModal={() => setIsSenderSettingsOpen(true)}
              onPrintSingle={handlePrintSingle}
              onSaveHtml={handleSaveSingleHtml}
            />
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Hidden Print Container: Activated during window.print() */}
      <PrintArea
        items={itemsForPrint}
        sender={sender}
        settings={settings}
      />

      {/* Modals */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        onImportData={handleImportData}
        currentCount={items.length}
      />

      <SenderSettingsModal
        isOpen={isSenderSettingsOpen}
        onClose={() => setIsSenderSettingsOpen(false)}
        sender={sender}
        settings={settings}
        items={items}
        onSaveSender={setSender}
        onSaveSettings={(updated) => setSettings({ ...settings, ...updated })}
      />

      <PrinterGuideModal
        isOpen={isPrinterGuideOpen}
        onClose={() => setIsPrinterGuideOpen(false)}
      />

      <BatchPrintModal
        isOpen={isBatchPrintOpen}
        onClose={() => setIsBatchPrintOpen(false)}
        items={items}
        currentItem={currentItem}
        sender={sender}
        settings={settings}
        onUpdateSettings={(updated) => setSettings({ ...settings, ...updated })}
        onExecutePrint={handleExecutePrint}
      />

      {/* Instant Print Station & Direct Printer Connect Modal */}
      <PrintStationModal
        isOpen={isPrintStationOpen}
        onClose={() => setIsPrintStationOpen(false)}
        items={printStationItems.length > 0 ? printStationItems : (items.filter((i) => i.selected).length > 0 ? items.filter((i) => i.selected) : [currentItem])}
        sender={sender}
        settings={settings}
        onDirectNativePrint={() => {
          try {
            window.focus();
            window.print();
          } catch (e) {
            console.warn(e);
          }
        }}
      />
    </div>
  );
}
