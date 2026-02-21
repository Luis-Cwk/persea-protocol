import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';

config();

import batchesRouter from './routes/batches';
import marketRouter from './routes/market';
import usersRouter from './routes/users';
import dataRouter from './routes/data';
import authRouter from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    name: 'PERSÉA Protocol API',
    version: '1.0.0',
    description: 'Trazabilidad y Aprovechamiento de Residuos del Aguacate en Blockchain',
    endpoints: {
      auth: '/auth',
      batches: '/batches',
      market: '/market',
      users: '/users',
      data: '/data',
    },
  });
});

app.use('/auth', authRouter);
app.use('/batches', batchesRouter);
app.use('/market', marketRouter);
app.use('/users', usersRouter);
app.use('/data', dataRouter);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`PERSÉA API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
