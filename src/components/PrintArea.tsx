import React from 'react';
import { RecipientItem, SenderInfo, PrintSettings } from '../types';
import { GarudaEmblem } from './GarudaEmblem';
import { formatOneLineAddress, formatDocNumberLine } from '../utils/addressHelper';

interface PrintAreaProps {
  items: RecipientItem[];
  sender: SenderInfo;
  settings: PrintSettings;
}

export const PrintArea: React.FC<PrintAreaProps> = ({ items, sender, settings }) => {
  const isSmall = settings.format === 'small';
  const isLandscape = settings.orientation === 'landscape';

  const widthMm = isSmall ? (isLandscape ? 235 : 108) : (isLandscape ? 297 : 210);
  const heightMm = isSmall ? (isLandscape ? 108 : 235) : (isLandscape ? 210 : 297);

  // Garuda height: 1.5 cm (15mm) for small envelope, 3.0 cm (30mm) for A4
  const garudaHeightMm = isSmall ? 15 : 30;
  const garudaWidthMm = Math.round(garudaHeightMm * (659 / 738) * 10) / 10;

  const senderOneLineAddress = formatOneLineAddress(sender.address, sender.postalCode);
  const senderDocNumberDisplay = formatDocNumberLine(
    settings.docNumberPrefix || 'ที่ ศธ ',
    sender.docNumber,
    settings.docNumberPlaceholder || '...................................................'
  );

  const pageSizeRule = isSmall
    ? (isLandscape ? '235mm 108mm' : '108mm 235mm')
    : (isLandscape ? '297mm 210mm' : '210mm 297mm');

  return (
    <div id="print-area" className="font-sarabun text-black">
      <style>{`
        @media print {
          @page {
            size: ${pageSizeRule};
            margin: 0 !important;
          }
          html, body {
            width: ${widthMm}mm !important;
            height: ${heightMm}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            -webkit-text-size-adjust: 100% !important;
            text-size-adjust: 100% !important;
          }
          #print-area {
            display: block !important;
            width: ${widthMm}mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-page {
            width: ${widthMm}mm !important;
            height: ${heightMm}mm !important;
            min-width: ${widthMm}mm !important;
            max-width: ${widthMm}mm !important;
            min-height: ${heightMm}mm !important;
            max-height: ${heightMm}mm !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            position: relative !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-text-size-adjust: 100% !important;
            text-size-adjust: 100% !important;
          }
          .print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

      {items.map((item, idx) => {
        const addressLines = item.address
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);

        const postalDigits = (item.postalCode || '')
          .replace(/\D/g, '')
          .padEnd(5, ' ')
          .slice(0, 5)
          .split('');

        return (
          <div
            key={item.id + '-' + idx}
            className="print-page relative bg-white overflow-hidden"
            style={{
              width: `${widthMm}mm`,
              height: `${heightMm}mm`,
              minWidth: `${widthMm}mm`,
              maxWidth: `${widthMm}mm`,
              minHeight: `${heightMm}mm`,
              maxHeight: `${heightMm}mm`,
            }}
          >
            {/* 3-LINE SENDER SECTION WITH GARUDA */}
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

                  {/* Line 1: ชื่อ สพท. อยู่ระดับเดียวกับเท้าครุฑ (ฟอนต์ตัวปกติ ไม่หนา) */}
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

                {/* Lines 2 & 3: อยู่ใต้บรรทัดที่ 1 เยื้องตรงกับบรรทัดที่ 1 */}
                <div
                  style={{
                    paddingLeft: `calc(${garudaWidthMm}mm + 3mm)`,
                  }}
                >
                  {/* Line 2: ที่อยู่และรหัส ปณ.ไว้ในบรรทัดเดียวกัน ไม่ต้องใส่เบอร์ (เยื้องตรงกับบรรทัดที่ 1) */}
                  <div
                    style={{
                      marginTop: '1mm',
                      fontSize: `${(settings.senderFontSizePt || 14) - 1}pt`,
                      lineHeight: '1.25',
                      color: '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {senderOneLineAddress}
                  </div>

                  {/* Line 3: คำว่า ที่ ศธ (เว้นให้ใส่เลขที่หนังสือ) (เยื้องตรงกับบรรทัดที่ 1) */}
                  <div
                    style={{
                      marginTop: '0.8mm',
                      fontSize: `${(settings.senderFontSizePt || 14) - 1}pt`,
                      lineHeight: '1.25',
                      color: '#1e293b',
                    }}
                  >
                    {senderDocNumberDisplay}
                  </div>
                </div>
              </div>
            )}

            {/* Stamp Mark */}
            {settings.stampMark !== 'none' && (
              <div
                style={{
                  position: 'absolute',
                  top: isSmall ? '8mm' : '14mm',
                  right: isSmall ? '12mm' : '20mm',
                }}
                className={`px-3 py-0.5 font-bold text-sm border-2 rounded ${
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

            {/* RECIPIENT BOX (เรียน ...): Lines 2-4 indented to start under recipient name */}
            <div
              style={{
                position: 'absolute',
                top: isSmall ? (isLandscape ? '48mm' : '80mm') : '85mm',
                left: isSmall ? (isLandscape ? '102mm' : '18mm') : '120mm',
                right: isSmall ? '12mm' : '25mm',
                fontSize: `${settings.fontSizePt}pt`,
                lineHeight: settings.lineHeight,
                transform: `translate(${settings.recipientNudgeX}mm, ${settings.recipientNudgeY}mm)`,
              }}
              className="text-black"
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
                    lineHeight: settings.lineHeight ?? 1.25,
                    fontWeight: 'normal',
                  }}
                >
                  {/* Line 1: Recipient Title / Name (ฟอนต์ตัวปกติ ไม่หนา) */}
                  <div style={{ fontWeight: 'normal' }}>{item.recipient}</div>

                  {/* Line 2: Organization (starts right aligned with recipient name - ฟอนต์ตัวปกติ) */}
                  {item.organization && item.organization.trim() !== '' && (
                    <div style={{ fontWeight: 'normal' }}>{item.organization}</div>
                  )}

                  {/* Lines 3-4: Address (starts right aligned with recipient name - ฟอนต์ตัวปกติ) */}
                  <div style={{ lineHeight: settings.lineHeight ?? 1.25, fontWeight: 'normal' }}>
                    {addressLines.map((line, lIdx) => (
                      <div key={lIdx}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5-Digit Postal Boxes (filled / empty / none) - ฟอนต์ตัวเลขปกติ */}
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
                            : 'border border-gray-500 text-black'
                        }`}
                      >
                        {settings.postalBoxMode === 'filled' ? digit.trim() : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
