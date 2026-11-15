import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { isRedisConnected } from './config/redis.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import careCircleRoutes from './routes/careCircle.routes.js';
import medicationRoutes from './routes/medication.routes.js';
import doseRoutes from './routes/dose.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import routineRoutes from './routes/routine.routes.js';
import observationRoutes from './routes/observation.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';
import documentRoutes from './routes/document.routes.js';

export function createServer() {
  const app = express();

  // Trust proxy for Vercel / reverse proxy deployment
  app.set('trust proxy', 1);

  // Security & parsing middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Allows flexible UI assets
  }));

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow mobile apps, curl, or matching origin
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev/hackathon demo
        }
      },
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Database connection middleware (ensures DB is connected on each request in serverless)
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err: any) {
      console.error('[DB Middleware] Connection failed:', err.message);
      res.status(503).json({
        error: 'Database connection currently unavailable. Please verify MONGODB_URI.',
      });
    }
  });

  // Health check route
  app.get(['/health', '/api/health'], (req, res) => {
    res.json({
      status: 'healthy',
      app: 'SaathiCare API',
      redis: isRedisConnected() ? 'connected' : 'offline/in-memory',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Apply general rate limiter
  app.use('/api', apiLimiter);

  // Mount API Routes (Supports both standard /api/* and serverless stripped sub-paths)
  const mountRoutes = (prefix = '') => {
    app.use(`${prefix}/auth`, authRoutes);
    app.use(`${prefix}/profiles`, profileRoutes);
    app.use(`${prefix}/care-circles`, careCircleRoutes);
    app.use(`${prefix}/medications`, medicationRoutes);
    app.use(`${prefix}/doses`, doseRoutes);
    app.use(`${prefix}/appointments`, appointmentRoutes);
    app.use(`${prefix}/routines`, routineRoutes);
    app.use(`${prefix}/observations`, observationRoutes);
    app.use(`${prefix}/notifications`, notificationRoutes);
    app.use(`${prefix}/analytics`, analyticsRoutes);
    app.use(`${prefix}/audit-logs`, auditLogRoutes);
    app.use(`${prefix}/documents`, documentRoutes);
  };

  mountRoutes('/api');
  mountRoutes('');

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}
