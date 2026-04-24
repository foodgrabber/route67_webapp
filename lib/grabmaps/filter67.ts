// "67"-themed place filters. Ported from example/frontend/server.js (startsWith67).
// We match two tiers so the hunt has enough pins to be fun while still favouring
// truly 67-flavoured addresses.

const STRICT_RE = /^\s*67(?:\b|[-/])/i;
const LOOSE_RE = /\b67\b/;

export function startsWith67(text: string | null | undefined): boolean {
  if (!text) return false;
  return STRICT_RE.test(text);
}

export function contains67(text: string | null | undefined): boolean {
  if (!text) return false;
  return LOOSE_RE.test(text);
}

export type Match67Tier = 'strict' | 'loose' | 'none';

// Returns 'strict' if any field starts with "67" (matches example/frontend exactly),
// 'loose' if "67" appears at a word boundary anywhere in name or address,
// 'none' otherwise. Strict beats loose beats none — used to sort candidates so
// the best 67-addresses fill the rarity slots first.
export function match67Tier(place: {
  name?: string | null;
  address?: string | null;
}): Match67Tier {
  if (startsWith67(place.address) || startsWith67(place.name)) return 'strict';
  if (contains67(place.address) || contains67(place.name)) return 'loose';
  return 'none';
}
