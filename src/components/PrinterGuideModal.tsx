import React from 'react';
import { X, Printer, FileDown, CheckCircle, Lightbulb, Settings } from 'lucide-react';

interface PrinterGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrinterGuideModal: React.FC<PrinterGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                วิธีสั่งพิมพ์และบันทึกไฟล์ (Print & Save Guide)
              </h2>
              <p className="text-xs text-slate-400">
                คำแนะนำการตั้งค่าเครื่องพิมพ์และบันทึกเป็นไฟล์ PDF
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300">
          {/* Tip 1: How to Save as PDF */}
          <div className="p-4 bg-blue-950/30 border border-blue-800/60 rounded-lg space-y-2">
            <div className="flex items-center gap-2 font-semibold text-blue-300 text-sm">
              <FileDown className="w-4 h-4 text-blue-400" />
              <span>วิธีเซฟเป็นไฟล์ PDF (Save as PDF)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
              <li>
                กดปุ่ม <strong>"สั่งพิมพ์ (Print)"</strong> ในโปรแกรม
              </li>
              <li>
                ในหน้าต่างพิมพ์ของเบราว์เซอร์ ที่หัวข้อ <strong>"ปลายทาง (Destination)"</strong> ให้เปลี่ยนจากชื่อเครื่องพิมพ์เป็น <strong>"บันทึกเป็น PDF (Save as PDF)"</strong>
              </li>
              <li>
                กดปุ่ม <strong>"บันทึก (Save)"</strong> ท่านจะได้ไฟล์ PDF ความคมชัดสูง ตัวหนังสือ TH Sarabun PSK คมชัด 100%
              </li>
              <li>
                หรือท่านสามารถกดปุ่ม <strong>"ดาวน์โหลดไฟล์ HTML"</strong> เพื่อเปิดพิมพ์ออฟไลน์ได้ทุกเครื่อง
              </li>
            </ol>
          </div>

          {/* Tip 2: Small Envelope 10.8 x 23.5 cm */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-300 text-sm">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>การใส่ซองจดหมายเล็ก 10.8 × 23.5 ซม. ที่เครื่องพิมพ์</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>การป้อนซอง:</strong> เครื่องพิมพ์ส่วนใหญ่ (Epson, Canon, Brother, HP) จะมีตัวเลื่อนปรับความกว้างถาดป้อนกระดาษ ให้ปรับบีบเข้ามาพอดีกับความกว้างซอง
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>การวางซอง:</strong> ให้เอาด้านหน้าซอง (ด้านที่จะพิมพ์) หงายหรือคว่ำตามสัญลักษณ์ลูกศรของเครื่องพิมพ์ และเอาด้านที่ปิดผนึก (ฝาซอง) ไว้ด้านหลัง
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>สลับแนวนอน/แนวตั้ง:</strong> หากเครื่องพิมพ์ของท่านป้อนซองตามยาวหรือตามขวาง สามารถกดปุ่ม <strong>"สลับแนวนอน/แนวตั้ง"</strong> บนแถบเครื่องมือได้ทันที
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ปรับระยะ Nudge:</strong> หากพิมพ์แล้วตัวหนังสือเยื้องไปเล็กน้อย สามารถกดไอคอนลูกศรสี่ทิศ <Settings className="w-3 h-3 inline" /> เพื่อเลื่อนตำแหน่งเป็นมิลลิเมตรได้เลย
                </span>
              </li>
            </ul>
          </div>

          {/* Tip 3: Print Dialog Settings */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
            <div className="font-semibold text-white text-sm">การตั้งค่าในหน้าต่างพิมพ์ (Print Dialog)</div>
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <div className="font-medium text-white mb-0.5">ระยะขอบ (Margins)</div>
                <div className="text-[11px] text-slate-400">เลือกเป็น <strong>"ไม่มี (None)"</strong> หรือ <strong>"ต่ำสุด (Minimum)"</strong></div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <div className="font-medium text-white mb-0.5">มาตราส่วน (Scale)</div>
                <div className="text-[11px] text-slate-400">เลือกเป็น <strong>"พอดีกับกระดาษ"</strong> หรือ <strong>100%</strong></div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <div className="font-medium text-white mb-0.5">ส่วนหัวและส่วนท้าย</div>
                <div className="text-[11px] text-slate-400"><strong>เอาเครื่องหมายถูกออก</strong> เพื่อไม่ให้พิมพ์วันที่/URL ออกมา</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <div className="font-medium text-white mb-0.5">กราฟิกพื้นหลัง</div>
                <div className="text-[11px] text-slate-400"><strong>ทำเครื่องหมายถูก</strong> (เพื่อให้พิมพ์สีกรอบรหัสไปรษณีย์ได้ครบถ้วน)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
    </div>
  );
};
