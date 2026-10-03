import { logger } from '../utils/logger.js';

class CacheService {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlMs = 60000) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
    });

    // Auto-cleanup
    const timer = setTimeout(() => this.delete(key), ttlMs);
    this.timers.set(key, timer);
  }

  delete(key) {
    this.store.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  has(key) {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  getAge(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    return Date.now() - entry.createdAt;
  }

  clear() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.store.clear();
    this.timers.clear();
  }

  size() {
    return this.store.size;
  }
}

// Singleton
export const cache = new CacheService();
