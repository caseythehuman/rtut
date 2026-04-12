import { Router } from 'express';
import { getDb } from '../lib/db';
import { executeFlow } from '../lib/engine/executionEngine';
import type { Flow, WikiPage } from '../../../shared/src/index';

const router = Router();

router.post('/run/:flowId', async (req, res) => {
  const db = await getDb();
  const row = await db.get('SELECT data FROM flows WHERE id = ?', req.params.flowId);
  if (!row) return res.status(404).json({ error: 'flow not found' });

  const flow: Flow = JSON.parse(row.data as string);
  const branchChoices: Record<string, string> = req.body.branchChoices ?? {};
  const wikiRows = await db.all('SELECT data FROM wiki_pages');
  const wikiPages = wikiRows.map((r) => JSON.parse(r.data as string) as WikiPage);

  const run = await executeFlow(flow, branchChoices, { wikiPages });
  await db.run(
    'INSERT INTO execution_runs (id, data) VALUES (?, ?)',
    run.id,
    JSON.stringify(run)
  );
  res.json(run);
});

router.get('/runs/:flowId', async (req, res) => {
  const db = await getDb();
  const rows = await db.all('SELECT data FROM execution_runs');
  const runs = rows
    .map((r) => JSON.parse(r.data as string))
    .filter((r) => r.flowId === req.params.flowId);
  res.json(runs);
});

export default router;
