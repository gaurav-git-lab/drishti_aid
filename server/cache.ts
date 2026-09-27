/**
 * DRISHTI-AID Server-Side Computation Cache
 * TTL-aware in-memory cache with automatic stale eviction.
 * Prevents redundant SAR/risk/routing computations for identical inputs.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class ComputationCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly maxSize: number;

  constructor(ttlMs: number = 60_000, maxSize: number = 100) {
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    // Evict oldest entry if at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  /** Evict all entries that have expired */
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }

  get size(): number {
    return this.store.size;
  }
}

// Shared cache instances — 60s TTL is appropriate since disaster scenarios
// are deterministic for the same (scenarioId, timelineHour) combination.
import type { ChangeDetectionResult } from './changeDetection.ts';
import type { RiskAnalysisResult } from './riskScoring.ts';
import type { RoutePlanningResult } from './routingEngine.ts';

export const changeDetectionCache = new ComputationCache<ChangeDetectionResult>(60_000);
export const riskZonesCache       = new ComputationCache<RiskAnalysisResult>(60_000);
export const routesCache          = new ComputationCache<RoutePlanningResult>(60_000);

/** Generate a canonical cache key */
export function pipelineCacheKey(scenarioId: string, timelineHour: number): string {
  return `${scenarioId}:${timelineHour}`;
}
