/**
 * Bounds the actual request stream. The Content-Length header alone is not a
 * security control: chunked requests and misreported lengths must be covered.
 * Pure helper with no applicant data logging, database access or network IO.
 */
export class RequestBodyError extends Error {
  readonly status: 400 | 413 | 415;

  constructor(status: 400 | 413 | 415, message: string) {
    super(message);
    this.name = 'RequestBodyError';
    this.status = status;
  }
}

export const MAX_FORM_BODY_BYTES = 16 * 1024;

export async function parseBoundedJsonBody(
  request: Request,
  limit = MAX_FORM_BODY_BYTES
): Promise<unknown> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!/^application\/json\s*(?:;|$)/i.test(contentType)) {
    throw new RequestBodyError(415, 'JSON content type required');
  }

  const declared = request.headers.get('content-length');
  if (declared !== null) {
    if (!/^(0|[1-9][0-9]*)$/.test(declared)) {
      throw new RequestBodyError(400, 'Invalid request body');
    }
    if (Number(declared) > limit) {
      throw new RequestBodyError(413, 'Submission too large');
    }
  }
  if (!request.body) throw new RequestBodyError(400, 'Invalid JSON submission');

  const reader = request.body.getReader();
  const parts: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      total += chunk.value.byteLength;
      if (total > limit) {
        // Do not wait for a hostile producer to finish after the byte limit.
        void reader.cancel().catch(() => undefined);
        throw new RequestBodyError(413, 'Submission too large');
      }
      parts.push(chunk.value);
    }
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError(400, 'Invalid request body');
  } finally {
    reader.releaseLock();
  }

  if (total === 0) throw new RequestBodyError(400, 'Invalid JSON submission');
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }

  try {
    const value = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return JSON.parse(value) as unknown;
  } catch {
    throw new RequestBodyError(400, 'Invalid JSON submission');
  }
}
