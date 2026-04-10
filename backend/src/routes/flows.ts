import { Router } from 'express';
import { getDb } from '../lib/db';
import type { Flow } from '../../../shared/src/index';
import { createUUID, nowISO } from '../../../shared/src/index';

const router = Router();

router.get('/', async (_, res) => {
  const db = await getDb();
  const rows = await db.all('SELECT data FROM flows');
  const flows = rows.map((r) => JSON.parse(r.data as string));
  res.json(flows);
});

router.post('/', async (req, res) => {
  const db = await getDb();
  const flow: Flow = { ...req.body, id: createUUID(), createdAt: nowISO(), updatedAt: nowISO() };
  await db.run('INSERT INTO flows (id, data) VALUES (?, ?)', flow.id, JSON.stringify(flow));
  res.json(flow);
});

router.get('/:id', async (req, res) => {
  const db = await getDb();
  const row = await db.get('SELECT data FROM flows WHERE id = ?', req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(JSON.parse(row.data as string));
});

router.put('/:id', async (req, res) => {
  const db = await getDb();
  const flow: Flow = { ...req.body, updatedAt: nowISO() };
  await db.run('UPDATE flows SET data = ? WHERE id = ?', JSON.stringify(flow), req.params.id);
  res.json(flow);
});

router.delete('/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM flows WHERE id = ?', req.params.id);
  res.json({ ok: true });
});

export default router;
