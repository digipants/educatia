type Environment = Readonly<Record<string, string | undefined>>;

export type CmsRole = 'editor' | 'publisher';
export type CmsConfiguration = {
  enabled: boolean;
  publishingEnabled: boolean;
  editors: string[];
  publishers: string[];
};

const emailPattern = /^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/;

function normalizedEmails(list: string | undefined): string[] {
  const entries = (list ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  // Invalid entries fail the whole allowlist rather than silently skipping.
  if (entries.some((x) => !emailPattern.test(x))) return [];
  return [...new Set(entries)];
}

function allowedUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ||
      (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname));
  } catch { return false; }
}

export function getCmsConfiguration(env: Environment): CmsConfiguration {
  const editors = normalizedEmails(env.CMS_EDITOR_EMAILS);
  const publishers = normalizedEmails(env.CMS_PUBLISHER_EMAILS);
  const enabled = env.CMS_CONTENT_ENABLED === 'true' &&
    Boolean(env.MONGODB_URI?.trim()) &&
    Boolean(env.GOOGLE_CLIENT_ID?.trim()) &&
    Boolean(env.GOOGLE_CLIENT_SECRET?.trim()) &&
    typeof env.NEXTAUTH_SECRET === 'string' && env.NEXTAUTH_SECRET.trim().length >= 32 &&
    allowedUrl(env.NEXTAUTH_URL) &&
    editors.length + publishers.length > 0;
  return {
    enabled,
    publishingEnabled: enabled && env.CMS_PUBLISHING_ENABLED === 'true' && publishers.length > 0,
    editors,
    publishers
  };
}

export function getCmsRole(configuration: CmsConfiguration, email: unknown): CmsRole | null {
  if (!configuration.enabled || typeof email !== 'string') return null;
  const normalized = email.trim().toLowerCase();
  if (configuration.publishers.includes(normalized)) return 'publisher';
  if (configuration.editors.includes(normalized)) return 'editor';
  return null;
}

export function isVerifiedGoogleCmsStaff(
  profileEmail: unknown,
  profileVerified: unknown,
  userEmail: unknown,
  configuration: CmsConfiguration
): boolean {
  if (profileVerified !== true || typeof profileEmail !== 'string' || typeof userEmail !== 'string') {
    return false;
  }
  const normalized = profileEmail.trim().toLowerCase();
  return normalized === userEmail.trim().toLowerCase() && getCmsRole(configuration, normalized) !== null;
}

export async function withCmsStaff<T>(
  configuration: CmsConfiguration,
  email: unknown,
  required: CmsRole,
  operation: () => Promise<T>
): Promise<{ status: 'ok'; value: T } | { status: 'unavailable' | 'unauthenticated' | 'unauthorized' | 'error' }> {
  if (!configuration.enabled) return { status: 'unavailable' };
  if (typeof email !== 'string' || !email.trim()) return { status: 'unauthenticated' };
  const role = getCmsRole(configuration, email);
  if (!role || (required === 'publisher' && (role !== 'publisher' || !configuration.publishingEnabled))) {
    return { status: 'unauthorized' };
  }
  try { return { status: 'ok', value: await operation() }; }
  catch { return { status: 'error' }; }
}
