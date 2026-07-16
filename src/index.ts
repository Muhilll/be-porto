import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { loggerMiddleware } from './middleware/appToken';
import { originGuard, corsMiddleware } from './middleware/originGuard';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import userRoutes from './app/user/route/user.route';
import roleRoutes from './app/role/route/role.route';
import menuRoutes from './app/menu/route/menu.route';
import rolePermissionRoutes from './app/role_permission/route/role-permission.route';
import { apiReference } from '@scalar/hono-api-reference';
import {
  createOpenApiDocument,
  getServerUrl,
} from './docs/openapi';

const app = new Hono();

// Global Middleware
app.use('*', corsMiddleware);
app.use('*', originGuard);
app.use(logger());
app.use(loggerMiddleware);

// Welcome endpoint (Public)
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Welcome to Hono Backend Starter API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint (Public)
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// OpenAPI and Scalar reference (Public)
app.get('/openapi.json', (c) => {
  const baseUrl = getServerUrl(c.req.url);
  return c.json(createOpenApiDocument(baseUrl));
});

app.get('/docs', apiReference({
  spec: {
    url: '/openapi.json',
  },
}));

// API Routes - Feature based
// Note: User routes have public login endpoint, others require JWT
app.route('/api/users', userRoutes);
app.route('/api/roles', roleRoutes);
app.route('/api/menus', menuRoutes);
app.route('/api/role-permissions', rolePermissionRoutes);

// Handlers
app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
