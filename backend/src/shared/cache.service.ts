import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  storedAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string, ttlMs: number): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.storedAt > ttlMs) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, { value, storedAt: Date.now() });
  }

  invalidate(key: string): void {
    if (this.store.delete(key)) {
      this.logger.debug(`Caché invalidada: ${key}`);
    }
  }
}
