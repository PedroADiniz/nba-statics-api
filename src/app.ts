import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './shared/config/env';
import { rateLimiter } from './presentation/middlewares/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './presentation/middlewares/errorHandler.middleware';
import apiRoutes from './presentation/routes/index';

const app = express();

// Security headers 
app.use(helmet());

// CORS 
app.use(
  cors({
    origin: env.corsOrigins.includes('*') ? '*' : env.corsOrigins,
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
    maxAge: 86400,
  }),
);

//Body parsing & compression 
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());

// Request logging 
app.use(
  morgan(env.isDev ? 'dev' : 'combined', {
    skip: (req) => req.path === '/api/v1/health',
  }),
);

// Global rate limiter 
app.use(rateLimiter);

// API routes 
app.use('/api/v1', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
