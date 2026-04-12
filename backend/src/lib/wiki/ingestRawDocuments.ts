import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import type { Database } from 'sqlite';
import { createUUID } from '../../../../shared/src/index';
import type { WikiPage } from '../../../../shared/src/index';

const SUPPORTED_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.markdown',
  '.json',
  '.csv',
  '.tsv',
  '.html',
  '.htm',
]);

const MAX_CHUNK_SIZE = 2000;
const RAW_DUMP_DIR = path.resolve(process.cwd(), 'data/raw');

export interface RawIngestStats {
  rawDir: string;
  scanned: number;
  importedFiles: number;
  skippedFiles: number;
  assetsCreated: number;
  pagesCreated: number;
}

export async function ensureRawDumpDir(): Promise<string> {
  await fs.mkdir(RAW_DUMP_DIR, { recursive: true });
  return RAW_DUMP_DIR;
}

export async function ingestRawDocuments(db: Database): Promise<RawIngestStats> {
  const rawDir = await ensureRawDumpDir();
  const files = await walkFiles(rawDir);

  const stats: RawIngestStats = {
    rawDir,
    scanned: 0,
    importedFiles: 0,
    skippedFiles: 0,
    assetsCreated: 0,
    pagesCreated: 0,
  };

  const wikiRows = await db.all('SELECT data FROM wiki_pages');
  const existingPages = wikiRows.map((r) => JSON.parse(r.data as string) as WikiPage);
  const existingPageKey = new Set(
    existingPages.map((p) => `${p.sourceAssetId}::${p.title.toLowerCase()}`)
  );

  for (const filePath of files) {
    stats.scanned += 1;
    const ext = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      stats.skippedFiles += 1;
      continue;
    }

    const sourcePath = path.relative(rawDir, filePath);
    const assetId = await getOrCreateAsset(db, filePath, sourcePath, ext, stats);
    const text = await readRawTextFile(filePath, ext);
    if (!text.trim()) {
      stats.skippedFiles += 1;
      continue;
    }

    const chunks = chunkText(text, MAX_CHUNK_SIZE);
    const baseTitle = path.basename(sourcePath);

    let createdForFile = 0;
    for (let idx = 0; idx < chunks.length; idx += 1) {
      const title = chunks.length > 1 ? `${baseTitle} (chunk ${idx + 1}/${chunks.length})` : baseTitle;
      const dedupeKey = `${assetId}::${title.toLowerCase()}`;
      if (existingPageKey.has(dedupeKey)) {
        continue;
      }

      const pageId = createHash('sha1').update(`${assetId}:${idx}:${title}`).digest('hex');
      const page: WikiPage = {
        id: pageId,
        title,
        content: chunks[idx],
        sourceAssetId: assetId,
      };

      await db.run(
        'INSERT OR REPLACE INTO wiki_pages (id, data) VALUES (?, ?)',
        page.id,
        JSON.stringify(page)
      );
      existingPageKey.add(dedupeKey);
      stats.pagesCreated += 1;
      createdForFile += 1;
    }

    if (createdForFile > 0) {
      stats.importedFiles += 1;
    } else {
      stats.skippedFiles += 1;
    }
  }

  return stats;
}

async function getOrCreateAsset(
  db: Database,
  absolutePath: string,
  sourcePath: string,
  ext: string,
  stats: RawIngestStats
): Promise<string> {
  const existing = await db.get('SELECT id FROM assets WHERE path = ?', absolutePath);
  if (existing?.id) {
    return String(existing.id);
  }

  const id = createUUID();
  const metadata = {
    originalName: path.basename(sourcePath),
    source: 'raw-dump',
    sourcePath,
    ingestedAt: new Date().toISOString(),
  };

  await db.run(
    'INSERT INTO assets (id, path, mime, metadata) VALUES (?, ?, ?, ?)',
    id,
    absolutePath,
    inferMime(ext),
    JSON.stringify(metadata)
  );
  stats.assetsCreated += 1;
  return id;
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(full);
      }
      return [full];
    })
  );
  return nested.flat();
}

async function readRawTextFile(filePath: string, ext: string): Promise<string> {
  const raw = await fs.readFile(filePath, 'utf8');
  if (ext === '.json') {
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return raw;
    }
  }
  return raw;
}

function chunkText(content: string, maxSize: number): string[] {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  if (normalized.length <= maxSize) {
    return [normalized];
  }

  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < normalized.length) {
    let next = cursor + maxSize;
    if (next < normalized.length) {
      const newlineBreak = normalized.lastIndexOf('\n', next);
      if (newlineBreak > cursor + Math.floor(maxSize * 0.6)) {
        next = newlineBreak;
      }
    }
    chunks.push(normalized.slice(cursor, next).trim());
    cursor = next;
  }
  return chunks.filter(Boolean);
}

function inferMime(ext: string): string {
  switch (ext) {
    case '.md':
    case '.markdown':
      return 'text/markdown';
    case '.json':
      return 'application/json';
    case '.csv':
      return 'text/csv';
    case '.tsv':
      return 'text/tab-separated-values';
    case '.html':
    case '.htm':
      return 'text/html';
    case '.txt':
    default:
      return 'text/plain';
  }
}
