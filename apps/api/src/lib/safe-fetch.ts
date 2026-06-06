export async function safeFetchJson<T = any>(input: RequestInfo, init?: RequestInit & { timeout?: number }): Promise<T> {
  const timeout = init?.timeout ?? 10000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const errorBody = await response.json();
        const errorMessage = typeof errorBody === 'object' && errorBody !== null
          ? (errorBody.error || errorBody.message || JSON.stringify(errorBody))
          : String(errorBody);
        throw new Error(`External request failed: ${errorMessage}`);
      }

      const text = await response.text();
      throw new Error(`External request failed: ${response.status} ${response.statusText} - ${text}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON response but got ${contentType}: ${text}`);
    }

    return response.json() as Promise<T>;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`External request timed out after ${timeout}ms`);
    }
    throw error;
  }
}
