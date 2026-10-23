export async function readStream(
  response: Response,
  onChunk: (chunk: string) => void
): Promise<void> {
  if (!response.body) throw new Error('ReadableStream not supported');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } finally {
    reader.releaseLock();
  }
}