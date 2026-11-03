import React from 'react';
import { GarudaStyle } from '../types';
import {
  GARUDA_ATTACHED_BLACK_DATA_URL,
  GARUDA_ATTACHED_ORIGINAL_DATA_URL,
} from '../assets/garudaData';

interface GarudaEmblemProps {
  style?: GarudaStyle;
  className?: string;
  size?: number; // size in pixels
  sizeMm?: number; // size in mm
  heightMm?: number; // height in mm
  widthMm?: number;
  isPrint?: boolean;
}

/**
 * Garuda Emblem Component rendering the user-attached Garuda emblem
 * Default size: 1.5 cm (15 mm) for small envelope, 3 cm (30 mm) for A4
 */
export const GarudaEmblem: React.FC<GarudaEmblemProps> = ({
  style = 'attached_black',
  className = 'w-full h-full object-contain',
  size,
  sizeMm,
  heightMm,
  widthMm,
  isPrint = false,
}) => {
  const inlineStyle: React.CSSProperties = {
    ...(size ? { width: `${size}px`, height: `${size}px` } : {}),
    ...(sizeMm ? { width: `${sizeMm}mm`, height: `${sizeMm}mm` } : {}),
    ...(heightMm ? { height: `${heightMm}mm`, width: widthMm ? `${widthMm}mm` : 'auto' } : {}),
  };

  if (style === 'attached_black') {
    return (
      <img
        src="/assets/aistudio/krut_transparent.png"
        onError={(e) => {
          // fallback to base64 if path not accessible
          (e.currentTarget as HTMLImageElement).src = GARUDA_ATTACHED_BLACK_DATA_URL;
        }}
        alt="ตราครุฑพ่าห์ราชการตามแนบ"
        className={`${className} object-contain`}
        style={inlineStyle}
      />
    );
  }

  if (style === 'attached_original') {
    return (
      <img
        src="/assets/aistudio/krut-3-cm_940ad951.png"
        alt="ตราครุฑพ่าห์ราชการ (ต้นฉบับ)"
        className={`${className} object-contain`}
        style={inlineStyle}
      />
    );
  }

  if (style === 'red_gold') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="currentColor"
        className={className}
        style={inlineStyle}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ตราครุฑพ่าห์ราชการ"
      >
        <path d="M50 3 L47 15 L50 20 L53 15 Z" fill="#b91c1c" />
        <path d="M44 14 L50 8 L56 14 L50 18 Z" fill="#991b1b" />
        <circle cx="50" cy="22" r="5" fill="#7f1d1d" />
        <path d="M50 22 L45 28 L55 28 Z" fill="#b91c1c" />
        <path d="M48 28 L50 33 L52 28 Z" fill="#ef4444" />
        <path d="M42 30 C45 35 55 35 58 30 L60 45 C55 48 45 48 40 45 Z" fill="#b91c1c" />
        <circle cx="50" cy="38" r="3" fill="#fbbf24" />
        <path
          d="M40 32 C30 25 15 28 8 38 C15 40 25 42 38 42 C28 46 16 50 12 60 C22 58 32 54 39 48 C30 55 22 65 20 75 C28 68 36 60 41 53 Z"
          fill="#dc2626"
        />
        <path
          d="M60 32 C70 25 85 28 92 38 C85 40 75 42 62 42 C72 46 84 50 88 60 C78 58 68 54 61 48 C70 55 78 65 80 75 C72 68 64 60 59 53 Z"
          fill="#dc2626"
        />
        <path d="M45 52 L50 85 L55 52 Z" fill="#b91c1c" />
        <path d="M42 55 L38 80 L46 62 Z" fill="#991b1b" />
        <path d="M58 55 L62 80 L54 62 Z" fill="#991b1b" />
        <path d="M38 65 C32 68 25 74 24 82 C28 80 34 76 39 70 Z" fill="#b45309" />
        <path d="M62 65 C68 68 75 74 76 82 C72 80 66 76 61 70 Z" fill="#b45309" />
      </svg>
    );
  }

  // Blank reserved: เว้นเป็นพื้นที่ว่างล้วน ไม่มีกรอบและคำอธิบาย
  return <div className="w-full h-full" style={inlineStyle} aria-hidden="true" />;
};
