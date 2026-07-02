import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { join } from 'path';
import { config, isProduction } from './config/env.js';
import uploadRoutes from './routes/upload.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();

app.use(cors({
  origin: isProduction ? false : config.clientUrl,
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

if (isProduction) {
  const clientDist = join(process.cwd(), 'client/dist');
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => res.sendFile(join(clientDist, 'index.html')));
  }
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  if (!isProduction) {
    console.log(`CORS origin: ${config.clientUrl}`);
    console.log(`S3 bucket: ${config.aws.bucket} (${config.aws.region})`);
  }
});
