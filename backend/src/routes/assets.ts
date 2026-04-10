import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getDb } from '../lib/db';
import { createUUID } from '../../../shared/src/index';

const upload = multer({ dest: path.resolve(process.cwd(), 'data/uploads') });
const router = Router();

router.get('/', async (_, res) => {
  const db = await getDb();
  const rows = await db.all('SELECT id, path, mime, metadata FROM assets');
  res.json(rows);
});

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  const db = await getDb();
  const id = createUUID();
  const metadata = JSON.stringify({ originalName: req.file.originalname });
  await db.run(
    'INSERT INTO assets (id, path, mime, metadata) VALUES (?, ?, ?, ?)',
    id,
    req.file.path,
    req.file.mimetype,
    metadata
  );
  res.json({ id, path: req.file.path, mime: req.file.mimetype });
});

router.delete('/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM assets WHERE id = ?', req.params.id);
  res.json({ ok: true });
});

export default router;
