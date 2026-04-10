import { Router } from 'express';
import { getDb } from '../lib/db';
import { createUUID } from '../../../shared/src/index';
import type { WikiPage } from '../../../shared/src/index';

const router = Router();

router.get('/', async (_, res) => {
  const db = await getDb();
  const rows = await db.all('SELECT data FROM wiki_pages');
  res.json(rows.map((r) => JSON.parse(r.data as string)));
});

router.get('/search', async (req, res) => {
  const db = await getDb();
  const q = String(req.query.q ?? '').toLowerCase();
  const rows = await db.all('SELECT data FROM wiki_pages');
  const pages = rows
    .map((r) => JSON.parse(r.data as string) as WikiPage)
    .filter(
      (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    );
  res.json(pages);
});

router.get('/:id', async (req, res) => {
  const db = await getDb();
  const row = await db.get('SELECT data FROM wiki_pages WHERE id = ?', req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(JSON.parse(row.data as string));
});

router.post('/', async (req, res) => {
  const db = await getDb();
  const page: WikiPage = { ...req.body, id: createUUID() };
  await db.run('INSERT INTO wiki_pages (id, data) VALUES (?, ?)', page.id, JSON.stringify(page));
  res.json(page);
});

export default router;
