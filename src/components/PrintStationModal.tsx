import React, { useState } from 'react';
import { RecipientItem, SenderInfo, PrintSettings } from '../types';
import {
  X,
  Printer,
  ExternalLink,
  Download,
  CheckCircle2,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { GarudaEmblem } from './GarudaEmblem';
import { formatOneLineAddress, formatDocNumberLine } from '../utils/addressHelper';
import {
  openPrintTabDirectly,
  printViaHiddenIframe,
  downloadPrintableHtml,
} from '../utils/printHelpers';

interface PrintStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: RecipientItem[];
  sender: SenderInfo;
  settings: PrintSettings;
  onDirectNativePrint: () => void;
}

export const PrintStationModal: React.FC<PrintStationModalProps> = ({
  isOpen,
  onClose,
  items,
  sender,
  settings,
  onDirectNativePrint,
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  if (!isOpen || items.length === 0) return null;

  const isSmall = settings.format === 'small';
  const isLandscape = settings.orientation === 'landscape';

  // Dimension in millimeters:
  // For small envelope: 235 x 108 mm (landscape)
  // For A4 envelope: 297 x 210 mm (landscape default)
  const widthMm = isSmall ? (isLandscape ? 235 : 108) : (isLandscape ? 297 : 210);
  const heightMm = isSmall ? (isLandscape ? 108 : 235) : (isLandscape ? 210 : 297);

  // Garuda emblem height: 1.5 cm (15mm) for small envelope, 3 cm (30mm) for A4
  const garudaHeightMm = isSmall ? 15 : 30;
  const garudaWidthMm = Math.round(garudaHeightMm * (659 / 738) * 10) / 10;

  const currentItem = items[currentPage] || items[0];

  const addressLines = (currentItem.address || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const postalDigits = ((currentItem.postalCode || '')
    .replace(/\D/g, '')
    .padEnd(5, ' ')
    .slice(0, 5)
    .split(''));

  const senderOneLineAddress = formatOneLineAddress(sender.address, sender.postalCode);
  const senderDocNumberDisplay = formatDocNumberLine(
    settings.docNumberPrefix || 'ที่ ศธ ',
    sender.docNumber,
    settings.docNumberPlaceholder || '...................................................'
  );

  // Trigger System Print Dialog immediately
  const handleSystemPrint = () => {
    onDirectNativePrint();
    printViaHiddenIframe(items, sender, settings);
  };

  // Open Direct Print Tab with auto-trigger print dialog (no download needed)
  const handleOpenPrintTab = () => {
    openPrintTabDirectly(items, sender, settings);
  };

  // Download backup HTML
  const handleDownloadBackup = () => {
    downloadPrintableHtml(
      items,
      sender,
      settings,
      `ซองจดหมาย-${isSmall ? '10.8x23.5cm' : 'A4'}-${items.length}ซอง.html`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 md:p-6 no-print">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  สั่งพิมพ์ซองจดหมาย (เชื่อมต่อเครื่องพิมพ์โดยตรง)
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {items.length} ซอง
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isSmall ? 'ซองเล็ก 10.8 × 23.5 ซม.' : 'หน้าซอง A4 แนวนอน'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ฟอนต์ TH Sarabun PSK {settings.fontSizePt}pt (ปกติ ไม่หนา) · ครุฑสูง {garudaHeightMm / 10} ซม. สเกลจริง 100%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (Direct Print Buttons) */}
        <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Action 1: Call System Print Dialog */}
            <button
              onClick={handleSystemPrint}
              title="เรียกหน้าต่างสั่งพิมพ์ของเครื่องพิมพ์ทันทีในหน้านี้"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ทันที (System Print Dialog)</span>
            </button>

            {/* Primary Action 2: Open Dedicated Print Tab with Auto-Print (Guaranteed 100% works across all iframe environments without downloads) */}
            <button
              onClick={handleOpenPrintTab}
              title="เปิดหน้าพร้อมพิมพ์ในแท็บแยก และเรียกหน้าต่างเครื่องพิมพ์ทันทีอัตโนมัติ (ไม่ต้องดาวน์โหลดไฟล์)"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>เปิดหน้าต่างพิมพ์ตรง (เชื่อมเครื่องพิมพ์ทันที)</span>
            </button>

            {/* Optional Backup Download */}
            <button
              onClick={handleDownloadBackup}
              title="เซฟไฟล์ HTML สำรองไว้เปิดดูหรือพิมพ์ภายหลัง"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-normal rounded-lg transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>เซฟ HTML สำรอง</span>
            </button>
          </div>

          {/* Multi-page navigation */}
          {items.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-slate-300 font-medium px-1">
                ซองที่ {currentPage + 1} จาก {items.length}
              </span>
              <button
                disabled={currentPage >= items.length - 1}
                onClick={() => setCurrentPage((p) => Math.min(items.length - 1, p + 1))}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Tip Banner */}
        <div className="px-6 py-2 bg-blue-950/40 border-b border-blue-900/40 flex items-center justify-between text-[11px] text-blue-200 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>เคล็ดลับการตั้งค่าเครื่องพิมพ์:</strong> ในหน้าต่างสั่งพิมพ์ ให้เลือกขนาดกระดาษ <strong>{isSmall ? 'ซองจดหมาย C5/DL (10.8 × 23.5 ซม.)' : 'A4 แนวนอน'}</strong> และเลือกมาตราส่วนเป็น <strong>"100% / ตามขนาดจริง"</strong>
            </span>
          </div>
          <span className="text-blue-300/80">ระบบแสดงแบบพร้อมปริ้นขนาดจริงด้านล่าง</span>
        </div>

        {/* Visual "แบบพร้อมปริ้น" (Print-Ready Preview Canvas) */}
        <div className="flex-1 overflow-auto bg-slate-950/70 p-6 flex flex-col items-center justify-center">
          <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-1.5 font-medium">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>แบบซองพร้อมปริ้นจริง (True Print Format · TH Sarabun PSK {settings.fontSizePt}pt ปกติ):</span>
          </div>

          <div
            className="bg-white text-black shadow-2xl relative select-none font-sarabun transition-all duration-150"
            style={{
              width: `${widthMm}mm`,
              height: `${heightMm}mm`,
              maxWidth: '100%',
              aspectRatio: `${widthMm} / ${heightMm}`,
              boxSizing: 'border-box',
            }}
          >
            {/* SENDER 3-LINE BLOCK */}
            {settings.showSender && (
              <div
                style={{
                  position: 'absolute',
                  top: isSmall ? '8mm' : '14mm',
                  left: isSmall ? '10mm' : '16mm',
                  maxWidth: isSmall ? '150mm' : '180mm',
                }}
              >
                {/* Row 1: Garuda + Line 1 at feet level */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '3mm',
                  }}
                >
                  <div
                    style={{
                      width: `${garudaWidthMm}mm`,
                      height: `${garudaHeightMm}mm`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {settings.includeGarudaArtwork && settings.garudaStyle !== 'blank_reserved' ? (
                      <GarudaEmblem style={settings.garudaStyle} isPrint />
                    ) : null}
                  </div>

                  {/* Line 1: Organization at feet level (normal font weight) */}
                  <div
                    style={{
                      fontSize: `${settings.senderFontSizePt || 14}pt`,
                      fontWeight: 'normal',
                      lineHeight: '1.1',
                      paddingBottom: '0.5mm',
                      color: '#000',
                    }}
                  >
                    {sender.organization}
                  </div>
                </div>

                {/* Lines 2 & 3: Indented aligned with Line 1 */}
                <div
                  style={{
                    paddingLeft: `calc(${garudaWidthMm}mm + 3mm)`,
                  }}
                >
                  <div
                    style={{
                      fontSize: `${(settings.senderFontSizePt || 14) - 1}pt`,
                      fontWeight: 'normal',
                      lineHeight: '1.25',
                      color: '#000',
                      marginTop: '1mm',
                    }}
                  >
                    {senderOneLineAddress}
                  </div>
                  <div
                    style={{
                      fontSize: `${(settings.senderFontSizePt || 14) - 1}pt`,
                      fontWeight: 'normal',
                      lineHeight: '1.25',
                      color: '#000',
                      marginTop: '0.8mm',
                    }}
                  >
                    {senderDocNumberDisplay}
                  </div>
                </div>
              </div>
            )}

            {/* RECIPIENT BLOCK */}
            <div
              style={{
                position: 'absolute',
                top: isSmall ? '48mm' : '85mm',
                left: isSmall ? '102mm' : '120mm',
                right: isSmall ? '12mm' : '25mm',
                bottom: isSmall ? '8mm' : 'auto',
                fontSize: `${settings.fontSizePt}pt`,
                lineHeight: settings.lineHeight || 1.25,
                color: '#000',
                transform: `translate(${settings.recipientNudgeX}mm, ${settings.recipientNudgeY}mm)`,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  columnGap: '2.5mm',
                }}
              >
                <div style={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>เรียน</div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${settings.recipientParagraphGapMm ?? 0}mm`,
                  }}
                >
                  <div style={{ fontWeight: 'normal' }}>{currentItem.recipient}</div>
                  {currentItem.organization && (
                    <div style={{ fontWeight: 'normal' }}>{currentItem.organization}</div>
                  )}
                  <div style={{ lineHeight: settings.lineHeight || 1.25, fontWeight: 'normal' }}>
                    {addressLines.map((line, lIdx) => (
                      <div key={lIdx}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* POSTAL BOXES */}
              {settings.postalBoxMode !== 'none' && currentItem.postalCode && (
                <div
                  style={{
                    marginTop: isSmall ? '4mm' : '6mm',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div style={{ display: 'inline-flex', gap: '2.5mm' }}>
                    {postalDigits.map((digit, dIdx) => (
                      <div
                        key={dIdx}
                        style={{
                          width: '7mm',
                          height: '9mm',
                          border: '1.5px solid #dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: `${settings.fontSizePt}pt`,
                          fontWeight: 'normal',
                          color: '#000',
                        }}
                      >
                        {settings.postalBoxMode === 'filled' ? digit.trim() : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Envelope Footer Watermark */}
            <div
              style={{
                position: 'absolute',
                bottom: '3mm',
                left: '10mm',
                fontSize: '8pt',
                color: '#94a3b8',
                userSelect: 'none',
              }}
            >
              ขนาด {widthMm / 10} × {heightMm / 10} ซม. · เลขที่: #{currentItem.id} · ซองที่ {currentPage + 1}/{items.length}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            ระบบจัดวางตำแหน่งตามแบบฟอร์มหนังสือราชการไทย ถูกต้องตามระเบียบงานสารบรรณ
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handleSystemPrint}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ซองนี้ทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
