import React, { useState } from 'react';
import { RecipientItem, SenderInfo, PrintSettings, GarudaStyle, PostalBoxMode } from '../types';
import { GarudaEmblem } from './GarudaEmblem';
import { formatOneLineAddress, formatDocNumberLine } from '../utils/addressHelper';
import {
  Printer,
  Download,
  Settings2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Edit3,
  Check,
  RotateCw,
  Move,
  ShieldCheck,
  CheckSquare,
} from 'lucide-react';

interface EnvelopeViewProps {
  item: RecipientItem;
  sender: SenderInfo;
  settings: PrintSettings;
  onUpdateItem?: (updated: RecipientItem) => void;
  onUpdateSender?: (updated: SenderInfo) => void;
  onUpdateSettings?: (updated: Partial<PrintSettings>) => void;
  onSwapSenderRecipient?: () => void;
  onOpenSenderModal?: () => void;
  onPrintSingle?: () => void;
  onSaveHtml?: () => void;
}

export const EnvelopeView: React.FC<EnvelopeViewProps> = ({
  item,
  sender,
  settings,
  onUpdateItem,
  onUpdateSender,
  onUpdateSettings,
  onSwapSenderRecipient,
  onOpenSenderModal,
  onPrintSingle,
  onSaveHtml,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showNudgeControls, setShowNudgeControls] = useState<boolean>(false);
  const [showEmblemPicker, setShowEmblemPicker] = useState<boolean>(false);

  // Editable local draft
  const [draftRecipient, setDraftRecipient] = useState(item.recipient);
  const [draftOrg, setDraftOrg] = useState(item.organization);
  const [draftAddress, setDraftAddress] = useState(item.address);
  const [draftPostal, setDraftPostal] = useState(item.postalCode || '');
  const [draftDocNumber, setDraftDocNumber] = useState(sender.docNumber || '');

  const isSmall = settings.format === 'small';
  const isLandscape = settings.orientation === 'landscape';

  // Dimension in millimeters:
  // For small envelope: 235 x 108 mm (landscape)
  // For A4 envelope: 297 x 210 mm (landscape default as requested)
  const widthMm = isSmall ? (isLandscape ? 235 : 108) : (isLandscape ? 297 : 210);
  const heightMm = isSmall ? (isLandscape ? 108 : 235) : (isLandscape ? 210 : 297);

  // Garuda emblem height: 1.5 cm (15mm) for small envelope, 3 cm (30mm) for A4
  const garudaHeightMm = isSmall ? 15 : 30;
  const garudaWidthMm = Math.round(garudaHeightMm * (659 / 738) * 10) / 10; // ~13.4mm or 26.8mm

  const addressLines = (isEditing ? draftAddress : item.address)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const postalDigits = ((isEditing ? draftPostal : item.postalCode) || '')
    .replace(/\D/g, '')
    .padEnd(5, ' ')
    .slice(0, 5)
    .split('');

  const senderOneLineAddress = formatOneLineAddress(sender.address, sender.postalCode);
  const senderDocNumberDisplay = formatDocNumberLine(
    settings.docNumberPrefix || 'ที่ ศธ ',
    isEditing ? draftDocNumber : sender.docNumber,
    settings.docNumberPlaceholder || '...................................................'
  );

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onUpdateItem) {
      onUpdateItem({
        ...item,
        recipient: draftRecipient,
        organization: draftOrg,
        address: draftAddress,
        postalCode: draftPostal,
      });
    }
    if (onUpdateSender && draftDocNumber !== sender.docNumber) {
      onUpdateSender({
        ...sender,
        docNumber: draftDocNumber,
      });
    }
  };

  // Toggle postal box mode between: filled -> empty -> none
  const cyclePostalBoxMode = () => {
    if (!onUpdateSettings) return;
    const current = settings.postalBoxMode || 'filled';
    const next: PostalBoxMode =
      current === 'filled' ? 'empty' : current === 'empty' ? 'none' : 'filled';
    onUpdateSettings({ postalBoxMode: next });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-300">
            {isSmall ? 'ซองเล็ก (10.8 × 23.5 ซม.)' : 'A4 แนวนอน (29.7 × 21.0 ซม.)'}
          </div>
          <span className="text-slate-600">·</span>
          <div className="text-xs text-blue-400 font-medium">
            ครุฑ {isSmall ? '1.5 ซม.' : '3 ซม.'} · ผู้รับ {settings.fontSizePt}pt
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Postal Box Mode Quick Toggle */}
          <button
            onClick={cyclePostalBoxMode}
            title="คลิกเพื่อสลับ: ใส่เลข ปณ. / กล่องเปล่า / ซ่อนกล่องแดง"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors text-slate-300"
          >
            <CheckSquare className="w-3.5 h-3.5 text-red-500" />
            <span>
              กล่อง ปณ.:{' '}
              <strong className="text-white">
                {settings.postalBoxMode === 'filled'
                  ? 'ใส่ตัวเลข'
                  : settings.postalBoxMode === 'empty'
                  ? 'กล่องเปล่า'
                  : 'ไม่ใส่กล่อง'}
              </strong>
            </span>
          </button>

          {/* Emblem style quick picker button */}
          <div className="relative">
            <button
              onClick={() => setShowEmblemPicker(!showEmblemPicker)}
              title="เลือกรูปแบบตราครุฑ"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {settings.garudaStyle === 'attached_black'
                  ? 'ครุฑโปร่งใส'
                  : settings.garudaStyle === 'blank_reserved'
                  ? 'เว้นที่ว่าง'
                  : 'ครุฑต้นฉบับ'}
              </span>
            </button>

            {showEmblemPicker && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="font-semibold text-slate-200 px-2 py-1 text-[11px] border-b border-slate-800">
                  เลือกรูปแบบตราครุฑบนซอง:
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings &&
                      onUpdateSettings({
                        garudaStyle: 'attached_black',
                        includeGarudaArtwork: true,
                        reserveLogo: true,
                      });
                    setShowEmblemPicker(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                    settings.garudaStyle === 'attached_black'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>ตราครุฑตามแนบ (พื้นหลังโปร่งใส)</span>
                  {settings.garudaStyle === 'attached_black' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings &&
                      onUpdateSettings({
                        garudaStyle: 'attached_original',
                        includeGarudaArtwork: true,
                        reserveLogo: true,
                      });
                    setShowEmblemPicker(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                    settings.garudaStyle === 'attached_original'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>ตราครุฑตามแนบ (ภาพต้นฉบับ)</span>
                  {settings.garudaStyle === 'attached_original' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings &&
                      onUpdateSettings({
                        garudaStyle: 'blank_reserved',
                        includeGarudaArtwork: false,
                        reserveLogo: true,
                      });
                    setShowEmblemPicker(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                    settings.garudaStyle === 'blank_reserved'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>เว้นที่ว่างไว้ (ไม่พิมพ์ตราครุฑ)</span>
                  {settings.garudaStyle === 'blank_reserved' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Quick Font Size Switch for Recipient */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md p-0.5 text-xs text-slate-300">
            <span className="px-1.5 text-slate-500 font-sans">ขนาดผู้รับ:</span>
            {[14, 16, 18, 20, 22].map((sz) => (
              <button
                key={sz}
                onClick={() => onUpdateSettings && onUpdateSettings({ fontSizePt: sz })}
                className={`px-2 py-0.5 rounded transition-colors ${
                  settings.fontSizePt === sz
                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                {sz}pt
              </button>
            ))}
          </div>

          {/* Orientation switch for small envelope */}
          {isSmall && (
            <button
              onClick={() =>
                onUpdateSettings &&
                onUpdateSettings({
                  orientation: isLandscape ? 'portrait' : 'landscape',
                })
              }
              title="สลับแนวนอน/แนวตั้ง สำหรับตั้งตามถาดใส่ซองของเครื่องพิมพ์"
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isLandscape ? 'แนวนอน' : 'แนวตั้ง'}</span>
            </button>
          )}

          {/* Nudge / Calibration toggle */}
          <button
            onClick={() => setShowNudgeControls(!showNudgeControls)}
            title="ปรับตำแหน่งระยะมิลลิเมตร (Nudge Offset)"
            className={`p-1.5 rounded-md border text-xs transition-colors ${
              showNudgeControls
                ? 'bg-blue-600 text-white border-blue-500'
                : 'text-slate-400 bg-slate-900 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1 hover:text-white text-slate-400"
              title="ย่อ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono tabular-nums text-slate-400 px-1.5 min-w-[36px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 hover:text-white text-slate-400"
              title="ขยาย"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:text-white text-slate-400 border-l border-slate-800"
              title="ขนาด 100%"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Edit */}
          {isEditing ? (
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>เสร็จสิ้น</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setDraftRecipient(item.recipient);
                setDraftOrg(item.organization);
                setDraftAddress(item.address);
                setDraftPostal(item.postalCode || '');
                setDraftDocNumber(sender.docNumber || '');
                setIsEditing(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium rounded-md transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>แก้ไข</span>
            </button>
          )}

          {/* Direct Print Button - Connect directly to printer without downloading */}
          {onPrintSingle && (
            <button
              onClick={onPrintSingle}
              title={`สั่งพิมพ์ทันที — เชื่อมต่อเครื่องพิมพ์โดยตรง ไม่ต้องดาวน์โหลดไฟล์ (ขนาด ${isSmall ? 'ซองเล็ก 10.8×23.5 ซม.' : 'A4 แนวนอน 29.7×21.0 ซม.'} ฟอนต์ ${settings.fontSizePt}pt)`}
              className="flex items-center gap-1.5 px-3.5 py-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>สั่งพิมพ์ซองนี้ทันที</span>
            </button>
          )}

          {/* Optional HTML Export (Secondary backup option) */}
          {onSaveHtml && (
            <button
              onClick={onSaveHtml}
              title="บันทึกไฟล์ HTML เก็บไว้เป็นเอกสารสำรอง (หากต้องการ)"
              className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Printer Alignment / Nudge & Spacing Adjustment Bar */}
      {showNudgeControls && (
        <div className="px-4 py-2.5 bg-slate-950/95 border-b border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Group 1: Line Height & Paragraph Spacing */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-medium">ระยะบรรทัด:</span>
                <input
                  type="range"
                  min="0.95"
                  max="1.70"
                  step="0.05"
                  value={settings.lineHeight ?? 1.25}
                  onChange={(e) =>
                    onUpdateSettings &&
                    onUpdateSettings({ lineHeight: parseFloat(e.target.value) })
                  }
                  className="w-20 accent-emerald-500 cursor-pointer"
                />
                <span className="font-mono tabular-nums text-emerald-300 w-12 font-semibold">
                  {(settings.lineHeight ?? 1.25).toFixed(2)}x
                </span>
                <div className="flex items-center gap-1">
                  {[1.0, 1.15, 1.25, 1.4].map((lh) => (
                    <button
                      key={lh}
                      type="button"
                      onClick={() => onUpdateSettings && onUpdateSettings({ lineHeight: lh })}
                      className={`px-1.5 py-0.5 rounded text-[11px] ${
                        Math.abs((settings.lineHeight ?? 1.25) - lh) < 0.02
                          ? 'bg-emerald-600 text-white font-medium'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {lh}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Paragraph Gap */}
              <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                <span className="text-emerald-400 font-medium">ช่องว่างย่อหน้าผู้รับ:</span>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={settings.recipientParagraphGapMm ?? 0}
                  onChange={(e) =>
                    onUpdateSettings &&
                    onUpdateSettings({ recipientParagraphGapMm: parseFloat(e.target.value) })
                  }
                  className="w-20 accent-emerald-500 cursor-pointer"
                />
                <span className="font-mono tabular-nums text-emerald-300 w-12 font-semibold">
                  {(settings.recipientParagraphGapMm ?? 0).toFixed(1)} มม.
                </span>
                <div className="flex items-center gap-1">
                  {[0, 0.5, 1.0, 2.0].map((gp) => (
                    <button
                      key={gp}
                      type="button"
                      onClick={() =>
                        onUpdateSettings && onUpdateSettings({ recipientParagraphGapMm: gp })
                      }
                      className={`px-1.5 py-0.5 rounded text-[11px] ${
                        (settings.recipientParagraphGapMm ?? 0) === gp
                          ? 'bg-emerald-600 text-white font-medium'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {gp === 0 ? '0 (ชิดพอดี)' : `${gp}มม.`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reset Spacing */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onUpdateSettings &&
                  onUpdateSettings({ lineHeight: 1.25, recipientParagraphGapMm: 0 })
                }
                className="text-emerald-400 hover:text-emerald-300 underline text-[11px]"
              >
                คืนค่ามาตรฐานระยะห่าง
              </button>
            </div>
          </div>

          {/* Group 2: Printer Nudge Offset */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-slate-400 font-medium">ตำแหน่งพิมพ์ (Nudge):</span>
              <div className="flex items-center gap-2">
                <span>ซ้าย-ขวา:</span>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={settings.recipientNudgeX}
                  onChange={(e) =>
                    onUpdateSettings &&
                    onUpdateSettings({ recipientNudgeX: Number(e.target.value) })
                  }
                  className="w-20 accent-blue-600"
                />
                <span className="font-mono tabular-nums text-slate-400 w-10">
                  {settings.recipientNudgeX > 0 ? `+${settings.recipientNudgeX}` : settings.recipientNudgeX} มม.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>บน-ล่าง:</span>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={settings.recipientNudgeY}
                  onChange={(e) =>
                    onUpdateSettings &&
                    onUpdateSettings({ recipientNudgeY: Number(e.target.value) })
                  }
                  className="w-20 accent-blue-600"
                />
                <span className="font-mono tabular-nums text-slate-400 w-10">
                  {settings.recipientNudgeY > 0 ? `+${settings.recipientNudgeY}` : settings.recipientNudgeY} มม.
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                onUpdateSettings &&
                onUpdateSettings({ recipientNudgeX: 0, recipientNudgeY: 0 })
              }
              className="text-slate-400 hover:text-white underline text-[11px]"
            >
              รีเซ็ตตำแหน่ง (0, 0)
            </button>
          </div>
        </div>
      )}

      {/* Envelope Preview Canvas */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-900/60">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative drop-shadow-2xl"
        >
          {/* Real Millimeter Dimension Envelope Sheet */}
          <div
            style={{
              width: `${widthMm}mm`,
              height: `${heightMm}mm`,
            }}
            className="bg-white text-black relative select-none font-sarabun shadow-xl overflow-hidden border border-slate-300"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[#fafafa]/50 pointer-events-none" />

            {/* Stamp mark (ด่วน / ด่วนที่สุด / EMS / ลงทะเบียน) */}
            {settings.stampMark !== 'none' && (
              <div
                style={{
                  top: isSmall ? '8mm' : '14mm',
                  right: isSmall ? '12mm' : '20mm',
                }}
                className={`absolute px-3 py-1 font-bold text-sm tracking-wide rounded border-2 uppercase ${
                  settings.stampMark === 'urgent'
                    ? 'border-amber-600 text-amber-600'
                    : settings.stampMark === 'most_urgent'
                    ? 'border-red-600 text-red-600'
                    : 'border-blue-600 text-blue-600'
                }`}
              >
                {settings.stampMark === 'urgent'
                  ? 'ด่วน'
                  : settings.stampMark === 'most_urgent'
                  ? 'ด่วนที่สุด'
                  : settings.stampMark === 'registered'
                  ? 'ลงทะเบียน'
                  : 'EMS'}
              </div>
            )}

            {/* 3-LINE SENDER SECTION WITH GARUDA */}
            {settings.showSender && (
              <div
                style={{
                  top: isSmall ? '8mm' : '14mm',
                  left: isSmall ? '10mm' : '16mm',
                  maxWidth: isSmall ? '150mm' : '180mm',
                }}
                className="absolute z-10 text-slate-900 group"
              >
                {/* Row 1: ตราครุฑ + บรรทัดที่ 1 (ระดับเดียวกับเท้าครุฑ) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '3mm',
                  }}
                >
                  {/* Garuda Box: 1.5cm for small envelope, 3cm for A4 */}
                  <div
                    style={{
                      width: `${garudaWidthMm}mm`,
                      height: `${garudaHeightMm}mm`,
                    }}
                    className="shrink-0 flex items-center justify-center"
                  >
                    {settings.includeGarudaArtwork && settings.garudaStyle !== 'blank_reserved' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <GarudaEmblem style={settings.garudaStyle} />
                      </div>
                    ) : (
                      <div className="w-full h-full" aria-hidden="true" />
                    )}
                  </div>

                  {/* Line 1: ชื่อ สพท. (อยู่ระดับเดียวกับเท้าครุฑ) - ฟอนต์ตัวปกติ ไม่หนา */}
                  <div
                    style={{
                      fontSize: `${settings.senderFontSizePt || 14}pt`,
                      paddingBottom: '0.5mm',
                    }}
                    className="font-normal text-slate-900 leading-none tracking-tight flex items-baseline gap-2"
                  >
                    <span>{sender.organization}</span>
                    {onOpenSenderModal && (
                      <button
                        onClick={onOpenSenderModal}
                        title="เปลี่ยนหรือแก้ไขผู้ส่ง"
                        className="text-[10px] text-blue-600 font-normal hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        (เปลี่ยนผู้ส่ง)
                      </button>
                    )}
                  </div>
                </div>

                {/* Lines 2 & 3: อยู่ใต้บรรทัดที่ 1 โดยเยื้องขวาให้เริ่มตรงกับบรรทัดที่ 1 */}
                <div
                  style={{
                    paddingLeft: `calc(${garudaWidthMm}mm + 3mm)`,
                  }}
                >
                  {/* Line 2: ที่อยู่และรหัส ปณ.ไว้ในบรรทัดเดียวกัน ไม่ต้องใส่เบอร์ (เยื้องตรงกับบรรทัดที่ 1) */}
                  <div
                    style={{
                      fontSize: `${(settings.senderFontSizePt || 14) - 1}pt`,
                    }}
                    className="mt-1 text-slate-800 leading-tight whitespace-nowrap overflow-hidden text-ellipsis"
                    title={senderOneLineAddress}
                  >
                    {senderOneLineAddress}
                  </div>

                  {/* Line 3: คำว่า ที่ ศธ (เว้นให้ใส่เลขที่หนังสือ) (เยื้องตรงกับบรรทัดที่ 1) - ฟอนต์ตัวปกติ */}
                  <div
                    style={{
                      fontSize: `${(settings.senderFontSizePt || 14) - 1}pt`,
                    }}
                    className="mt-0.5 text-slate-800 leading-tight flex items-center gap-1.5 font-normal"
                  >
                    <span className="font-normal">{settings.docNumberPrefix || 'ที่ ศธ '}</span>
                    {sender.docNumber ? (
                      <span className="font-normal text-black">{sender.docNumber}</span>
                    ) : (
                      <span className="text-slate-400 tracking-wider font-normal">
                        {settings.docNumberPlaceholder || '...................................................'}
                      </span>
                    )}
                    {isEditing && (
                      <input
                        type="text"
                        value={draftDocNumber}
                        onChange={(e) => setDraftDocNumber(e.target.value)}
                        placeholder="เลขที่หนังสือ เช่น 04001/..."
                        className="px-1.5 py-0.5 text-xs border rounded bg-white font-sans text-black max-w-[120px]"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* RECIPIENT BOX (เรียน ...): Lines 2-4 indented to start directly under recipient name */}
            <div
              style={{
                top: isSmall ? (isLandscape ? '48mm' : '80mm') : '85mm',
                left: isSmall ? (isLandscape ? '102mm' : '18mm') : '120mm',
                right: isSmall ? '12mm' : '25mm',
                fontSize: `${settings.fontSizePt}pt`,
                lineHeight: settings.lineHeight,
                transform: `translate(${settings.recipientNudgeX}mm, ${settings.recipientNudgeY}mm)`,
              }}
              className="absolute text-black"
            >
              {isEditing ? (
                /* Inline Edit Mode */
                <div className="space-y-2 bg-blue-50/70 p-3 rounded border border-blue-200">
                  <div className="text-xs font-sans text-blue-700 font-semibold mb-1">
                    แก้ไขข้อความผู้รับบนซองนี้:
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block">เรียน (ตำแหน่ง/ชื่อผู้รับ):</label>
                    <input
                      type="text"
                      value={draftRecipient}
                      onChange={(e) => setDraftRecipient(e.target.value)}
                      className="w-full px-2 py-1 border rounded bg-white text-base font-sarabun"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block">หน่วยงาน / สพท.:</label>
                    <input
                      type="text"
                      value={draftOrg}
                      onChange={(e) => setDraftOrg(e.target.value)}
                      className="w-full px-2 py-1 border rounded bg-white text-base font-sarabun"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block">ที่อยู่ (กด Enter ขึ้นบรรทัดใหม่):</label>
                    <textarea
                      rows={3}
                      value={draftAddress}
                      onChange={(e) => setDraftAddress(e.target.value)}
                      className="w-full px-2 py-1 border rounded bg-white text-base font-sarabun"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block">รหัสไปรษณีย์ 5 หลัก:</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={draftPostal}
                      onChange={(e) => setDraftPostal(e.target.value)}
                      className="w-32 px-2 py-1 border rounded bg-white text-base font-sarabun"
                    />
                  </div>
                </div>
              ) : (
                /* Standard Display Mode: Grid layout where lines 2-4 start under recipient name */
                <div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-2.5 font-normal">
                    {/* Left Col: "เรียน" (ตัวปกติ ไม่หนา) */}
                    <div className="font-normal whitespace-nowrap">เรียน</div>

                    {/* Right Col: Recipient Name, Organization, Address */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: `${settings.recipientParagraphGapMm ?? 0}mm`,
                        lineHeight: settings.lineHeight ?? 1.25,
                      }}
                      className="font-normal"
                    >
                      {/* Line 1: Recipient Name (ตัวปกติ ไม่หนา) */}
                      <div className="font-normal text-black">{item.recipient}</div>

                      {/* Line 2: Organization (starts right aligned with recipient name - ตัวปกติ ไม่หนา) */}
                      {item.organization && item.organization.trim() !== '' && (
                        <div className="font-normal text-slate-900">
                          {item.organization}
                        </div>
                      )}

                      {/* Lines 3-4: Address lines (starts right aligned with recipient name - ตัวปกติ) */}
                      <div style={{ lineHeight: settings.lineHeight ?? 1.25 }} className="font-normal">
                        {addressLines.map((line, idx) => (
                          <div key={idx} className="font-normal">{line}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Postal Code Boxes (filled / empty / none) - ตัวเลขอักษรปกติ */}
                  {settings.postalBoxMode !== 'none' && item.postalCode && (
                    <div className="mt-3 flex justify-end">
                      <div className="inline-flex gap-1.5">
                        {postalDigits.map((digit, dIdx) => (
                          <div
                            key={dIdx}
                            style={{
                              width: '7.5mm',
                              height: '9mm',
                              fontSize: '15pt',
                            }}
                            className={`flex items-center justify-center font-normal ${
                              settings.postalBoxColor === 'red'
                                ? 'border-[1.5px] border-red-600 text-black'
                                : settings.postalBoxColor === 'black'
                                ? 'border-[1.5px] border-black text-black'
                                : 'border border-slate-400 text-black'
                            }`}
                          >
                            {settings.postalBoxMode === 'filled' ? digit.trim() : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 select-none font-sans">
              <span>
                ขนาด: {widthMm / 10} × {heightMm / 10} ซม. · รหัส #{item.id}
              </span>
              <span>
                ครุฑ: {garudaHeightMm / 10} ซม. · ผู้รับ {settings.fontSizePt}pt · ผู้ส่ง 3 บรรทัดเยื้องตรงกัน
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
