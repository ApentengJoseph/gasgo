/** Rejects with a friendly message if `p` takes longer than `ms` (weak mobile signal, dropped connection). */
export function withTimeout<T>(p: PromiseLike<T>, ms: number, message = 'The network is slow right now. Please try again.'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms);
    Promise.resolve(p).then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

/** fetch() that gives up after `ms` milliseconds. */
export function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, ms = 20000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(input, { ...init, signal: ctrl.signal })
    .catch(e => { throw new Error(e?.name === 'AbortError' ? 'The network is slow right now. Please try again.' : 'Network problem. Check your connection and try again.'); })
    .finally(() => clearTimeout(t));
}
