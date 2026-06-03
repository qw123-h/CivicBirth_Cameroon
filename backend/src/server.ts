import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger, logInfo, logError } from './config/logger';
import { errorMiddleware } from './middleware/error.middleware';
import { auditMiddleware } from './middleware/audit.middleware';

// Routes
import authRoutes from './modules/auth/auth.routes';
import registrationsRoutes from './modules/registrations/registrations.routes';
import certificatesRoutes from './modules/certificates/certificates.routes';
import agentsRoutes from './modules/agents/agents.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import usersRoutes from './modules/users/users.routes';

const app = express();

// Security & middleware
app.use(helmet());
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);

// Logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg) } }));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later',
});

app.use(globalLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Audit middleware
app.use(auditMiddleware);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// Error handler (must be last)
app.use(errorMiddleware);

// Server startup
async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(config.PORT, () => {
      logInfo(
        `✅ CivicBirth Backend running on http://localhost:${config.PORT}`,
      );
      logInfo(`🌍 CORS enabled for: ${config.FRONTEND_URL}`);
      logInfo(`📊 Environment: ${config.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logInfo('📍 SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        logInfo('✅ HTTP server closed');
        await disconnectDatabase();
        logInfo('✅ Database disconnected');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logInfo('📍 SIGINT signal received: closing HTTP server');
      server.close(async () => {
        logInfo('✅ HTTP server closed');
        await disconnectDatabase();
        logInfo('✅ Database disconnected');
        process.exit(0);
      });
    });

    process.on('unhandledRejection', (reason: Error) => {
      logError('Unhandled Rejection', reason);
      process.exit(1);
    });

    process.on('uncaughtException', (error: Error) => {
      logError('Uncaught Exception', error);
      process.exit(1);
    });
  } catch (error) {
    logError('Failed to start server', error as Error);
    process.exit(1);
  }
}

startServer();

export default app;
