import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { loggerMiddleware } from './middleware/appToken';
import { originGuard, corsMiddleware } from './middleware/originGuard';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { serveStatic } from 'hono/bun';
import userRoutes from './app/user/route/user.route';
import roleRoutes from './app/role/route/role.route';
import menuRoutes from './app/menu/route/menu.route';
import rolePermissionRoutes from './app/role_permission/route/role-permission.route';
import profileRoutes from './app/portfolio_profile/route/profile.route';
import projectRoutes from './app/portfolio_project/route/project.route';
import uploadRoutes from './app/upload/route/upload.route';
import { experienceRouter, educationRouter, skillRouter } from './app/portfolio_about/route/about.route';
import certificateRoutes from './app/portfolio_certificate/route/certificate.route';
import serviceRoutes from './app/portfolio_service/route/service.route';
import contactRoutes from './app/portfolio_contact/route/contact.route';
import blogRoutes from './app/portfolio_blog/route/blog.route';
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

// Serve uploaded static files
app.use('/uploads/*', serveStatic({ root: './public' }));

// API Routes - Feature based
// Note: User routes have public login endpoint, others require JWT
app.route('/api/users', userRoutes);
app.route('/api/roles', roleRoutes);
app.route('/api/menus', menuRoutes);
app.route('/api/role-permissions', rolePermissionRoutes);
app.route('/api/profile', profileRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/experiences', experienceRouter);
app.route('/api/educations', educationRouter);
app.route('/api/skills', skillRouter);
app.route('/api/certificates', certificateRoutes);
app.route('/api/services', serviceRoutes);
app.route('/api/contact', contactRoutes);
app.route('/api/blogs', blogRoutes);

// Handlers
app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
