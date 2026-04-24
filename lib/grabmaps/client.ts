// Shared GrabMaps helpers: auth header, URL builder, JSON fetch, host allowlist.

export const GRAB_BASE_URL = 'https://maps.grab.com';

export function grabAuthHeader(apiKey: string): string {
  return apiKey.toLowerCase().startsWith('bearer ') ? apiKey : `Bearer ${apiKey}`;
}

export function getApiKey(): string {
  const key = process.env.GRABMAPS_API_KEY;
  if (!key) {
    throw new Error('GRABMAPS_API_KEY is not set');
  }
  return key;
}

export function buildGrabUrl(
  path: string,
  params?: Record<string, string | number | undefined>,
): URL {
  const url = new URL(path, GRAB_BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

export async function fetchGrabJson<T>(url: string | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.text();

  let payload: unknown = null;
  if (body) {
    try {
      payload = JSON.parse(body);
    } catch {
      payload = { message: body };
    }
  }

  if (!response.ok) {
    const p = (payload ?? {}) as Record<string, unknown>;
    const detail =
      (p.Message as string | undefined) ||
      (p.message as string | undefined) ||
      (p.Code as string | undefined) ||
      (p.code as string | undefined) ||
      `Request failed with status ${response.status}`;
    throw new Error(String(detail));
  }

  return payload as T;
}

export function isAllowedGrabResource(url: string): boolean {
  try {
    const parsed = new URL(url);
    const base = new URL(GRAB_BASE_URL);
    return parsed.protocol === 'https:' && parsed.host === base.host;
  } catch {
    return false;
  }
}
