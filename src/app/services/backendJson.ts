const BACKEND_PROXY_PREFIX = "/api/backend";

export function backendUrl(path: string) {
  return `${BACKEND_PROXY_PREFIX}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function backendJSON<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(backendUrl(path), init);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Backend request failed (${res.status})`);
  }
  return JSON.parse(text) as T;
}
