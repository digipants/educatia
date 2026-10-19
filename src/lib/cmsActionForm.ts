export class CmsActionFormError extends Error {}

// Next.js can attach internal action routing fields to native form submissions.
// Treat only framework-generated keys as metadata. All editorial user fields
// still have a strict exact allowlist, with no duplicate values or file uploads.
const actionMetadataPattern = /^\$ACTION_(?:ID_|REF_|KEY|SIG|BOUND|ARITY)/;
const MAX_METADATA_FIELDS = 10;
const MAX_METADATA_VALUE = 2048;

export function parseCmsActionForm(form: FormData, keys: readonly string[]): Record<string, string> {
  const expected = new Set(keys);
  const values = new Map<string, string>();
  let frameworkFields = 0;
  form.forEach((value, key) => {
    if (actionMetadataPattern.test(key)) {
      frameworkFields++;
      if (frameworkFields > MAX_METADATA_FIELDS || typeof value !== 'string' ||
        value.length > MAX_METADATA_VALUE) throw new CmsActionFormError('Invalid request');
      return;
    }
    if (!expected.has(key) || values.has(key) || typeof value !== 'string') {
      throw new CmsActionFormError('Invalid request');
    }
    values.set(key, value);
  });
  if (values.size !== expected.size) throw new CmsActionFormError('Invalid request');
  return Object.fromEntries(values);
}
