import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types';

export function requireRole(...roles: string[]) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const userRole = c.var.userRole;
    
    if (!roles.includes(userRole) && userRole !== 'administrador') {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }

    await next();
  });
}
