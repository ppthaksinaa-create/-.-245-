import React, { useState } from 'react';
import { SenderInfo, PrintSettings, RecipientItem, GarudaStyle } from '../types';
import {
  X,
  Building2,
  Sliders,
  Check,
  ShieldCheck,
  Search,
  CheckCircle2,
  FileText,
  Mail,
  AlignJustify,
  MoveVertical,
} from 'lucide-react';
import { GarudaEmblem } from './GarudaEmblem';
import { formatOneLineAddress, formatDocNumberLine } from '../utils/addressHelper';

interface SenderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sender: SenderInfo;
  settings: PrintSettings;
  items: RecipientItem[];
  onSaveSender: (sender: SenderInfo) => void;
  onSaveSettings: (settings: Partial<PrintSettings>) => void;
}

export const SenderSettingsModal: React.FC<SenderSettingsModalProps> = ({
  isOpen,
  onClose,
  sender,
  settings,
  items,
  onSaveSender,
  onSaveSettings,
}) => {
  const [localSender, setLocalSender] = useState<SenderInfo>({ ...sender });
  const [localSettings, setLocalSettings] = useState<PrintSettings>({
    ...settings,
    lineHeight: settings.lineHeight ?? 1.25,
    recipientParagraphGapMm: settings.recipientParagraphGapMm ?? 0,
  });
  const [senderSearch, setSenderSearch] = useState<string>('');
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'spacing' | 'sender' | 'garuda' | 'postal' | 'all'>('spacing');

  if (!isOpen) return null;

  const handleSelectSenderFromDirectory = (item: RecipientItem) => {
    setLocalSender({
      ...localSender,
      id: item.id,
      organization: item.organization,
      address: item.address,
      postalCode: item.postalCode || '',
    });
    setIsPickerOpen(false);
  };

  const handleSave = () => {
    onSaveSender(localSender);
    onSaveSettings(localSettings);
    try {
      localStorage.setItem('envelope_sender_info', JSON.stringify(localSender));
      localStorage.setItem('envelope_print_settings', JSON.stringify(localSettings));
    } catch (e) {
      // ignore
    }
    onClose();
  };

  const filteredDirectory = items
    .filter((i) => {
      if (!senderSearch.trim()) return true;
      const q = senderSearch.toLowerCase();
      return (
        i.organization.toLowerCase().includes(q) ||
        i.address.toLowerCase().includes(q) ||
        i.recipient.toLowerCase().includes(q) ||
        (i.province && i.province.toLowerCase().includes(q))
      );
    })
    .slice(0, 15);

  const previewOneLineAddress = formatOneLineAddress(localSender.address, localSender.postalCode);
  const previewDocNumber = formatDocNumberLine(
    localSettings.docNumberPrefix || 'ที่ ศธ ',
    localSender.docNumber,
    localSettings.docNumberPlaceholder || '...................................................'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                ตั้งค่าซองจดหมาย ระยะห่าง & ผู้ส่ง
              </h2>
              <p className="text-xs text-slate-400">
                ระยะห่างบรรทัด (Line Height) · ช่องว่างย่อหน้าผู้รับ · ผู้ส่ง 3 บรรทัด · ตราครุฑ
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-950/90 border-b border-slate-800 shrink-0 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('spacing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'spacing'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5 text-emerald-300" />
            <span>ระยะห่างบรรทัด & ผู้รับ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sender')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'sender'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ผู้ส่ง 3 บรรทัด</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('garuda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'garuda'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>ตราครุฑพ่าห์</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('postal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'postal'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-red-400" />
            <span>ตารางแดง รหัส ปณ.</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>ดูทั้งหมด</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section: Line Height & Recipient Paragraph Spacing */}
          {(activeTab === 'spacing' || activeTab === 'all') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <AlignJustify className="w-4 h-4 text-emerald-400" />
                  <span>ระยะห่างบรรทัด (Line Height) และช่องว่างระหว่างย่อหน้าผู้รับ</span>
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                  Line: {Number(localSettings.lineHeight).toFixed(2)} | Gap: {(localSettings.recipientParagraphGapMm ?? 0).toFixed(1)} มม.
                </span>
              </div>

              {/* Live Interactive Preview Box for Recipient */}
              <div className="p-4 bg-white rounded-lg border border-slate-300 shadow-sm font-sarabun text-slate-900 select-none">
                <div className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>ตัวอย่างผลลัพธ์ส่วนผู้รับตามค่าที่กำลังตั้ง:</span>
                  <span className="text-emerald-700 font-mono text-[11px] font-semibold">
                    Line Height: {Number(localSettings.lineHeight).toFixed(2)} · ช่องว่างย่อหน้า: {(localSettings.recipientParagraphGapMm ?? 0).toFixed(1)} มม.
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr',
                      columnGap: '10px',
                    }}
                  >
                    <div className="font-bold whitespace-nowrap text-black">เรียน</div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: `${localSettings.recipientParagraphGapMm ?? 0}mm`,
                        lineHeight: localSettings.lineHeight,
                      }}
                    >
                      <div className="font-bold text-black">ผู้อำนวยการสำนักงานเขตพื้นที่การศึกษากรุงเทพมหานคร</div>
                      <div className="font-semibold text-slate-900">
                        สำนักงานเขตพื้นที่การศึกษากรุงเทพมหานคร
                      </div>
                      <div>
                        <div>304/2 ถนนศรีอยุธยา แขวงทุ่งพญาไท</div>
                        <div>เขตราชเทวี กรุงเทพมหานคร</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 font-sans flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>*หากไม่ต้องการให้มีช่องว่างระหว่างชื่อสำนักงานกับที่อยู่ ให้ตั้ง "ช่องว่างระหว่างย่อหน้า" เป็น 0 มม.</span>
                </div>
              </div>

              {/* Setting 1: Line Height */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white flex items-center gap-1.5">
                      <MoveVertical className="w-3.5 h-3.5 text-emerald-400" />
                      <span>1. ระยะห่างบรรทัด (Line Height)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ควบคุมความสูงของบรรทัดทั้งหมด (แนะนำ 1.15 - 1.25 สำหรับหนังสือราชการ)
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-800">
                    {Number(localSettings.lineHeight).toFixed(2)} เท่า
                  </div>
                </div>

                {/* Line Height Slider & Stepper */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 shrink-0">0.95x</span>
                  <input
                    type="range"
                    min="0.95"
                    max="1.80"
                    step="0.05"
                    value={localSettings.lineHeight}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, lineHeight: parseFloat(e.target.value) })
                    }
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 shrink-0">1.80x</span>
                  <input
                    type="number"
                    min="0.9"
                    max="2.2"
                    step="0.05"
                    value={localSettings.lineHeight}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        lineHeight: parseFloat(e.target.value) || 1.25,
                      })
                    }
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-center text-white font-mono"
                  />
                </div>

                {/* Preset Buttons for Line Height */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500 mr-1">ระดับสำเร็จรูป:</span>
                  {[
                    { label: 'ชิดมาก (1.0x)', val: 1.0 },
                    { label: 'กระชับ (1.10x)', val: 1.1 },
                    { label: 'พอดี (1.15x)', val: 1.15 },
                    { label: 'มาตรฐาน (1.25x)', val: 1.25 },
                    { label: 'โปร่ง (1.35x)', val: 1.35 },
                    { label: 'กว้าง (1.50x)', val: 1.5 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, lineHeight: preset.val })}
                      className={`px-2 py-1 rounded text-[11px] transition-colors ${
                        Math.abs(localSettings.lineHeight - preset.val) < 0.02
                          ? 'bg-emerald-600 text-white font-medium shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting 2: Recipient Paragraph / Section Gap */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white flex items-center gap-1.5">
                      <AlignJustify className="w-3.5 h-3.5 text-emerald-400" />
                      <span>2. ช่องว่างระหว่างย่อหน้าผู้รับ (ชื่อ สพท. กับ ที่อยู่)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ระยะห่างระหว่างชื่อผู้รับ, ชื่อสำนักงาน และที่อยู่ (ตั้งเป็น 0 มม. เพื่อให้ชิดติดกันพอดี)
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-800">
                    {(localSettings.recipientParagraphGapMm ?? 0).toFixed(1)} มม.
                  </div>
                </div>

                {/* Paragraph Gap Slider & Stepper */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 shrink-0">0 มม.</span>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.5"
                    value={localSettings.recipientParagraphGapMm ?? 0}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        recipientParagraphGapMm: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 shrink-0">6 มม.</span>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    value={localSettings.recipientParagraphGapMm ?? 0}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        recipientParagraphGapMm: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-center text-white font-mono"
                  />
                </div>

                {/* Preset Buttons for Paragraph Gap */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500 mr-1">ระดับสำเร็จรูป:</span>
                  {[
                    { label: '0 มม. (ชิดติดกันพอดี)', val: 0 },
                    { label: '0.5 มม. (ชิดมาก)', val: 0.5 },
                    { label: '1.0 มม. (พอดี)', val: 1.0 },
                    { label: '1.5 มม.', val: 1.5 },
                    { label: '2.0 มม. (เว้นวรรคชัด)', val: 2.0 },
                    { label: '3.0 มม.', val: 3.0 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, recipientParagraphGapMm: preset.val })
                      }
                      className={`px-2 py-1 rounded text-[11px] transition-colors ${
                        (localSettings.recipientParagraphGapMm ?? 0) === preset.val
                          ? 'bg-emerald-600 text-white font-medium shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Live Preview Box of the 3 Lines with Garuda (visible in Sender, Garuda, or All tab) */}
          {(activeTab === 'sender' || activeTab === 'garuda' || activeTab === 'all') && (
            <div className="p-4 bg-white rounded-lg border border-slate-300 shadow-sm font-sarabun text-slate-900 select-none">
              <div className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2">
                ตัวอย่างข้อความผู้ส่ง 3 บรรทัดจริงบนซอง:
              </div>
              <div className="flex items-end gap-3 pb-1 border-b border-slate-200">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                  <GarudaEmblem style={localSettings.garudaStyle} size={38} />
                </div>
                <div className="font-bold text-base leading-none text-black">
                  {localSender.organization || 'ชื่อสำนักงานเขตพื้นที่การศึกษา (สพท.)'}
                </div>
              </div>
              <div className="mt-1.5 text-xs text-slate-800 truncate">
                {previewOneLineAddress || 'ที่อยู่และรหัสไปรษณีย์ รวมในบรรทัดเดียว (ไม่แสดงเบอร์โทร)'}
              </div>
              <div className="mt-0.5 text-xs text-slate-800">
                {previewDocNumber}
              </div>
            </div>
          )}

          {/* Section 1: Attached Garuda Emblem (ตราครุฑตามแนบ) */}
          {(activeTab === 'garuda' || activeTab === 'all') && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>ตราครุฑพ่าห์ราชการ (ตามรูปแนบ)</span>
              </h3>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3 text-xs">
                <div className="flex items-start gap-4">
                  {/* Garuda Preview Thumbnail */}
                  <div className="w-16 h-16 bg-white rounded-lg border border-slate-300 p-1 flex items-center justify-center shrink-0 shadow-xs">
                    <GarudaEmblem style={localSettings.garudaStyle} size={54} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="font-medium text-white">เลือกรูปแบบตราครุฑ:</div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        {
                          id: 'attached_black',
                          title: 'ตราครุฑตามแนบ (สีดำโปร่งใส - แนะนำ)',
                          desc: 'ลายเส้นคมชัด ไม่มีพื้นหลังสีดำ เหมาะสำหรับพิมพ์บนซองขาว',
                        },
                        {
                          id: 'attached_original',
                          title: 'ตราครุฑตามแนบ (ภาพต้นฉบับ)',
                          desc: 'ภาพขาวบนพื้นหลังดำตามไฟล์แนบ',
                        },
                        {
                          id: 'blank_reserved',
                          title: 'เว้นที่ว่างไว้ (ไม่พิมพ์ตราครุฑ)',
                          desc: 'เว้นเป็นพื้นที่ว่างล้วน ไม่มีกรอบและไม่มีคำอธิบาย สำหรับซองที่มีตราครุฑอยู่แล้ว',
                        },
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() =>
                            setLocalSettings({
                              ...localSettings,
                              garudaStyle: g.id as GarudaStyle,
                              includeGarudaArtwork: g.id !== 'blank_reserved',
                              reserveLogo: true,
                            })
                          }
                          className={`text-left p-2 rounded border transition-colors flex items-start justify-between ${
                            localSettings.garudaStyle === g.id
                              ? 'bg-blue-950/60 border-blue-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-white">{g.title}</div>
                            <div className="text-[11px] text-slate-400">{g.desc}</div>
                          </div>
                          {localSettings.garudaStyle === g.id && (
                            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-slate-400 block mb-1">
                      ความกว้างตราครุฑ (มม.):
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={localSettings.logoWidthMm}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          logoWidthMm: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">
                      ความสูงตราครุฑ (มม.):
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={localSettings.logoHeightMm}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          logoHeightMm: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: 3-Line Sender Form */}
          {(activeTab === 'sender' || activeTab === 'all') && (
            <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>ข้อมูลผู้ส่ง 3 บรรทัด (ไม่มีคำว่าผู้ส่ง)</span>
              </h3>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.showSender}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, showSender: e.target.checked })
                  }
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span>แสดงข้อมูลผู้ส่ง</span>
              </label>
            </div>

            {localSettings.showSender && (
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3.5 text-xs">
                {/* Quick Select from 247 list */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-medium">
                      เลือกจากลิสต์ สพท. 247 แห่ง:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(!isPickerOpen)}
                      className="text-blue-400 hover:underline text-xs"
                    >
                      {isPickerOpen ? 'ปิดค้นหา' : 'ค้นหาในลิสต์'}
                    </button>
                  </div>

                  {isPickerOpen && (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 space-y-2 mb-3">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={senderSearch}
                          onChange={(e) => setSenderSearch(e.target.value)}
                          placeholder="พิมพ์ชื่อ สพป., สพม. หรือจังหวัด..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y divide-slate-800">
                        {filteredDirectory.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectSenderFromDirectory(item)}
                            className="p-2 hover:bg-slate-800 cursor-pointer rounded transition-colors"
                          >
                            <div className="font-semibold text-white">{item.organization}</div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {item.address.replace(/\n/g, ' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* บรรทัดที่ 1: ชื่อ สพท. */}
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">
                    บรรทัดที่ 1: ชื่อ สพท. (อยู่ระดับเดียวกับเท้าครุฑ):
                  </label>
                  <input
                    type="text"
                    value={localSender.organization}
                    onChange={(e) =>
                      setLocalSender({ ...localSender, organization: e.target.value })
                    }
                    placeholder="เช่น สำนักงานเขตพื้นที่การศึกษาประถมศึกษากระบี่"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                  />
                </div>

                {/* บรรทัดที่ 2: ที่อยู่ และ รหัส ปณ. */}
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">
                    บรรทัดที่ 2: ที่อยู่และรหัส ปณ. (ไว้ในบรรทัดเดียวกัน ไม่ต้องใส่เบอร์):
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={localSender.address}
                      onChange={(e) =>
                        setLocalSender({ ...localSender, address: e.target.value })
                      }
                      placeholder="เช่น ถนนกระบี่ ตำบลปากน้ำ อำเภอเมือง จังหวัดกระบี่"
                      className="col-span-3 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                    />
                    <input
                      type="text"
                      maxLength={5}
                      value={localSender.postalCode}
                      onChange={(e) =>
                        setLocalSender({ ...localSender, postalCode: e.target.value })
                      }
                      placeholder="รหัส ปณ."
                      className="col-span-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white font-mono text-center"
                    />
                  </div>
                </div>

                {/* บรรทัดที่ 3: ที่ ศธ  */}
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">
                    บรรทัดที่ 3: คำว่า ที่ ศธ (เว้นให้ใส่เลขที่หนังสือ):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={localSettings.docNumberPrefix}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, docNumberPrefix: e.target.value })
                      }
                      placeholder="ที่ ศธ "
                      className="col-span-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white font-medium"
                    />
                    <input
                      type="text"
                      value={localSender.docNumber || ''}
                      onChange={(e) =>
                        setLocalSender({ ...localSender, docNumber: e.target.value })
                      }
                      placeholder="ระบุเลขที่หนังสือ (ถ้ามี หรือปล่อยว่างเพื่อพิมพ์จุดประ)"
                      className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    *ถ้าเว้นว่างไว้ ระบบจะพิมพ์เป็นจุดประ (..............................) เพื่อให้เขียนหรือประทับตรายาง
                  </div>
                </div>

                {/* Sender Font Size */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">ขนาดตัวอักษรผู้ส่ง (pt):</span>
                  <div className="flex items-center gap-1">
                    {[12, 13, 14, 15, 16].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() =>
                          setLocalSettings({ ...localSettings, senderFontSizePt: sz })
                        }
                        className={`px-2 py-0.5 rounded text-xs transition-colors ${
                          localSettings.senderFontSizePt === sz
                            ? 'bg-blue-600 text-white font-medium'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {sz}pt
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Section 3: Postal Code Box Mode (เลือกใส่เลข ปณ. ในตารางแดงหรือไม่) */}
          {(activeTab === 'postal' || activeTab === 'all') && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-400" />
                <span>การแสดงรหัสไปรษณีย์ในตารางสีแดงของผู้รับ</span>
              </h3>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2 text-xs">
                <div className="font-medium text-white mb-1">
                  เลือกรูปแบบการแสดงกล่องรหัสไปรษณีย์ 5 ช่อง:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      id: 'filled',
                      title: 'ใส่ตัวเลขรหัส ปณ. ในกล่องสีแดง (แนะนำ)',
                      desc: 'พิมพ์ตัวเลข 5 หลักลงในช่องตารางสีแดงให้อัตโนมัติ',
                    },
                    {
                      id: 'empty',
                      title: 'แสดงเฉพาะกล่องเปล่าสีแดง (ไม่ใส่ตัวเลข)',
                      desc: 'พิมพ์กล่องสีแดงเปล่า 5 ช่องไว้สำหรับเขียนด้วยลายมือหรือประทับตรา',
                    },
                    {
                      id: 'none',
                      title: 'ไม่แสดงกล่องสีแดง',
                      desc: 'แสดงรหัสไปรษณีย์ต่อท้ายที่อยู่ตามปกติ ไม่พิมพ์ตารางสีแดง',
                    },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          postalBoxMode: mode.id as any,
                        })
                      }
                      className={`text-left p-2.5 rounded border transition-colors flex items-start justify-between ${
                        localSettings.postalBoxMode === mode.id
                          ? 'bg-blue-950/60 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white">{mode.title}</div>
                        <div className="text-[11px] text-slate-400">{mode.desc}</div>
                      </div>
                      {localSettings.postalBoxMode === mode.id && (
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <div className="text-xs text-slate-500">
            ระบบจะจดจำการตั้งค่านี้ไว้ในเครื่องของท่าน
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
