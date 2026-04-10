import { useState } from 'react';
import type { SanitizationResult } from '../lib/types';

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 16,
    borderBottom: '1px solid #27272a',
  },
  title: {
    fontWeight: 700,
    fontSize: 12,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 10,
  },
};

function sanitizeLocally(text: string): SanitizationResult {
  const changes: string[] = [];
  let sanitized = text;

  const nameRx = /\b(Mr|Mrs|Ms|Dr)\.?\s+[A-Z][a-z]+\b/g;
  if (nameRx.test(text)) {
    sanitized = sanitized.replace(nameRx, '[NAME]');
    changes.push('Redacted named salutations');
  }

  const dobRx = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g;
  if (dobRx.test(sanitized)) {
    sanitized = sanitized.replace(dobRx, '[DATE]');
    changes.push('Redacted dates');
  }

  const phoneRx = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  if (phoneRx.test(sanitized)) {
    sanitized = sanitized.replace(phoneRx, '[PHONE]');
    changes.push('Redacted phone numbers');
  }

  return {
    original: text,
    sanitized,
    audit: [{ pass: 'regex', changes }],
    changed: sanitized !== text,
  };
}

export function SanitizationPreview() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SanitizationResult | null>(null);

  const handlePreview = () => {
    setResult(sanitizeLocally(text));
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Sanitization Preview</div>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text to preview PHI removal..."
        style={{ marginBottom: 8 }}
      />
      <button
        onClick={handlePreview}
        style={{
          width: '100%',
          padding: '6px 0',
          background: '#27272a',
          color: '#d4d4d8',
          border: '1px solid #3f3f46',
          borderRadius: 6,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        Preview sanitization
      </button>
      {result && (
        <div style={{ fontSize: 12 }}>
          {result.changed ? (
            <>
              <div style={{ color: '#22c55e', marginBottom: 4 }}>
                ✅ {result.audit[0].changes.length} change(s) applied
              </div>
              <div
                style={{
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: 6,
                  padding: 8,
                  color: '#a1a1aa',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                {result.sanitized}
              </div>
            </>
          ) : (
            <div style={{ color: '#52525b' }}>No PHI detected.</div>
          )}
        </div>
      )}
    </div>
  );
}
