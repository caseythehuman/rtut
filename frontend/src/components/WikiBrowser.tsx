import { useState } from 'react';
import type { WikiPage } from '../lib/types';

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontWeight: 700,
    fontSize: 12,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 10,
  },
  page: {
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    fontSize: 12,
    color: '#d4d4d8',
  },
};

export function WikiBrowser() {
  const [query, setQuery] = useState('');
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [searched, setSearched] = useState(false);
  const [rawDir, setRawDir] = useState('');
  const [ingestMessage, setIngestMessage] = useState('');
  const [ingesting, setIngesting] = useState(false);

  const handleSearch = async () => {
    const res = await fetch(`/api/wiki/search?q=${encodeURIComponent(query)}`);
    const data: WikiPage[] = await res.json();
    setPages(data);
    setSearched(true);
  };

  const handleLoadRawDir = async () => {
    const res = await fetch('/api/wiki/raw-dir');
    const data: { rawDir: string } = await res.json();
    setRawDir(data.rawDir);
  };

  const handleIngestRaw = async () => {
    setIngesting(true);
    try {
      const res = await fetch('/api/wiki/ingest-raw', { method: 'POST' });
      const data: {
        importedFiles: number;
        pagesCreated: number;
        skippedFiles: number;
      } = await res.json();
      setIngestMessage(
        `Imported ${data.importedFiles} file(s), created ${data.pagesCreated} page(s), skipped ${data.skippedFiles}.`
      );
      await handleSearch();
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Wiki Browser</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search clinical wiki..."
          style={{ flex: 1 }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '6px 12px',
            background: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: 6,
            color: '#d4d4d8',
            whiteSpace: 'nowrap',
          }}
        >
          Search
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <button
          onClick={handleLoadRawDir}
          style={{
            padding: '6px 12px',
            background: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: 6,
            color: '#d4d4d8',
            whiteSpace: 'nowrap',
          }}
        >
          Show Raw Folder
        </button>
        <button
          onClick={handleIngestRaw}
          disabled={ingesting}
          style={{
            padding: '6px 12px',
            background: '#0f766e',
            border: '1px solid #0f766e',
            borderRadius: 6,
            color: '#ecfeff',
            whiteSpace: 'nowrap',
          }}
        >
          {ingesting ? 'Ingesting...' : 'Ingest Raw'}
        </button>
      </div>
      {rawDir && <div style={{ color: '#71717a', fontSize: 11, marginTop: 6 }}>Raw folder: {rawDir}</div>}
      {ingestMessage && <div style={{ color: '#22c55e', fontSize: 11, marginTop: 6 }}>{ingestMessage}</div>}
      {searched && pages.length === 0 && (
        <div style={{ color: '#52525b', fontSize: 12, marginTop: 8 }}>No pages found.</div>
      )}
      {pages.map((p) => (
        <div key={p.id} style={styles.page}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: '#6366f1' }}>{p.title}</div>
          <div style={{ color: '#a1a1aa' }}>{p.content.slice(0, 200)}...</div>
        </div>
      ))}
    </div>
  );
}
