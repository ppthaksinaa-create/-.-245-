export type EnvelopeFormat = 'small' | 'a4';

export type PrintOrientation = 'landscape' | 'portrait';

export type EducationalCategory = 'obec' | 'spp' | 'spm' | 'other';

export type GarudaStyle = 'attached_black' | 'attached_original' | 'red_gold' | 'blank_reserved';

export type PostalBoxMode = 'filled' | 'empty' | 'none';

export interface RecipientItem {
  id: string;
  recipient: string;        // เรียน (e.g. ผู้อำนวยการ...)
  organization: string;     // สพท. / หน่วยงาน
  address: string;          // ที่อยู่
  postalCode?: string;      // รหัสไปรษณีย์ 5 หลัก
  province?: string;        // จังหวัด
  category?: EducationalCategory;
  selected?: boolean;
  notes?: string;
}

export interface SenderInfo {
  id?: string;              // id in the list if selected from list
  title?: string;           // optional
  organization: string;     // บรรทัดที่ 1: ชื่อ สพท. (ระดับเดียวกับเท้าครุฑ)
  address: string;          // บรรทัดที่ 2: ที่อยู่และรหัส ปณ.
  postalCode: string;       // รหัสไปรษณีย์
  phone?: string;           // ไม่แสดงบนซอง
  department?: string;      // กลุ่ม / ฝ่าย / งาน
  docNumber?: string;       // บรรทัดที่ 3: เลขที่หนังสือ (ต่อจาก "ที่ ศธ ")
}

export interface PrintSettings {
  format: EnvelopeFormat;           // 'small' (10.8 x 23.5 cm) | 'a4' (21.0 x 29.7 cm)
  orientation: PrintOrientation;    // 'landscape' | 'portrait'
  fontSizePt: number;               // default: 16pt
  senderFontSizePt: number;         // default: 14pt
  lineHeight: number;               // default: 1.25 (ระยะห่างบรรทัด)
  recipientParagraphGapMm: number;  // default: 0mm (ช่องว่างระหว่างย่อหน้า/ชื่อสำนักงานกับที่อยู่)
  
  // Garuda & Logo settings
  garudaStyle: GarudaStyle;         // default: 'attached_black'
  reserveLogo: boolean;             // true
  logoPlaceholderText: string;      // e.g. "เว้นที่ว่างตราครุฑ"
  showLogoBorderInPrint: boolean;   // false
  includeGarudaArtwork: boolean;    // true
  customLogoUrl: string;
  logoWidthMm: number;              // 13.5mm for small, 27mm for A4
  logoHeightMm: number;             // 15mm (1.5 ซม.) for small, 30mm (3 ซม.) for A4
  
  // Sender settings
  showSender: boolean;              // true
  senderPosition: 'top-left' | 'top-right';
  docNumberPrefix: string;          // default: "ที่ ศธ "
  docNumberPlaceholder: string;     // default: "..................................................."
  
  // Recipient adjustments & Postal Boxes
  postalBoxMode: PostalBoxMode;     // 'filled' (ใส่เลข ปณ.) | 'empty' (กล่องเปล่า) | 'none' (ไม่ใส่กล่อง)
  showPostalBoxes: boolean;         // boolean alias
  postalBoxColor: 'red' | 'gray' | 'black';
  
  // Printer offsets (fine-tuning mm)
  nudgeX: number;
  nudgeY: number;
  recipientNudgeX: number;
  recipientNudgeY: number;
  
  // Government stamps
  stampMark: 'none' | 'urgent' | 'most_urgent' | 'registered' | 'ems';
}
