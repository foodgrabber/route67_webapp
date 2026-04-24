// Edge proxy: streams a whitelisted maps.grab.com resource (tile/font/sprite) through with Bearer auth.

import { getApiKey, grabAuthHeader, isAllowedGrabResource } from '@/lib/grabmaps/client';

export const runtime = 'edge';

export async function GET(req: Request): Promise<Response> {
  const reqUrl = new URL(req.url);
  const url = reqUrl.searchParams.get('url');

  if (!url) {
    return new Response('missing url', { status: 400 });
  }

  if (!isAllowedGrabResource(url)) {
    return new Response('forbidden host', { status: 403 });
  }

  try {
    const apiKey = getApiKey();
    const upstream = await fetch(url, {
      headers: { Authorization: grabAuthHeader(apiKey) },
    });

    const headers = new Headers();
    const contentType = upstream.headers.get('content-type');
    const contentEncoding = upstream.headers.get('content-encoding');
    if (contentType) headers.set('content-type', contentType);
    if (contentEncoding) headers.set('content-encoding', contentEncoding);
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    console.error(err);
    return new Response('resource proxy failed', { status: 502 });
  }
}
