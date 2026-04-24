// Generic rounded-full badge. Ported from design/project/app/ui.jsx.

import type { ReactNode } from 'react';

export type PillTone = 'primary' | 'muted' | 'accent';

type PillProps = {
  children: ReactNode;
  className?: string;
  tone?: PillTone;
};

const TONE: Record<PillTone, string> = {
  primary: 'bg-primary-tint text-primary-dark',
  muted: 'bg-surface-alt text-muted',
  accent: 'bg-accent/15 text-accent',
};

export function Pill({ children, className = '', tone = 'muted' }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Pill;
