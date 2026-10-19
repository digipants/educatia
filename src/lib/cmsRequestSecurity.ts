export function isSameOriginMutation(request: Request): boolean {
  const originValue = request.headers.get('origin');
  const host = request.headers.get('host')?.trim().toLowerCase();
  if (!originValue || !host) return false;
  try {
    const origin = new URL(originValue);
    if (origin.host.toLowerCase() !== host || origin.username || origin.password) return false;
    if (origin.protocol !== 'https:' && !(origin.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname))) return false;
    const fetchSite = request.headers.get('sec-fetch-site');
    return fetchSite === null || fetchSite === 'same-origin' || fetchSite === 'none';
  } catch {
    return false;
  }
}
