import { RecipientItem } from '../types';

/**
 * Extracts Google Sheet ID and GID from common Google Sheets URL formats.
 */
export function extractGoogleSheetId(urlOrId: string): { sheetId: string | null; gid: string | null } {
  const trimmed = urlOrId.trim();
  if (!trimmed) return { sheetId: null, gid: null };

  // If it's already just an ID (alphanumeric, dashes, underscores, length >= 20)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) {
    return { sheetId: trimmed, gid: '0' };
  }

  // Regex for /spreadsheets/d/([a-zA-Z0-9_-]+)
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  const sheetId = match ? match[1] : null;

  // Regex for gid=([0-9]+)
  const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';

  return { sheetId, gid };
}

/**
 * Builds direct CSV export URL from Google Sheet ID or public publish URL.
 */
export function getGoogleSheetCsvUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes('output=csv') || trimmed.endsWith('.csv')) {
    return trimmed;
  }

  const { sheetId, gid } = extractGoogleSheetId(trimmed);
  if (sheetId) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gid ? `&gid=${gid}` : ''}`;
  }

  return trimmed;
}

/**
 * Robust CSV parser that correctly handles quoted multi-line fields.
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"' && inQuotes && next === '"') {
      currentField += '"';
      i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.some((col) => col !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += c;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((col) => col !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Converts 2D parsed array into RecipientItem[] by detecting column names.
 */
export function mapCsvRowsToRecipients(rows: string[][]): { items: RecipientItem[]; detectedColumns: string[] } {
  if (!rows || rows.length === 0) {
    return { items: [], detectedColumns: [] };
  }

  const header = rows[0].map((h) => h.trim());
  let colId = -1;
  let colRecipient = -1;
  let colOrg = -1;
  let colAddress = -1;
  let colPostal = -1;
  let colProvince = -1;

  header.forEach((name, idx) => {
    const lower = name.toLowerCase();
    if (name.includes('เลขที่') || lower === 'id' || lower === 'no') {
      colId = idx;
    }
    if (name.includes('เรียน') || name.includes('ผู้รับ') || name.includes('ชื่อ') || lower === 'recipient' || lower === 'name') {
      if (colRecipient === -1) colRecipient = idx;
    }
    if (name.includes('สพท') || name.includes('หน่วยงาน') || name.includes('สังกัด') || name.includes('องค์กร') || lower === 'organization' || lower === 'org') {
      colOrg = idx;
    }
    if (name.includes('ที่อยู่') || name.includes('สถานที่') || lower === 'address') {
      colAddress = idx;
    }
    if (name.includes('รหัสไปรษณีย์') || lower.includes('postal') || lower.includes('zip')) {
      colPostal = idx;
    }
    if (name.includes('จังหวัด') || lower.includes('province')) {
      colProvince = idx;
    }
  });

  // Fallback if header doesn't match standard names
  if (colRecipient === -1 && header.length > 1) colRecipient = 1;
  if (colOrg === -1 && header.length > 2) colOrg = 2;
  if (colAddress === -1 && header.length > 3) colAddress = 3;
  if (colId === -1 && header.length > 0) colId = 0;

  const dataRows = rows.slice(1);
  const items: RecipientItem[] = dataRows.map((row, index) => {
    const id = colId >= 0 && row[colId] ? row[colId] : String(index);
    const recipient = colRecipient >= 0 && row[colRecipient] ? row[colRecipient] : '';
    const organization = colOrg >= 0 && row[colOrg] ? row[colOrg] : '';
    let address = colAddress >= 0 && row[colAddress] ? row[colAddress] : '';

    // Clean address line endings
    address = address.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Extract postal code if not in dedicated column
    let postalCode = colPostal >= 0 && row[colPostal] ? row[colPostal] : '';
    if (!postalCode) {
      const match = address.match(/\b\d{5}\b/);
      if (match) postalCode = match[0];
    }

    // Extract province if not in dedicated column
    let province = colProvince >= 0 && row[colProvince] ? row[colProvince] : '';
    if (!province) {
      const provMatch = address.match(/(?:จังหวัด|จ\.)\s*([ก-๙]+)/);
      if (provMatch) {
        province = provMatch[1];
      } else if (address.includes('กรุงเทพ')) {
        province = 'กรุงเทพมหานคร';
      }
    }

    let category: RecipientItem['category'] = 'other';
    if (organization.includes('ประถมศึกษา') || recipient.includes('ประถมศึกษา')) {
      category = 'spp';
    } else if (organization.includes('มัธยมศึกษา') || recipient.includes('มัธยมศึกษา')) {
      category = 'spm';
    } else if (organization.includes('ขั้นพื้นฐาน') || organization.includes('การศึกษาพิเศษ') || organization.includes('สพฐ')) {
      category = 'obec';
    }

    return {
      id,
      recipient,
      organization,
      address,
      postalCode,
      province,
      category,
      selected: false,
    };
  });

  return { items, detectedColumns: header };
}

/**
 * Exports recipients to downloadable CSV file with UTF-8 BOM for Thai Excel compatibility.
 */
export function exportToCsv(items: RecipientItem[], filename = 'envelope-recipients.csv'): void {
  const header = ['เลขที่', 'เรียน', 'สพท.', 'ที่อยู่', 'รหัสไปรษณีย์', 'จังหวัด'];
  const rows = items.map((i) => [
    `"${i.id.replace(/"/g, '""')}"`,
    `"${i.recipient.replace(/"/g, '""')}"`,
    `"${i.organization.replace(/"/g, '""')}"`,
    `"${i.address.replace(/"/g, '""')}"`,
    `"${(i.postalCode || '').replace(/"/g, '""')}"`,
    `"${(i.province || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
