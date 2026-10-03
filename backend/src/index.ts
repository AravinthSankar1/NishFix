import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import { publicSoftwareRouter, adminSoftwareRouter } from './routes/softwareRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';
import { AuthService } from './services/authService.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Mobile Repair Software Library API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    storageConfigured: Boolean(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/software', publicSoftwareRouter);
app.use('/api/admin', adminSoftwareRouter);
app.use('/api/uploads', storageRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server & Ensure Admin Account
const PORT = env.PORT;
app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`  MOBILE PHONE REPAIR SOFTWARE LIBRARY BACKEND`);
  console.log(`==================================================`);
  console.log(`  Server running on port: ${PORT}`);
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Client URL: ${env.CLIENT_URL}`);
  console.log(`  R2 Bucket: ${env.R2_BUCKET_NAME}`);
  console.log(`==================================================\n`);

  // Ensure default admin user in DB
  await AuthService.ensureDefaultAdmin();
});

export default app;
