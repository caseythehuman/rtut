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

  const handleSearch = async () => {
    const res = await fetch(`/api/wiki/search?q=${encodeURIComponent(query)}`);
    const data: WikiPage[] = await res.json();
    setPages(data);
    setSearched(true);
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
