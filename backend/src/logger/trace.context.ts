import { AsyncLocalStorage } from 'async_hooks';

interface TraceStore {
  traceId: string;
}

export const traceContext = new AsyncLocalStorage<TraceStore>();

export function getTraceId(): string | undefined {
  return traceContext.getStore()?.traceId;
}
