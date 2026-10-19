export class MultipartBodyError extends Error {
  readonly status: 400 | 413;

  constructor(status: 400 | 413, message: string) {
    super(message);
    this.name = 'MultipartBodyError';
    this.status = status;
  }
}

export async function readBoundedMultipartBytes(request: Request, limit: number): Promise<Uint8Array> {
  const declared = request.headers.get('content-length');
  if (declared !== null) {
    if (!/^(0|[1-9][0-9]*)$/.test(declared)) throw new MultipartBodyError(400, 'Invalid request body');
    if (Number(declared) > limit) throw new MultipartBodyError(413, 'Submission too large');
  }
  if (!request.body) throw new MultipartBodyError(400, 'Invalid request body');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      total += chunk.value.byteLength;
      if (total > limit) {
        void reader.cancel().catch(() => undefined);
        throw new MultipartBodyError(413, 'Submission too large');
      }
      chunks.push(chunk.value);
    }
  } catch (error) {
    if (error instanceof MultipartBodyError) throw error;
    throw new MultipartBodyError(400, 'Invalid request body');
  } finally {
    reader.releaseLock();
  }
  if (!total) throw new MultipartBodyError(400, 'Invalid request body');
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
