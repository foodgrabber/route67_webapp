// Edge proxy: fetches GrabMaps style.json and rewrites all maps.grab.com URLs to /api/grab-resource.

import { buildGrabUrl, getApiKey, grabAuthHeader } from '@/lib/grabmaps/client';
import { rewriteGrabStyleUrls } from '@/lib/grabmaps/styleRewrite';

export const runtime = 'edge';

function resolveOrigin(req: Request): string {
  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  if (host) return `${proto}://${host}`;
  return new URL(req.url).origin;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const apiKey = getApiKey();
    const reqUrl = new URL(req.url);
    const theme = reqUrl.searchParams.get('theme') || 'basic';

    const upstream = buildGrabUrl('/api/style.json', { theme });
    const response = await fetch(upstream, {
      headers: { Authorization: grabAuthHeader(apiKey) },
    });

    if (!response.ok) {
      return new Response(`style fetch failed: ${response.status}`, { status: 502 });
    }

    const style = await response.json();
    const rewritten = rewriteGrabStyleUrls(style, resolveOrigin(req));

    return Response.json(rewritten, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch (err) {
    console.error(err);
    return new Response('style fetch failed', { status: 502 });
  }
}
