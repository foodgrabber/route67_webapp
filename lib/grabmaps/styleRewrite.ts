// Rewrites every https://maps.grab.com/... URL inside a MapLibre style JSON to route through our /api/grab-resource proxy.

import { GRAB_BASE_URL } from './client';

export function rewriteGrabStyleUrls(style: unknown, origin: string): unknown {
  const base = new URL(GRAB_BASE_URL);
  const hostPattern = base.host.replace(/\./g, '\\.');
  // Match https://<grab host>/... up to the first closing quote.
  const pattern = new RegExp(`https://${hostPattern}/[^"\\\\]+`, 'g');

  const trimmedOrigin = origin.replace(/\/$/, '');

  const serialized = JSON.stringify(style);
  const rewritten = serialized.replace(pattern, (match) => {
    // Preserve MapLibre template braces so MapLibre still substitutes {z}/{x}/{y}/{fontstack}/{range}.
    const encoded = encodeURIComponent(match).replace(/%7B/gi, '{').replace(/%7D/gi, '}');
    return `${trimmedOrigin}/api/grab-resource?url=${encoded}`;
  });

  return JSON.parse(rewritten);
}
