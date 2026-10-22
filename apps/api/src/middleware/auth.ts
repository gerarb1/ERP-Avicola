import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types';

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  // For MVP, we simply accept a user-id + role from headers
  const userId = c.req.header('X-User-Id');
  const userRole = c.req.header('X-User-Role');

  if (!userId || !userRole) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  c.set('userId', userId);
  c.set('userRole', userRole);

  await next();
});
