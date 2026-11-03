/**
 * Formats multi-line address and postal code into a single clean line without phone number.
 */
export function formatOneLineAddress(address: string, postalCode?: string): string {
  let clean = (address || '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If postalCode exists and is not already part of the address string, append it
  const postal = (postalCode || '').trim();
  if (postal && !clean.includes(postal)) {
    clean += ` ${postal}`;
  }
  return clean;
}

/**
 * Formats the official government document number line (Line 3: ที่ ศธ ...)
 */
export function formatDocNumberLine(
  prefix = 'ที่ ศธ ',
  docNumber?: string,
  placeholder = '...................................................'
): string {
  const num = (docNumber || '').trim();
  if (num) {
    return `${prefix}${num}`;
  }
  return `${prefix}${placeholder}`;
}
