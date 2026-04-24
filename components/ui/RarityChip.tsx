// Rarity pill badge — color + label by rarity.
// Ported from design/project/app/ui.jsx.

export type Rarity = 'common' | 'rare' | 'legendary';

type RarityChipProps = {
  rarity: Rarity;
  className?: string;
};

const LABEL: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  legendary: 'Legendary',
};

const BG: Record<Rarity, string> = {
  common: 'bg-rarity-common',
  rare: 'bg-rarity-rare',
  legendary: 'bg-rarity-legendary',
};

export function RarityChip({ rarity, className = '' }: RarityChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-bold uppercase tracking-wide text-white whitespace-nowrap ${BG[rarity]} ${className}`}
    >
      {rarity === 'legendary' && <span aria-hidden>★</span>}
      {LABEL[rarity]}
    </span>
  );
}

export default RarityChip;
