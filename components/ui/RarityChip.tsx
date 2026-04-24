// Rarity pill badge — color + label by rarity.
// Design uses a soft tinted background with colored text and a thin tinted border,
// not a solid color with white text. Keeps the legendary star.
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

const STYLE: Record<Rarity, string> = {
  common:
    'bg-rarity-common-tint text-rarity-common border border-rarity-common/30',
  rare: 'bg-rarity-rare-tint text-rarity-rare border border-rarity-rare/30',
  legendary:
    'bg-rarity-legendary-tint text-rarity-legendary border border-rarity-legendary/40',
};

export function RarityChip({ rarity, className = '' }: RarityChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${STYLE[rarity]} ${className}`}
    >
      {rarity === 'legendary' && <span aria-hidden>★</span>}
      {LABEL[rarity]}
    </span>
  );
}

export default RarityChip;
