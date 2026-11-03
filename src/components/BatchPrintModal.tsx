import React, { useState } from 'react';
import { RecipientItem, SenderInfo, PrintSettings } from '../types';
import {
  X,
  Printer,
  FileDown,
  Download,
  CheckCircle,
  FileText,
  Mail,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { downloadPrintableHtml } from '../utils/printHelpers';

interface BatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: RecipientItem[];
  currentItem: RecipientItem;
  sender: SenderInfo;
  settings: PrintSettings;
  onUpdateSettings: (settings: Partial<PrintSettings>) => void;
  onExecutePrint: (itemsToPrint: RecipientItem[]) => void;
}

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({
  isOpen,
  onClose,
  items,
  currentItem,
  sender,
  settings,
  onUpdateSettings,
  onExecutePrint,
}) => {
  const selectedItems = items.filter((i) => i.selected);
  const defaultScope = selectedItems.length > 0 ? 'selected' : 'current';
  const [printScope, setPrintScope] = useState<'selected' | 'current' | 'all'>(defaultScope);

  if (!isOpen) return null;

  const targetItems =
    printScope === 'selected'
      ? selectedItems.length > 0
        ? selectedItems
        : [currentItem]
      : printScope === 'all'
      ? items
      : [currentItem];

  const handlePrint = () => {
    onExecutePrint(targetItems);
    onClose();
  };

  const handleSaveHtml = () => {
    downloadPrintableHtml(
      targetItems,
      sender,
      settings,
      `ซองจดหมาย-${settings.format === 'small' ? '10.8x23.5cm' : 'A4'}-${targetItems.length}ซอง.html`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                เตรียมสั่งพิมพ์และบันทึกไฟล์
              </h2>
              <p className="text-xs text-slate-400">
                เลือกจำนวนซองและรูปแบบที่ต้องการสั่งพิมพ์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300">
          {/* Scope Selector */}
          <div className="space-y-2">
            <label className="text-slate-200 font-semibold block">
              1. เลือกขอบเขตรายการที่จะพิมพ์:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPrintScope('selected')}
                disabled={selectedItems.length === 0}
                className={`p-3 rounded-lg border text-left transition-all ${
                  printScope === 'selected'
                    ? 'bg-blue-950/50 border-blue-500 text-white shadow-xs'
                    : selectedItems.length === 0
                    ? 'opacity-40 border-slate-800 bg-slate-950 text-slate-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-white">ที่เลือกไว้</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {selectedItems.length} ซอง
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPrintScope('current')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  printScope === 'current'
                    ? 'bg-blue-950/50 border-blue-500 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-white">ซองปัจจุบัน</div>
                <div className="text-[11px] text-slate-400 mt-1">1 ซอง (ที่เปิดดู)</div>
              </button>

              <button
                type="button"
                onClick={() => setPrintScope('all')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  printScope === 'all'
                    ? 'bg-blue-950/50 border-blue-500 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-white">ทั้งหมด</div>
                <div className="text-[11px] text-slate-400 mt-1">{items.length} ซอง</div>
              </button>
            </div>
          </div>

          {/* Verification Specs Box */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>2. รายละเอียดสเปกการพิมพ์:</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                รวม {targetItems.length} ซอง ({targetItems.length} หน้า)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  ขนาด:{' '}
                  <strong>
                    {settings.format === 'small'
                      ? 'ซองเล็ก (10.8 × 23.5 ซม. · ครุฑ 1.5 ซม.)'
                      : 'A4 แนวนอน (29.7 × 21.0 ซม. · ครุฑ 3 ซม.)'}
                  </strong>
                </span>
              </div>
              <div className="flex flex-col gap-1 col-span-2 bg-slate-900/60 p-2 rounded border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      ฟอนต์ผู้รับ: <strong>TH Sarabun PSK {settings.fontSizePt}pt (คงที่ขณะพิมพ์)</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[14, 16, 18, 20, 22].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => onUpdateSettings({ fontSizePt: sz })}
                        className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                          settings.fontSizePt === sz
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sz}pt
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">
                  ระบบล็อกขนาดตัวอักษร 100% สเกลคงที่ ไม่มีการย่อหรือขยายขนาดขณะสั่งพิมพ์
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  ตราครุฑ:{' '}
                  <strong>
                    {settings.includeGarudaArtwork
                      ? 'พิมพ์รูปตราครุฑ'
                      : 'เว้นว่างไว้ (ไม่พิมพ์ทับ)'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  ทิศทาง:{' '}
                  <strong>{settings.orientation === 'landscape' ? 'แนวนอน' : 'แนวตั้ง'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Direct Print Tip */}
          <div className="p-3 bg-blue-950/30 border border-blue-900/60 rounded-lg text-xs space-y-1 text-blue-300">
            <div className="font-semibold flex items-center gap-1.5 text-white">
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>การเชื่อมต่อเครื่องพิมพ์โดยตรง:</span>
            </div>
            <p className="text-[11px] text-slate-300">
              เมื่อกดปุ่ม <strong>"สั่งพิมพ์ทันที"</strong> ระบบจะเปิดหน้าต่างสั่งพิมพ์ของเครื่องพิมพ์ทันที โดยไม่ต้องดาวน์โหลดไฟล์ใดๆ (หากต้องการเซฟเป็นไฟล์ PDF สามารถเลือกเครื่องพิมพ์เป็น <strong>"Save as PDF"</strong> ในหน้าต่างนั้นได้เช่นกัน)
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            ยกเลิก
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveHtml}
              title="เซฟไฟล์เอกสาร HTML สำรองไว้เปิดดูออฟไลน์"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-normal rounded-lg transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>เซฟไฟล์ HTML สำรอง</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ทันที ({targetItems.length} ซอง)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
