// Generic rounded-full badge. Ported from design/project/app/ui.jsx.

import type { ReactNode } from 'react';

export type PillTone =
  | 'primary'
  | 'muted'
  | 'accent'
  | 'dark'
  | 'outline'
  | 'rarity-common'
  | 'rarity-rare'
  | 'rarity-legendary';

type PillProps = {
  children: ReactNode;
  className?: string;
  tone?: PillTone;
};

const TONE: Record<PillTone, string> = {
  primary: 'bg-primary-tint text-primary-dark',
  muted: 'bg-surface-alt text-muted',
  accent: 'bg-accent/15 text-accent',
  dark: 'bg-text text-surface',
  outline: 'bg-surface/80 backdrop-blur text-text border border-border',
  'rarity-common':
    'bg-rarity-common-tint text-rarity-common border border-rarity-common/30',
  'rarity-rare':
    'bg-rarity-rare-tint text-rarity-rare border border-rarity-rare/30',
  'rarity-legendary':
    'bg-rarity-legendary-tint text-rarity-legendary border border-rarity-legendary/40',
};

export function Pill({ children, className = '', tone = 'muted' }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Pill;
