import React from 'react';

export interface IconProps {
  className?: string;
  size?: number;
}

// ---------------- Navigation & Controls ----------------
export const PlayIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 4.5v15a1 1 0 0 0 1.54.84l12-7.5a1 1 0 0 0 0-1.68l-12-7.5A1 1 0 0 0 7 4.5z" />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="6" y="4" width="4" height="16" rx="1.5" />
    <rect x="14" y="4" width="4" height="16" rx="1.5" />
  </svg>
);

export const RotateCcwIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const HelpIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const CloudIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);

export const ShopIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const LevelIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 21v-7" />
    <path d="M4 10V3" />
    <path d="M12 21v-9" />
    <path d="M12 8V3" />
    <path d="M20 21v-5" />
    <path d="M20 12V3" />
    <circle cx="4" cy="14" r="2" fill="currentColor" />
    <circle cx="12" cy="8" r="2" fill="currentColor" />
    <circle cx="20" cy="16" r="2" fill="currentColor" />
  </svg>
);

// ---------------- Game Metrics & Stats ----------------
export const MoneyIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <circle cx="12" cy="14" r="2" fill="currentColor" />
  </svg>
);

export const TrophyIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21 1.18.54 2.03 2.03 2.03 3.79" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const AwardIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="6" fill="currentColor" fillOpacity="0.2" />
    <path d="m15.48 13.98-1.48 7.02L12 19.5l-2 1.5-1.48-7.02" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const BlasterIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v4" />
    <path d="m4.93 4.93 2.83 2.83" />
    <path d="M2 12h4" />
    <path d="m4.93 19.07 2.83-2.83" />
    <path d="M12 22v-4" />
    <path d="m19.07 19.07-2.83-2.83" />
    <path d="M22 12h-4" />
    <path d="m19.07 4.93-2.83 2.83" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const ZapIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const FlameIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5c0-1.8-1.5-3.5-2.5-4.5-.4-.4-.8-.8-1-1.3-.2.5-.6.9-1 1.3-1 1-2.5 2.7-2.5 4.5zM12 2c1.6 2.5 4 4.5 5 7.5 1 3 .5 6.5-1.5 9s-5.5 3.5-8.5 2.5c-3-1-5-3.5-5-6.5 0-3.5 2.5-6.5 5-9 1-1 2.5-2 5-3.5z" />
  </svg>
);

export const SmokeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19a4 4 0 0 1 4-4h.5a4 4 0 0 1 3.5 2 4 4 0 0 0 3.5 2h1a4 4 0 0 0 4-4 4 4 0 0 0-4-4h-.5a4 4 0 0 1-3.5-2A4 4 0 0 0 9 5H8a4 4 0 0 0-4 4" />
    <circle cx="18" cy="7" r="2" fill="currentColor" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" fill="currentColor" fillOpacity="0.2" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z" />
  </svg>
);

export const VolumeOnIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

export const VolumeOffIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

export const MusicIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" fill="currentColor" />
    <circle cx="18" cy="16" r="3" fill="currentColor" />
  </svg>
);

export const WindIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
);

export const ThermometerIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const ScaleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

// ---------------- Fruits (5 Streamlined Vector Icons) ----------------
export const AppleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 4c.6-1.5 2-2.5 3.5-2.5.2 1.5-.7 3-1.8 3.5L12 4z" fill="#4ade80" />
    <path d="M17.5 6.5c-1.5 0-2.5.9-3.5.9s-2-.9-3.5-.9C8 6.5 5 8.7 5 13.5 5 18 8 22 10.5 22c1.2 0 2-.8 3.5-.8s2.3.8 3.5.8c2.5 0 5.5-4 5.5-8.5 0-4.8-3-7-5.5-7z" fill="#f87171" />
  </svg>
);

export const OrangeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="13" r="9" fill="#fb923c" />
    <circle cx="12" cy="13" r="7.5" fill="#fed7aa" />
    <circle cx="12" cy="13" r="2" fill="#ea580c" />
    <path d="M12 4a3 3 0 0 1 3-3c0 2-1 3-3 3z" fill="#4ade80" />
  </svg>
);

export const BlueberryIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="9" cy="14" r="6" fill="#38bdf8" />
    <circle cx="16" cy="12" r="6" fill="#60a5fa" />
    <circle cx="11" cy="9" r="4.5" fill="#818cf8" />
    <path d="M11 5c.5-.8 1.5-1.2 2-1 .2.8-.2 1.5-.8 1.8L11 5z" fill="#4ade80" />
  </svg>
);

export const GuavaIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <ellipse cx="12" cy="13" rx="8.5" ry="9" fill="#86efac" />
    <ellipse cx="12" cy="13" rx="6.5" ry="7" fill="#fb7185" />
    <circle cx="10" cy="11" r="1" fill="#4c0519" />
    <circle cx="14" cy="12" r="1" fill="#4c0519" />
    <circle cx="11" cy="15" r="1" fill="#4c0519" />
  </svg>
);

export const AvocadoIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C8 2 4.5 8 4.5 14c0 4.7 3.4 8 7.5 8s7.5-3.3 7.5-8C19.5 8 16 2 12 2z" fill="#15803d" />
    <path d="M12 4C9 4 6 9 6 14c0 3.6 2.7 6.5 6 6.5s6-2.9 6-6.5C18 9 15 4 12 4z" fill="#bef264" />
    <circle cx="12" cy="15" r="4" fill="#854d0e" />
  </svg>
);

// ---------------- Smokers & Archetypes ----------------
export const MicIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" fillOpacity="0.2" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

export const LeafIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 20A7 7 0 0 1 4 13C4 7 9 2 19 2c0 10-5 15-11 15Z" fill="currentColor" fillOpacity="0.2" />
    <path d="M8 16c3-3 6-6 11-14" />
  </svg>
);

export const CrownIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2 19h20v2H2zM2 6l5 6 5-8 5 8 5-6v11H2z" />
  </svg>
);

export const GuitarIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="16" cy="8" r="5" fill="currentColor" fillOpacity="0.2" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <line x1="12" y1="12" x2="3" y2="21" />
    <line x1="2" y1="20" x2="4" y2="22" />
  </svg>
);

export const DiscIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const GlassesIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="6" cy="14" r="4" fill="currentColor" fillOpacity="0.3" />
    <circle cx="18" cy="14" r="4" fill="currentColor" fillOpacity="0.3" />
    <line x1="10" y1="14" x2="14" y2="14" />
    <path d="M2 14c0-3 2-6 5-6h10c3 0 5 3 5 6" />
  </svg>
);

export const HatIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 18h20v2H2z" fill="currentColor" />
    <path d="M6 18v-8a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v8" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const DiamondIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="6 3 18 3 22 9 12 21 2 9 6 3" />
  </svg>
);

// ---------------- Tools ----------------
export const CigaretteIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="10" width="16" height="4" rx="1" fill="#fff" />
    <rect x="18" y="10" width="4" height="4" rx="1" fill="#ea580c" />
    <line x1="2" y1="10" x2="2" y2="14" stroke="#f97316" strokeWidth="2.5" />
  </svg>
);

export const VapePodIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="8" y="7" width="8" height="14" rx="2" fill="currentColor" fillOpacity="0.2" />
    <rect x="10" y="3" width="4" height="4" rx="1" fill="currentColor" />
    <line x1="12" y1="12" x2="12" y2="15" stroke="#38bdf8" strokeWidth="2" />
  </svg>
);

export const ModBoxIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="6" y="6" width="12" height="16" rx="2" fill="currentColor" fillOpacity="0.2" />
    <rect x="9" y="2" width="3" height="4" rx="1" fill="currentColor" />
    <rect x="9" y="9" width="6" height="5" rx="1" fill="#38bdf8" />
  </svg>
);

export const CigarIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="9" width="20" height="6" rx="3" fill="#78350f" />
    <line x1="7" y1="9" x2="7" y2="15" stroke="#fbbf24" strokeWidth="1.5" />
    <line x1="2" y1="9" x2="2" y2="15" stroke="#ef4444" strokeWidth="2" />
  </svg>
);

export const HookahIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="17" rx="6" ry="5" fill="currentColor" fillOpacity="0.2" />
    <line x1="12" y1="4" x2="12" y2="12" />
    <rect x="10" y="2" width="4" height="2" rx="1" fill="currentColor" />
    <path d="M12 9c4 0 7 2 7 5v4" />
  </svg>
);

export const BongIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 2h4v8l5 9a2 2 0 0 1-1.74 3H6.74A2 2 0 0 1 5 19l5-9V2z" fill="currentColor" fillOpacity="0.2" />
    <line x1="15" y1="13" x2="19" y2="11" />
  </svg>
);

export const BluntIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="2 8 20 10 20 14 2 16" fill="#451a03" />
    <line x1="2" y1="8" x2="2" y2="16" stroke="#f97316" strokeWidth="2.5" />
    <line x1="14" y1="10" x2="14" y2="14" stroke="#fbbf24" strokeWidth="1.5" />
  </svg>
);

export const LungsIcon: React.FC<IconProps & { pulse?: boolean }> = ({ className = 'w-5 h-5', pulse = false }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} ${pulse ? 'animate-pulse' : ''}`}
  >
    <path
      d="M12 3v10M12 3c-1 0-2 1-2 2v4c-3 0-6 2-6 6 0 4 3 6 6 6 1 0 2-1 2-2M12 3c1 0 2 1 2 2v4c3 0 6 2 6 6 0 4-3 6-6 6-1 0-2-1-2-2"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.25"
    />
  </svg>
);

export const ZapOffIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="12.41 6.75 13 2 10.57 4.92" />
    <polyline points="18.57 12.91 21 10 15.66 10" />
    <polyline points="8 8 3 14 12 14 11 22 16 16" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

// ---------------- Icon Resolvers ----------------
export const FruitIconRenderer: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'w-5 h-5' }) => {
  switch (icon) {
    case 'apple': return <AppleIcon className={className} />;
    case 'orange': return <OrangeIcon className={className} />;
    case 'blueberry': return <BlueberryIcon className={className} />;
    case 'guava': return <GuavaIcon className={className} />;
    case 'avocado': return <AvocadoIcon className={className} />;
    default: return <AppleIcon className={className} />;
  }
};

export const ToolIconRenderer: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'w-5 h-5' }) => {
  switch (icon) {
    case 'cigarette': return <CigaretteIcon className={className} />;
    case 'vape': return <VapePodIcon className={className} />;
    case 'modbox': return <ModBoxIcon className={className} />;
    case 'cigar': return <CigarIcon className={className} />;
    case 'hookah': return <HookahIcon className={className} />;
    case 'bong': return <BongIcon className={className} />;
    case 'blunt': return <BluntIcon className={className} />;
    default: return <CigaretteIcon className={className} />;
  }
};

export const CharacterIconRenderer: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'w-5 h-5' }) => {
  switch (icon) {
    case 'mic': return <MicIcon className={className} />;
    case 'leaf': return <LeafIcon className={className} />;
    case 'crown': return <CrownIcon className={className} />;
    case 'guitar': return <GuitarIcon className={className} />;
    case 'disc': return <DiscIcon className={className} />;
    case 'glasses': return <GlassesIcon className={className} />;
    case 'hat': return <HatIcon className={className} />;
    case 'diamond': return <DiamondIcon className={className} />;
    case 'flame': return <FlameIcon className={className} />;
    case 'trophy': return <TrophyIcon className={className} />;
    case 'sparkles': return <SparklesIcon className={className} />;
    default: return <MicIcon className={className} />;
  }
};

export const ChallengeIconRenderer: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'w-5 h-5' }) => {
  switch (icon) {
    case 'wind': return <WindIcon className={className} />;
    case 'thermometer': return <ThermometerIcon className={className} />;
    case 'zapoff': return <ZapOffIcon className={className} />;
    case 'lungs': return <LungsIcon className={className} />;
    case 'flame': return <FlameIcon className={className} />;
    case 'money': return <MoneyIcon className={className} />;
    case 'scale': return <ScaleIcon className={className} />;
    case 'alert': return <AlertTriangleIcon className={className} />;
    default: return <AlertTriangleIcon className={className} />;
  }
};

export const AchievementIconRenderer: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'w-5 h-5' }) => {
  switch (icon) {
    case 'trophy': return <TrophyIcon className={className} />;
    case 'star': return <StarIcon className={className} />;
    case 'flame': return <FlameIcon className={className} />;
    case 'money': return <MoneyIcon className={className} />;
    case 'diamond': return <DiamondIcon className={className} />;
    case 'level': return <LevelIcon className={className} />;
    case 'shield': return <ShieldIcon className={className} />;
    case 'blaster': return <BlasterIcon className={className} />;
    case 'zap': return <ZapIcon className={className} />;
    case 'crown': return <CrownIcon className={className} />;
    case 'award': return <AwardIcon className={className} />;
    case 'apple': return <AppleIcon className={className} />;
    case 'avocado': return <AvocadoIcon className={className} />;
    default: return <AwardIcon className={className} />;
  }
};

