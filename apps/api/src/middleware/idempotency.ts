import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types';

// In a real implementation, this would use KV or Redis.
const idempotencyCache = new Map<string, { status: 'in-progress' | 'completed', response?: any, timestamp: number }>();

export const idempotencyMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const method = c.req.method;
  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return next();
  }

  const idempotencyKey = c.req.header('X-Idempotency-Key');
  if (!idempotencyKey) {
    // For MVP we might not strictly enforce it everywhere, but let's enforce it if we want safe retries.
    // return c.json({ success: false, error: 'X-Idempotency-Key header is required for mutations' }, 400);
    return next();
  }

  const cached = idempotencyCache.get(idempotencyKey);
  const now = Date.now();

  if (cached) {
    if (now - cached.timestamp > 24 * 60 * 60 * 1000) {
      idempotencyCache.delete(idempotencyKey);
    } else {
      if (cached.status === 'in-progress') {
        return c.json({ success: false, error: 'Request is already in progress' }, 409);
      }
      return c.json(cached.response);
    }
  }

  idempotencyCache.set(idempotencyKey, { status: 'in-progress', timestamp: now });

  try {
    await next();
    if (c.res.ok) {
      // we need to clone the response to cache it
      const clone = c.res.clone();
      try {
          const body = await clone.json();
          idempotencyCache.set(idempotencyKey, { status: 'completed', response: body, timestamp: now });
      } catch {
         // Not JSON
         idempotencyCache.delete(idempotencyKey);
      }
    } else {
      idempotencyCache.delete(idempotencyKey);
    }
  } catch (error) {
    idempotencyCache.delete(idempotencyKey);
    throw error;
  }
});
