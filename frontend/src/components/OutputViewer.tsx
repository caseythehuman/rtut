import type { Step } from '../lib/types';

export function OutputViewer({ step }: { step: Step }) {
  if (step.config.kind !== 'output') return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ color: '#a1a1aa', fontSize: 12 }}>
        Output format:{' '}
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>{step.config.format}</span>
      </div>
      <div
        style={{
          background: '#09090b',
          border: '1px solid #27272a',
          borderRadius: 6,
          padding: '10px 12px',
          color: '#52525b',
          fontSize: 12,
          minHeight: 60,
          fontStyle: 'italic',
        }}
      >
        Output will appear here after running the flow.
      </div>
    </div>
  );
}
