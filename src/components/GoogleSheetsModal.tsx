import React, { useState } from 'react';
import { RecipientItem } from '../types';
import {
  extractGoogleSheetId,
  getGoogleSheetCsvUrl,
  parseCSV,
  mapCsvRowsToRecipients,
} from '../utils/googleSheets';
import {
  X,
  FileSpreadsheet,
  Link,
  ClipboardPaste,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Database,
  Download,
} from 'lucide-react';
import { DEFAULT_DIRECTORY } from '../data/defaultDirectory';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportData: (items: RecipientItem[], sourceName: string) => void;
  currentCount: number;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  onImportData,
  currentCount,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'restore'>('url');
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [pasteContent, setPasteContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<RecipientItem[] | null>(null);
  const [detectedCols, setDetectedCols] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  if (!isOpen) return null;

  // Fetch Google Sheet via URL
  const handleFetchSheet = async () => {
    setErrorMessage(null);
    setPreviewItems(null);

    const trimmed = sheetUrl.trim();
    if (!trimmed) {
      setErrorMessage('กรุณาวางลิงก์ Google Sheet');
      return;
    }

    const { sheetId } = extractGoogleSheetId(trimmed);
    if (!sheetId && !trimmed.startsWith('http')) {
      setErrorMessage('รูปแบบลิงก์ Google Sheet ไม่ถูกต้อง');
      return;
    }

    setIsLoading(true);
    try {
      const csvUrl = getGoogleSheetCsvUrl(trimmed);
      const res = await fetch(csvUrl);

      if (!res.ok) {
        throw new Error(
          `ไม่สามารถดึงข้อมูลได้ (HTTP ${res.status}) ตรวจสอบว่าแชร์ชีตเป็น "ทุกคนที่มีลิงก์มีสิทธิ์ดู" แล้วหรือไม่`
        );
      }

      const text = await res.text();
      // Check if it's HTML login page rather than CSV
      if (text.includes('<!DOCTYPE html>') && text.includes('accounts.google.com')) {
        throw new Error(
          'Google Sheet นี้ต้องตั้งค่าการแชร์: ให้กดปุ่ม "แชร์ (Share)" ใน Google Sheets แล้วเลือก "ทุกคนที่มีลิงก์มีสิทธิ์ดู (Anyone with link can view)" หรือใช้แท็บ "คัดลอกมาวาง" ได้ทันทีครับ'
        );
      }

      const rows = parseCSV(text);
      if (rows.length < 2) {
        throw new Error('ไม่พบแถวข้อมูลในชีต หรือชีตว่างเปล่า');
      }

      const { items, detectedColumns } = mapCsvRowsToRecipients(rows);
      if (items.length === 0) {
        throw new Error('ไม่สามารถแปลงข้อมูลในชีตได้');
      }

      setPreviewItems(items);
      setDetectedCols(detectedColumns);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Google Sheet แนะนำให้ใช้แท็บ "คัดลอกมาวาง" เพื่อความสะดวกรวดเร็วครับ'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Parse pasted TSV/CSV content
  const handleParsePastedText = () => {
    setErrorMessage(null);
    setPreviewItems(null);

    const trimmed = pasteContent.trim();
    if (!trimmed) {
      setErrorMessage('กรุณาวางข้อมูลที่คัดลอกมาจาก Google Sheet หรือ Excel');
      return;
    }

    try {
      // If it contains tabs, convert tabs to commas with proper quote escaping
      let normalized = trimmed;
      if (trimmed.includes('\t')) {
        const lines = trimmed.split('\n');
        normalized = lines
          .map((line) => {
            const cells = line.split('\t');
            return cells
              .map((cell) => `"${cell.trim().replace(/"/g, '""')}"`)
              .join(',');
          })
          .join('\n');
      }

      const rows = parseCSV(normalized);
      if (rows.length < 1) {
        throw new Error('ไม่พบข้อมูล');
      }

      // Check if row 0 has header
      const { items, detectedColumns } = mapCsvRowsToRecipients(rows);
      if (items.length === 0) {
        throw new Error('ไม่พบรายการข้อมูลที่นำเข้าได้');
      }

      setPreviewItems(items);
      setDetectedCols(detectedColumns);
    } catch (err: any) {
      setErrorMessage(err.message || 'รูปแบบข้อมูลไม่ถูกต้อง');
    }
  };

  const handleConfirmImport = () => {
    if (previewItems && previewItems.length > 0) {
      const source =
        activeTab === 'url'
          ? 'Google Sheet ออนไลน์'
          : activeTab === 'paste'
          ? 'ข้อมูลที่คัดลอกมาวาง'
          : 'ฐานข้อมูลเริ่มต้น';
      onImportData(previewItems, source);
      onClose();
    }
  };

  const handleRestoreDefault = () => {
    onImportData(DEFAULT_DIRECTORY, 'ฐานข้อมูล สพท. 247 แห่ง');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                ดึงข้อมูลจาก Google Sheet / ฐานข้อมูล
              </h2>
              <p className="text-xs text-slate-400">
                รองรับลิงก์ Google Sheet, การคัดลอกตารางมาวาง และฐานข้อมูล สพท. 247 แห่ง
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

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/30 shrink-0">
          <button
            onClick={() => {
              setActiveTab('url');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>เชื่อมต่อด้วยลิงก์ URL</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('paste');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>คัดลอกเซลล์มาวาง (เร็ว & สะดวก)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('restore');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'restore'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>ฐานข้อมูล สพท. 247 แห่ง</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  วางลิงก์ Google Sheet:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=0"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    onClick={handleFetchSheet}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังโหลด...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>ดึงข้อมูล</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1.5 text-slate-400">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    วิธีตั้งค่าแชร์ Google Sheet:
                  </span>
                  <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-blue-400 hover:underline text-[11px]"
                  >
                    {showHelp ? 'ซ่อนคำแนะนำ' : 'ดูขั้นตอน'}
                  </button>
                </div>

                {showHelp && (
                  <div className="mt-2 space-y-1 text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                    <div>1. เปิดไฟล์ Google Sheets ของท่าน</div>
                    <div>2. กดปุ่มสีน้ำเงิน <strong>"แชร์ (Share)"</strong> ที่มุมบนขวา</div>
                    <div>3. ในส่วนการเข้าถึงทั่วไป เปลี่ยนเป็น <strong>"ทุกคนที่มีลิงก์ (Anyone with the link)"</strong> สิทธิ์: มีสิทธิ์ดู (Viewer)</div>
                    <div>4. กด <strong>"คัดลอกลิงก์ (Copy link)"</strong> แล้วนำมาวางในช่องด้านบนนี้ได้เลยครับ</div>
                  </div>
                )}

                <div className="pt-1 text-[11px] text-slate-500">
                  หัวตารางที่ระบบรองรับอัตโนมัติ: <code>เรียน</code>, <code>สพท.</code>, <code>ที่อยู่</code>, <code>เลขที่</code>, <code>รหัสไปรษณีย์</code>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  คัดลอกจาก Google Sheet / Excel แล้วกด Ctrl+V วางที่นี่:
                </label>
                <textarea
                  rows={6}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={`เรียน\tสพท.\tที่อยู่\nผู้อำนวยการ สพป.กระบี่\tสพป.กระบี่\tถนนกระบี่ ตำบลปากน้ำ 81000\nผู้อำนวยการ สพป.เชียงใหม่ เขต 1\tสพป.เชียงใหม่ เขต 1\tศาลากลางจังหวัด 50300`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  *เคล็ดลับ: ลากคลุมข้อมูลใน Google Sheets แล้วกด Ctrl+C แล้วมาวางที่นี่ได้ทันทีโดยไม่ต้องเปิดแชร์สาธารณะ
                </span>
                <button
                  onClick={handleParsePastedText}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ตรวจสอบข้อมูล</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'restore' && (
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    ฐานข้อมูลทางการ สพท. 247 แห่งทั่วประเทศ
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    ประกอบด้วย สพฐ. ส่วนกลาง, สำนักงานเขตพื้นที่การศึกษาประถมศึกษา (สพป.) 183 เขต
                    และสำนักงานเขตพื้นที่การศึกษามัธยมศึกษา (สพม.) 62 เขต พร้อมชื่อตำแหน่งผู้รับและที่อยู่รหัสไปรษณีย์ครบถ้วน
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  ข้อมูลปัจจุบันมี: <strong className="text-white">{currentCount} รายการ</strong>
                </span>
                <button
                  onClick={handleRestoreDefault}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>โหลดฐานข้อมูล สพท. 247 แห่ง</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Parsed Preview Data Table */}
          {previewItems && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">
                    พบข้อมูลทั้งหมด {previewItems.length} รายการ
                  </span>
                  {detectedCols.length > 0 && (
                    <span className="text-xs text-slate-400">
                      (คอลัมน์: {detectedCols.join(', ')})
                    </span>
                  )}
                </div>
                <button
                  onClick={handleConfirmImport}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                >
                  <span>นำเข้าข้อมูลนี้ ({previewItems.length} ซอง)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sample 5 rows */}
              <div className="border border-slate-800 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 font-medium">
                    <tr>
                      <th className="px-3 py-2">เลขที่</th>
                      <th className="px-3 py-2">เรียน</th>
                      <th className="px-3 py-2">สพท. / หน่วยงาน</th>
                      <th className="px-3 py-2">ที่อยู่</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {previewItems.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50">
                        <td className="px-3 py-1.5 font-mono text-slate-400">{row.id}</td>
                        <td className="px-3 py-1.5 font-medium text-white">{row.recipient}</td>
                        <td className="px-3 py-1.5">{row.organization}</td>
                        <td className="px-3 py-1.5 truncate max-w-xs">{row.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewItems.length > 5 && (
                <div className="text-[11px] text-slate-500 text-center">
                  และอีก {previewItems.length - 5} รายการ...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <div className="text-xs text-slate-500">
            {previewItems ? `พร้อมนำเข้า ${previewItems.length} รายการ` : 'เลือกแหล่งข้อมูลเพื่อนำเข้า'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            {previewItems && (
              <button
                onClick={handleConfirmImport}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                ยืนยันการนำเข้า
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
