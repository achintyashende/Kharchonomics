import React from 'react';

const ICONS: Record<string, React.ReactNode> = {
  cash: <><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9v.01M18 15v.01"/></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>,
  bank: <><path d="m3 10 9-6 9 6"/><path d="M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16"/></>,
  wallet: <><path d="M4 7h14a3 3 0 0 1 3 3v8H4z"/><path d="M4 7l10-3h4v3"/><path d="M16 13h5"/></>,
  coins: <><ellipse cx="9" cy="7" rx="5" ry="3"/><path d="M4 7v7c0 1.7 2.2 3 5 3s5-1.3 5-3V7"/><path d="M14 10c2.8.2 5 1.4 5 3v4c0 1.7-2.2 3-5 3-1.5 0-2.9-.4-3.8-1"/></>,
  piggy: <><path d="M5 11c0-3 3-5 7-5 3.8 0 7 2.2 7 5.2V16h-2l-1 3h-3l-.7-2H9l-.7 2H5l1-3c-1.7-.7-3-2.1-3-4h2z"/><path d="M16 8l2-3v4M9 9h4"/><circle cx="8" cy="11" r=".5"/></>,
  briefcase: <><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M9 7V5h6v2M3 12h18"/></>,
  utensils: <><path d="M6 3v8M9 3v8M6 7h3M7.5 11v10"/><path d="M17 3c-2 2-3 4.5-3 8h4v10"/></>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></>,
  receipt: <><path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
  shirt: <><path d="M9 4 5 6 3 11l4 2v7h10v-7l4-2-2-5-4-2a3 3 0 0 1-6 0z"/></>,
  heart: <><path d="M20 8c0 6-8 11-8 11S4 14 4 8a4 4 0 0 1 7-2.6A4 4 0 0 1 20 8z"/></>,
  fuel: <><path d="M5 21V4h9v17"/><path d="M4 21h12M8 8h3"/><path d="m14 7 4 4v7a2 2 0 0 0 4 0v-6l-3-3"/></>,
  shopping: <><path d="M6 8h12l-1 13H7z"/><path d="M9 8a3 3 0 0 1 6 0"/></>,
  graduation: <><path d="m3 8 9-4 9 4-9 4z"/><path d="M7 11v5c3 2 7 2 10 0v-5"/><path d="M21 8v6"/></>,
  phone: <><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></>,
  baby: <><circle cx="12" cy="10" r="5"/><path d="M8 15c1.5 2 6.5 2 8 0M9 10h.01M15 10h.01M10 13c1.2.8 2.8.8 4 0"/></>,
  sparkles: <><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5z"/><path d="M19 3v4M17 5h4"/></>,
  activity: <><path d="M4 13h4l2-6 4 12 2-6h4"/></>,
  salary: <><path d="M12 2v20M17 6.5c-1.2-1-3-1.5-5-1.5-2.8 0-5 1.3-5 3.5s2.2 3.1 5 3.5 5 .9 5 3.5-2.2 3.5-5 3.5c-2.1 0-4-.7-5.2-1.8"/></>,
  gift: <><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18"/><path d="M7.5 8C5 6 6.2 3 8.5 4.2 10 5 12 8 12 8s2-3 3.5-3.8C17.8 3 19 6 16.5 8"/></>,
  chart: <><path d="M4 19V5"/><path d="M8 17V9M13 17V5M18 17v-6"/><path d="M4 19h17"/></>,
  'plus-circle': <><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></>,
  car: <><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></>,
  plane: <><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 4-3 3-3.3-.8c-.4-.1-.9.1-1.1.5l-.6.9 4.5 2 2 4.5.9-.6c.4-.2.6-.7.5-1.1L11 18l3-3 4 6l1.2-.7c.4-.2.7-.6.6-1.1z"/></>,
  coffee: <><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></>,
  music: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
  camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></>,
  gamepad: <><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></>,
  tv: <><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></>,
  scissors: <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></>,
  book: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></>,
  bus: <><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
  shield: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 3 0 5 1 7 2a1 1 0 0 1 1 1z"/></>,
  building: <><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></>,
};

export function CategoryIcon({ name, className = "" }: { name: string; className?: string }) {
  const content = ICONS[name] || ICONS['receipt'];

  return (
    <svg 
      viewBox="0 0 24 24" 
      aria-hidden="true" 
      className={className}
      fill="none" 
      stroke="currentColor" 
      strokeWidth={2.6} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {content}
    </svg>
  );
}
