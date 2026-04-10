import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import flowRoutes from './routes/flows';
import assetRoutes from './routes/assets';
import wikiRoutes from './routes/wiki';
import executionRoutes from './routes/execution';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.use('/api/flows', flowRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api/execution', executionRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Backend listening on ${PORT}`));
