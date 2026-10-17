type Environment = Readonly<Record<string, string | undefined>>;

export type AdminConfiguration = {
  enabled: boolean;
  administratorEmails: string[];
};

const emailPattern = /^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/;
const applicationIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_PAGE = 10_000;
const MAX_PAGE_SIZE = 50;

function normalizeEmail(email: unknown) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

function hasStrongSecret(value: string | undefined) {
  return typeof value === 'string' && value.trim().length >= 32;
}

function isHttpUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || (
      url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export function getAdminConfiguration(env: Environment): AdminConfiguration {
  const administratorEmails = (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(normalizeEmail)
    .filter((email) => emailPattern.test(email));

  const enabled =
    env.ADMIN_APPLICATIONS_ENABLED === 'true' &&
    env.APPLICATION_STORAGE_ENABLED === 'true' &&
    hasValue(env.MONGODB_URI) &&
    hasStrongSecret(env.NEXTAUTH_SECRET) &&
    isHttpUrl(env.NEXTAUTH_URL) &&
    hasValue(env.GOOGLE_CLIENT_ID) &&
    hasValue(env.GOOGLE_CLIENT_SECRET) &&
    administratorEmails.length > 0;

  return { enabled, administratorEmails };
}

export function isAllowedAdministrator(email: unknown, administratorEmails: string[]) {
  const normalizedEmail = normalizeEmail(email);
  return Boolean(normalizedEmail && administratorEmails.includes(normalizedEmail));
}

export function isVerifiedGoogleAdministrator(
  profileEmail: unknown,
  profileEmailVerified: unknown,
  userEmail: unknown,
  administratorEmails: string[]
) {
  const normalizedProfileEmail = normalizeEmail(profileEmail);
  return (
    profileEmailVerified === true &&
    normalizedProfileEmail === normalizeEmail(userEmail) &&
    isAllowedAdministrator(normalizedProfileEmail, administratorEmails)
  );
}

export type AdminReadResult<T> =
  | { status: 'unavailable' | 'unauthenticated' | 'unauthorized' | 'error' }
  | { status: 'ok'; value: T };

export async function readAsAdministrator<T>(
  configuration: AdminConfiguration,
  email: unknown,
  read: () => Promise<T>
): Promise<AdminReadResult<T>> {
  if (!configuration.enabled) return { status: 'unavailable' };
  if (typeof email !== 'string' || !email.trim()) return { status: 'unauthenticated' };
  if (!isAllowedAdministrator(email, configuration.administratorEmails)) {
    return { status: 'unauthorized' };
  }

  try {
    return { status: 'ok', value: await read() };
  } catch {
    return { status: 'error' };
  }
}

type SearchParameter = string | string[] | undefined;

function parseInteger(value: SearchParameter, fallback: number, maximum: number) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d{0,4}$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : null;
}

export function parseApplicationPagination(input: {
  page?: SearchParameter;
  limit?: SearchParameter;
}) {
  const page = parseInteger(input.page, 1, MAX_PAGE);
  const limit = parseInteger(input.limit, 20, MAX_PAGE_SIZE);
  if (page === null || limit === null) return null;
  return { page, limit, skip: (page - 1) * limit };
}

export function isValidApplicationId(value: string) {
  return applicationIdPattern.test(value);
}
