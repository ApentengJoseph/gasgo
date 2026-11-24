import React from 'react';
import Image from 'next/image';

/**
 * Real cylinder photos (3:4 portrait, valve at the top). Replace any file in
 * public/images/cylinders with your own shot to update it everywhere.
 * Credits: 3 & 25 kg: thenwiaka (Pexels) · 6 kg: ishahidsultan (Pexels) ·
 * 12 kg: Aburi Composites, CC BY-SA 4.0, via Wikimedia Commons (cropped).
 */
export const CYLINDER_PHOTOS: Partial<Record<number, string>> = {
  3: '/images/cylinders/3kg.jpg',
  6: '/images/cylinders/6kg.jpg',
  12: '/images/cylinders/12kg.jpg',
  25: '/images/cylinders/25kg.jpg',
};

/** Photo for a size; custom sizes use the closest standard photo. */
export function cylinderPhoto(kg: number): string {
  const sizes = [3, 6, 12, 25];
  const nearest = sizes.reduce((a, b) => (Math.abs(b - kg) < Math.abs(a - kg) ? b : a));
  return CYLINDER_PHOTOS[kg] ?? CYLINDER_PHOTOS[nearest]!;
}

interface GasCylinderProps {
  /** cylinder size in kg (preferred) */
  kg?: number;
  /** legacy size prop: sm = 6 kg, md = 12 kg, lg = 25 kg */
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  /** rendered height in px (width follows the cylinder's shape) */
  height?: number;
}

const legacyKg = { sm: 6, md: 12, lg: 25 } as const;

/**
 * Cylinders as used in Ghanaian homes:
 *  - up to 6 kg: the squat "table-top" cylinder with the burner grate on top
 *  - 12 kg+: the tall cylinder with a protective carry collar
 */
export default function GasCylinder({ kg, size = 'md', color, className = '', height }: GasCylinderProps) {
  const k = kg ?? legacyKg[size];
  const col = color ?? '#FF6B00';
  const photo = CYLINDER_PHOTOS[k];
  const h = height ?? (k <= 3 ? 46 : k <= 6 ? 54 : k <= 12 ? 62 : 70);

  if (photo) {
    return (
      <Image src={photo} alt={`${k} kg gas cylinder`} width={Math.round(h * 0.75)} height={h}
        className={`object-cover rounded-xl ${className}`} style={{ width: Math.round(h * 0.75), height: h }} />
    );
  }

  if (k <= 6) {
    // Table-top: wide squat body, valve, three-prong burner grate on top
    const w = Math.round(h * (k <= 3 ? 0.9 : 0.86));
    return (
      <svg width={w} height={h} viewBox="0 0 60 64" fill="none" className={className} aria-hidden="true">
        <ellipse cx="30" cy="61" rx="17" ry="2.6" fill="#17130F" opacity="0.12" />
        {/* burner grate */}
        <path d="M10 13 h40" stroke="#5B4636" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M14 13 l-3 -5 M46 13 l3 -5 M30 13 v-6" stroke="#5B4636" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="30" cy="15" rx="9" ry="2.6" fill="#8A6D55" />
        {/* valve */}
        <rect x="26.5" y="16" width="7" height="6" rx="1.5" fill="#B7832F" />
        <rect x="33" y="17.5" width="5" height="2.6" rx="1.3" fill="#8A5A1C" />
        {/* body */}
        <path d={k <= 3 ? 'M16 27 q0-5 14-5 q14 0 14 5 v26 q0 6 -14 6 q-14 0 -14 -6z' : 'M13 28 q0-6 17-6 q17 0 17 6 v24 q0 7 -17 7 q-17 0 -17 -7z'} fill={col} />
        <path d={k <= 3 ? 'M16 40 h28' : 'M13 40 h34'} stroke="#000" strokeOpacity="0.12" strokeWidth="1.2" />
        <rect x={k <= 3 ? 19 : 17} y="27" width="4" height="25" rx="2" fill="#fff" opacity="0.28" />
        <path d={k <= 3 ? 'M18 56 h24' : 'M15 56 h30'} stroke="#000" strokeOpacity="0.18" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  // Tall cylinder with carry collar
  const tall = k > 12;
  const w = Math.round(h * (tall ? 0.6 : 0.64));
  return (
    <svg width={w} height={h} viewBox="0 0 44 72" fill="none" className={className} aria-hidden="true">
      <ellipse cx="22" cy="69.5" rx="15" ry="2.4" fill="#17130F" opacity="0.12" />
      {/* collar with hand holes */}
      <path d="M10 15 q0-11 12-11 q12 0 12 11 v4 H10z" fill={col} />
      <path d="M14.5 9.5 h6 v5 h-6z M23.5 9.5 h6 v5 h-6z" fill="#fff" opacity="0.92" />
      {/* valve */}
      <rect x="19" y="13" width="6" height="6" rx="1.5" fill="#B7832F" />
      {/* body */}
      <path d={tall ? 'M6 26 q0-7 16-7 q16 0 16 7 v36 q0 5 -16 5 q-16 0 -16 -5z' : 'M7 26 q0-7 15-7 q15 0 15 7 v34 q0 5 -15 5 q-15 0 -15 -5z'} fill={col} />
      <path d={tall ? 'M6 44 h32' : 'M7 43 h30'} stroke="#000" strokeOpacity="0.12" strokeWidth="1.2" />
      <rect x={tall ? 10 : 11} y="25" width="4" height="34" rx="2" fill="#fff" opacity="0.28" />
      {/* foot ring */}
      <path d={tall ? 'M9 67.5 h26' : 'M10 66.5 h24'} stroke="#000" strokeOpacity="0.22" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Compact inline version for lists/badges */
export function GasCylinderIcon({ kg, className = '', color }: { kg: number; className?: string; color?: string }) {
  return <GasCylinder kg={kg} className={className} color={color} height={34} />;
}
