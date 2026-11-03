import React from 'react';
import { EnvelopeFormat, PrintSettings } from '../types';
import {
  Printer,
  FileSpreadsheet,
  Sliders,
  HelpCircle,
  Download,
  Mail,
  FileText,
  ChevronDown,
} from 'lucide-react';

interface TopBarProps {
  selectedCount: number;
  totalCount: number;
  settings: PrintSettings;
  onUpdateFormat: (format: EnvelopeFormat) => void;
  onUpdateSettings?: (settings: Partial<PrintSettings>) => void;
  onOpenGoogleSheets: () => void;
  onOpenSenderSettings: () => void;
  onOpenPrinterGuide: () => void;
  onDirectPrint: () => void;
  onBatchPrint: () => void;
  onBatchSaveHtml: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedCount,
  totalCount,
  settings,
  onUpdateFormat,
  onUpdateSettings,
  onOpenGoogleSheets,
  onOpenSenderSettings,
  onOpenPrinterGuide,
  onDirectPrint,
  onBatchPrint,
  onBatchSaveHtml,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950 border-b border-slate-800 text-white shrink-0 select-none">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
          <Mail className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold tracking-tight text-white">
            พิมพ์ซองจดหมายราชการ
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            TH Sarabun PSK {settings.fontSizePt}pt
          </span>
        </div>
      </div>

      {/* Zone 2: Nav / Quick Mode Links (4-5 single line items) */}
      <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-300">
        {/* Envelope Type Toggle */}
        <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => onUpdateFormat('small')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              settings.format === 'small'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>ซองเล็ก (10.8 × 23.5 ซม.)</span>
          </button>
          <button
            onClick={() => onUpdateFormat('a4')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              settings.format === 'a4'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>หน้าซอง A4 แนวนอน (29.7 × 21 ซม.)</span>
          </button>
        </div>

        <button
          onClick={onOpenGoogleSheets}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 text-slate-300"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>ดึง Google Sheet</span>
        </button>

        <button
          onClick={onOpenSenderSettings}
          title="ตั้งค่าผู้ส่ง 3 บรรทัด, ตราครุฑ, ระยะห่างบรรทัด (Line Height) และช่องว่างผู้รับ"
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 text-slate-300"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>ตั้งค่าผู้ส่ง, ตราครุฑ & ระยะห่าง</span>
        </button>

        <button
          onClick={onOpenPrinterGuide}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 text-slate-400"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>วิธีพิมพ์ & เซฟ PDF</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action (Direct 1-Click Print + Save HTML) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Recipient Font Size Picker */}
        {onUpdateSettings && (
          <div className="hidden xl:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-300">
            <span className="px-2 text-slate-400 font-sans text-[11px]">ฟอนต์ผู้รับ:</span>
            {[14, 16, 18, 20, 22].map((sz) => (
              <button
                key={sz}
                onClick={() => onUpdateSettings({ fontSizePt: sz })}
                title={`ปรับขนาดฟอนต์ผู้รับเป็น ${sz}pt (คงที่ขณะพิมพ์)`}
                className={`px-2 py-1 rounded transition-colors text-xs ${
                  settings.fontSizePt === sz
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                {sz}pt
              </button>
            ))}
          </div>
        )}

        {/* Secondary option: Save backup HTML file */}
        <button
          onClick={onBatchSaveHtml}
          title="เซฟเป็นไฟล์เอกสาร HTML สำรองสำหรับเปิดดูหรือพิมพ์ภายหลัง"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-normal rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>เซฟ HTML สำรอง</span>
        </button>

        {/* 1-Click Direct Print to Printer */}
        <div className="flex items-center shadow-sm">
          <button
            onClick={onDirectPrint}
            title="สั่งพิมพ์ทันที — เชื่อมตรงไปยังเครื่องพิมพ์ของคุณโดยตรง ไม่ต้องดาวน์โหลดไฟล์"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-l-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>สั่งพิมพ์ทันที ({selectedCount > 0 ? selectedCount : '1'} ซอง)</span>
          </button>
          <button
            onClick={onBatchPrint}
            title="เปิดตัวเลือกขอบเขตการพิมพ์และตรวจสเปกเพิ่มเติม"
            className="px-2.5 py-2 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white text-xs rounded-r-lg border-l border-blue-500 transition-colors shrink-0"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
