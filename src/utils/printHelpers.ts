import { RecipientItem, SenderInfo, PrintSettings } from '../types';
import {
  GARUDA_ATTACHED_BLACK_DATA_URL,
  GARUDA_ATTACHED_ORIGINAL_DATA_URL,
} from '../assets/garudaData';
import { formatOneLineAddress, formatDocNumberLine } from './addressHelper';

/**
 * Generates a clean standalone HTML document ready for offline viewing, archiving, or printing.
 */
export function generateStandalonePrintHtml(
  items: RecipientItem[],
  sender: SenderInfo,
  settings: PrintSettings,
  autoPrint = false
): string {
  const isSmall = settings.format === 'small';
  
  // Dimensions
  // For small envelope: 235mm x 108mm (landscape)
  // For A4 envelope: default to landscape as requested: 297mm x 210mm
  const isLandscape = settings.orientation === 'landscape';
  const widthMm = isSmall ? (isLandscape ? 235 : 108) : (isLandscape ? 297 : 210);
  const heightMm = isSmall ? (isLandscape ? 108 : 235) : (isLandscape ? 210 : 297);
  
  const pageSizeRule = isSmall
    ? (isLandscape ? '235mm 108mm' : '108mm 235mm')
    : (isLandscape ? '297mm 210mm' : '210mm 297mm');

  // Garuda emblem height: 1.5 cm (15mm) for small envelope, 3.0 cm (30mm) for A4
  const garudaHeightMm = isSmall ? 15 : 30;
  const garudaWidthMm = Math.round(garudaHeightMm * (659 / 738) * 10) / 10; // ~13.4mm or 26.8mm

  const garudaImgSrc =
    settings.garudaStyle === 'attached_original'
      ? GARUDA_ATTACHED_ORIGINAL_DATA_URL
      : GARUDA_ATTACHED_BLACK_DATA_URL;

  const senderOneLineAddress = formatOneLineAddress(sender.address, sender.postalCode);
  const senderDocNumberDisplay = formatDocNumberLine(
    settings.docNumberPrefix || 'ที่ ศธ ',
    sender.docNumber,
    settings.docNumberPlaceholder || '...................................................'
  );

  const envelopeHtmlList = items
    .map((item, index) => {
      const addressLines = item.address
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const postalDigits = (item.postalCode || '').replace(/\D/g, '').padEnd(5, ' ').slice(0, 5).split('');

      return `
      <div class="envelope-sheet">
        <!-- 3-LINE SENDER SECTION WITH GARUDA -->
        ${
          settings.showSender
            ? `
            <div class="sender-top-block">
              <!-- Row 1: Garuda + Line 1 at feet level -->
              <div class="sender-row-1">
                <div class="garuda-box">
                  ${
                    settings.garudaStyle === 'blank_reserved' || !settings.includeGarudaArtwork
                      ? `<div class="reserved-placeholder"></div>`
                      : `<img src="${garudaImgSrc}" alt="ตราครุฑพ่าห์" class="garuda-img" />`
                  }
                </div>

                <!-- Line 1: ชื่อ สพท. (อยู่ระดับเดียวกับเท้าครุฑ) -->
                <div class="sender-line-1" style="font-size: ${settings.senderFontSizePt || 14}pt;">
                  ${sender.organization}
                </div>
              </div>

              <!-- Lines 2 & 3: อยู่ใต้บรรทัดที่ 1 เยื้องตรงกับบรรทัดที่ 1 -->
              <div class="sender-sublines" style="padding-left: calc(${garudaWidthMm}mm + 3mm);">
                <!-- Line 2: ที่อยู่และรหัส ปณ.ไว้ในบรรทัดเดียวกัน ไม่ต้องใส่เบอร์ -->
                <div class="sender-line-2" style="font-size: ${(settings.senderFontSizePt || 14) - 1}pt;">
                  ${senderOneLineAddress}
                </div>

                <!-- Line 3: คำว่า ที่ ศธ (เว้นให้ใส่เลขที่หนังสือ) -->
                <div class="sender-line-3" style="font-size: ${(settings.senderFontSizePt || 14) - 1}pt;">
                  ${senderDocNumberDisplay}
                </div>
              </div>
            </div>
            `
            : ''
        }

        <!-- Stamp mark -->
        ${
          settings.stampMark !== 'none'
            ? `<div class="stamp-mark stamp-${settings.stampMark}">
                ${
                  settings.stampMark === 'urgent'
                    ? 'ด่วน'
                    : settings.stampMark === 'most_urgent'
                    ? 'ด่วนที่สุด'
                    : settings.stampMark === 'registered'
                    ? 'ลงทะเบียน'
                    : 'EMS'
                }
              </div>`
            : ''
        }

        <!-- Recipient Information: Line 1 "เรียน [ชื่อผู้รับ]" and Lines 2-4 indented to start at recipient name -->
        <div class="recipient-box" style="font-size: ${settings.fontSizePt}pt; line-height: ${settings.lineHeight}; transform: translate(${settings.recipientNudgeX}mm, ${settings.recipientNudgeY}mm);">
          <div class="recipient-grid">
            <div class="to-label">เรียน</div>
            <div class="recipient-body">
              <!-- Line 1: Recipient Title / Name -->
              <div class="recipient-name">${item.recipient}</div>

              <!-- Line 2: Organization (starts right aligned with recipient name) -->
              ${item.organization ? `<div class="recipient-org">${item.organization}</div>` : ''}

              <!-- Lines 3-4: Address (starts right aligned with recipient name) -->
              <div class="recipient-address">
                ${addressLines.map((line) => `<div>${line}</div>`).join('')}
              </div>
            </div>
          </div>

          <!-- Postal code display (filled / empty / none) -->
          ${
            settings.postalBoxMode !== 'none' && item.postalCode
              ? `<div class="postal-box-container">
                  <div class="postal-boxes">
                    ${postalDigits
                      .map(
                        (digit) => `
                        <div class="postal-digit-box ${settings.postalBoxColor}">
                          ${settings.postalBoxMode === 'filled' ? digit.trim() : ''}
                        </div>
                      `
                      )
                      .join('')}
                  </div>
                </div>`
              : ''
          }
        </div>

        <div class="page-number-hint no-print">ซองที่ ${index + 1} / ${items.length} (เลขที่: ${item.id})</div>
      </div>
    `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>พิมพ์ซองจดหมาย (${items.length} ซอง) - TH Sarabun PSK ${settings.fontSizePt}pt</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    @font-face {
      font-family: 'TH Sarabun PSK';
      src: local('TH Sarabun PSK'), local('THSarabunPSK'), local('TH Sarabun New');
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'TH Sarabun PSK', 'THSarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif;
      background: #f1f5f9;
      color: #000;
      -webkit-font-smoothing: antialiased;
    }

    .top-action-bar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
    }

    .top-action-bar button {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 8px 20px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .top-action-bar button:hover {
      background: #1d4ed8;
    }

    .envelope-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      padding: 32px 16px;
    }

    .envelope-sheet {
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      background: #fff;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      padding: ${isSmall ? '8mm 10mm' : '14mm 16mm'};
    }

    /* 3-Line Sender block */
    .sender-top-block {
      position: absolute;
      top: ${isSmall ? '8mm' : '14mm'};
      left: ${isSmall ? '10mm' : '16mm'};
      max-width: ${isSmall ? '150mm' : '180mm'};
    }

    .sender-row-1 {
      display: flex;
      align-items: flex-end;
      gap: 3mm;
    }

    .garuda-box {
      width: ${garudaWidthMm}mm;
      height: ${garudaHeightMm}mm;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .garuda-box.show-border {
      border: 1px dashed #cbd5e1;
    }

    .garuda-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .reserved-placeholder {
      width: 100%;
      height: 100%;
    }

    .sender-line-1 {
      font-weight: normal;
      line-height: 1.1;
      padding-bottom: 0.5mm;
      color: #000;
    }

    .sender-sublines {
      /* Indented to align horizontally with line 1 */
    }

    .sender-line-2 {
      margin-top: 1mm;
      line-height: 1.25;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sender-line-3 {
      margin-top: 0.8mm;
      line-height: 1.25;
      color: #1e293b;
    }

    /* Recipient box - Center / Right */
    .recipient-box {
      position: absolute;
      ${
        isSmall
          ? `
        top: 48mm;
        left: 102mm;
        right: 12mm;
        bottom: 8mm;
      `
          : `
        top: 85mm;
        left: 120mm;
        right: 25mm;
      `
      }
      color: #000;
    }

    /* Recipient Grid: lines 2-4 indented to start directly under recipient name */
    .recipient-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: 2.5mm;
    }

    .to-label {
      font-weight: normal;
      white-space: nowrap;
    }

    .recipient-body {
      display: flex;
      flex-direction: column;
      gap: ${settings.recipientParagraphGapMm ?? 0}mm;
      line-height: ${settings.lineHeight ?? 1.25};
    }

    .recipient-name {
      font-weight: normal;
    }

    .recipient-org {
      font-weight: normal;
    }

    .recipient-address {
      line-height: ${settings.lineHeight ?? 1.25};
    }

    /* Postal Boxes */
    .postal-box-container {
      margin-top: ${isSmall ? '4mm' : '6mm'};
      display: flex;
      justify-content: flex-end;
    }

    .postal-boxes {
      display: inline-flex;
      gap: 2.5mm;
    }

    .postal-digit-box {
      width: 7.5mm;
      height: 9mm;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15pt;
      font-weight: normal;
      font-family: 'TH Sarabun PSK', sans-serif;
    }

    .postal-digit-box.red {
      border: 1.5px solid #dc2626;
      color: #000;
    }
    .postal-digit-box.black {
      border: 1.5px solid #000000;
      color: #000;
    }
    .postal-digit-box.gray {
      border: 1px solid #94a3b8;
      color: #000;
    }

    /* Stamp Marks */
    .stamp-mark {
      position: absolute;
      top: ${isSmall ? '8mm' : '14mm'};
      right: ${isSmall ? '12mm' : '20mm'};
      padding: 3px 12px;
      font-size: 14pt;
      font-weight: bold;
      border-radius: 3px;
    }

    .stamp-urgent {
      border: 2px solid #ea580c;
      color: #ea580c;
    }

    .stamp-most_urgent {
      border: 2px solid #dc2626;
      color: #dc2626;
    }

    .stamp-registered, .stamp-ems {
      border: 2px solid #2563eb;
      color: #2563eb;
    }

    .page-number-hint {
      position: absolute;
      bottom: 4px;
      right: 12px;
      font-size: 11px;
      color: #94a3b8;
    }

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
        background: transparent !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        -webkit-text-size-adjust: 100% !important;
        text-size-adjust: 100% !important;
      }

      .no-print {
        display: none !important;
      }

      .envelope-container {
        padding: 0 !important;
        gap: 0 !important;
      }

      .envelope-sheet {
        width: ${widthMm}mm !important;
        height: ${heightMm}mm !important;
        min-width: ${widthMm}mm !important;
        max-width: ${widthMm}mm !important;
        min-height: ${heightMm}mm !important;
        max-height: ${heightMm}mm !important;
        box-shadow: none !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        margin: 0 !important;
        -webkit-text-size-adjust: 100% !important;
        text-size-adjust: 100% !important;
      }

      .envelope-sheet:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }

      .reserved-placeholder {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="top-action-bar no-print">
    <div>
      <strong>พิมพ์ซองจดหมาย ${isSmall ? 'ซองเล็ก (10.8 × 23.5 ซม.)' : 'A4 แนวนอน (29.7 × 21.0 ซม.)'}</strong>
      <span style="opacity: 0.8; margin-left: 12px;">จำนวน ${items.length} ซอง | ฟอนต์ TH Sarabun PSK ${settings.fontSizePt}pt | ครุฑสูง ${garudaHeightMm / 10} ซม.</span>
    </div>
    <div style="display: flex; gap: 12px;">
      <button onclick="window.print()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        สั่งพิมพ์ทันที (Print)
      </button>
    </div>
  </div>

  <div class="envelope-container">
    ${envelopeHtmlList}
  </div>

  ${
    autoPrint
      ? `<script>
    window.addEventListener('DOMContentLoaded', function() {
      // Small pause to guarantee fonts like TH Sarabun PSK are active
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
          setTimeout(function() {
            window.focus();
            window.print();
          }, 180);
        });
      } else {
        setTimeout(function() {
          window.focus();
          window.print();
        }, 250);
      }
    });
  </script>`
      : ''
  }
</body>
</html>`;
}

/**
 * Creates a Blob URL from standalone HTML with optional auto-print.
 */
export function createPrintBlobUrl(
  items: RecipientItem[],
  sender: SenderInfo,
  settings: PrintSettings,
  autoPrint = true
): string {
  const html = generateStandalonePrintHtml(items, sender, settings, autoPrint);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  return URL.createObjectURL(blob);
}

/**
 * Opens a clean printable view in a new browser tab and triggers the system print dialog immediately.
 * Does NOT require downloading any files!
 */
export function openPrintTabDirectly(
  items: RecipientItem[],
  sender: SenderInfo,
  settings: PrintSettings
): string {
  const blobUrl = createPrintBlobUrl(items, sender, settings, true);
  
  // Use anchor click to preserve user activation gesture
  const link = document.createElement('a');
  link.href = blobUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return blobUrl;
}

/**
 * Prints using a hidden iframe inside the document.
 */
export function printViaHiddenIframe(
  items: RecipientItem[],
  sender: SenderInfo,
  settings: PrintSettings
): boolean {
  try {
    const html = generateStandalonePrintHtml(items, sender, settings, false);
    let iframe = document.getElementById('hidden-print-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.remove();
    }
    iframe = document.createElement('iframe');
    iframe.id = 'hidden-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print warning:', e);
        }
      }, 80);
      return true;
    }
  } catch (err) {
    console.warn('Hidden iframe error:', err);
  }
  return false;
}

/**
 * Downloads a standalone printable HTML file.
 */
export function downloadPrintableHtml(
  items: RecipientItem[],
  sender: SenderInfo,
  settings: PrintSettings,
  filename = 'envelope-batch.html'
): void {
  const html = generateStandalonePrintHtml(items, sender, settings, false);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
