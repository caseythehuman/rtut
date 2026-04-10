import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import type { Flow } from '../../../shared/src/index';
import { createUUID, nowISO } from '../../../shared/src/index';

let _db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (_db) return _db;
  const dbPath = path.resolve(process.cwd(), 'data/db.sqlite');
  _db = await open({ filename: dbPath, driver: sqlite3.Database });
  await _db.exec(`
    CREATE TABLE IF NOT EXISTS flows (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY, path TEXT, mime TEXT, metadata TEXT);
    CREATE TABLE IF NOT EXISTS wiki_pages (id TEXT PRIMARY KEY, data TEXT);
    CREATE TABLE IF NOT EXISTS execution_runs (id TEXT PRIMARY KEY, data TEXT);
  `);
  await seedFlows(_db);
  return _db;
}

async function seedFlows(db: Database): Promise<void> {
  const existing = await db.get('SELECT id FROM flows LIMIT 1');
  if (existing) return;

  const pmhnpIntake: Flow = {
    id: createUUID(),
    name: 'PMHNP Intake',
    description: 'Initial psychiatric evaluation workflow',
    steps: [
      {
        id: createUUID(),
        type: 'input',
        name: 'Collect Patient Info',
        collapsed: false,
        config: {
          kind: 'input',
          payload: { items: [], manualText: 'Chief complaint, HPI, PMH, medications, allergies...' },
        },
      },
      {
        id: createUUID(),
        type: 'prompt',
        name: 'Generate Intake Note',
        collapsed: false,
        config: {
          kind: 'prompt',
          template:
            'You are a PMHNP writing a psychiatric intake note. Summarize the following information in SOAP format:\n\n{{input}}',
          provider: { id: 'stub' },
        },
      },
      {
        id: createUUID(),
        type: 'branch',
        name: 'Disposition',
        collapsed: false,
        config: {
          kind: 'branch',
          options: [
            { id: createUUID(), label: 'Outpatient follow-up' },
            { id: createUUID(), label: 'Higher level of care referral' },
            { id: createUUID(), label: 'Crisis intervention' },
          ],
        },
      },
      {
        id: createUUID(),
        type: 'output',
        name: 'Finalize Note',
        collapsed: false,
        config: { kind: 'output', format: 'markdown' },
      },
    ],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  const pmhnpFollowUp: Flow = {
    id: createUUID(),
    name: 'PMHNP Follow-up',
    description: 'Follow-up psychiatric visit workflow',
    steps: [
      {
        id: createUUID(),
        type: 'input',
        name: 'Interval History',
        collapsed: false,
        config: {
          kind: 'input',
          payload: {
            items: [],
            manualText: 'Medication response, side effects, mood/sleep/appetite, stressors...',
          },
        },
      },
      {
        id: createUUID(),
        type: 'prompt',
        name: 'Generate Follow-up Note',
        collapsed: false,
        config: {
          kind: 'prompt',
          template:
            'You are a PMHNP writing a psychiatric follow-up note. Based on the interval history below, generate a concise SOAP note:\n\n{{input}}',
          provider: { id: 'stub' },
        },
      },
      {
        id: createUUID(),
        type: 'branch',
        name: 'Medication Adjustment',
        collapsed: false,
        config: {
          kind: 'branch',
          options: [
            { id: createUUID(), label: 'Continue current regimen' },
            { id: createUUID(), label: 'Titrate dose' },
            { id: createUUID(), label: 'Switch medication' },
            { id: createUUID(), label: 'Add adjunct' },
          ],
        },
      },
      {
        id: createUUID(),
        type: 'output',
        name: 'Finalize Note',
        collapsed: false,
        config: { kind: 'output', format: 'markdown' },
      },
    ],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  for (const flow of [pmhnpIntake, pmhnpFollowUp]) {
    await db.run('INSERT INTO flows (id, data) VALUES (?, ?)', flow.id, JSON.stringify(flow));
  }
}
