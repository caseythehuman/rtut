import { useState } from 'react';
import { useFlowStore } from '../stores/useFlowStore';
import type { ExecutionRun } from '../lib/types';

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
  runBtn: {
    width: '100%',
    padding: '8px 0',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 10,
  },
  result: {
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: 6,
    padding: 10,
    fontSize: 12,
    color: '#a1a1aa',
    maxHeight: 200,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    fontFamily: 'ui-monospace, monospace',
  },
};

export function RunControls() {
  const { currentFlow } = useFlowStore();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionRun | null>(null);

  const handleRun = async () => {
    if (!currentFlow) return;
    setRunning(true);
    try {
      const res = await fetch(`/api/execution/run/${currentFlow.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchChoices: {} }),
      });
      const run: ExecutionRun = await res.json();
      setResult(run);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Run Flow</div>
      <button style={styles.runBtn} onClick={handleRun} disabled={running || !currentFlow}>
        {running ? '⏳ Running...' : '▶ Run'}
      </button>
      {result && (
        <div>
          <div style={{ color: '#22c55e', fontSize: 11, marginBottom: 6 }}>
            ✅ Completed in{' '}
            {result.results.reduce((a, r) => a + r.durationMs, 0)}ms
          </div>
          <div style={styles.result}>
            {result.results.map((r) => r.output?.content).filter(Boolean).join('\n\n') ||
              'No output produced.'}
          </div>
        </div>
      )}
    </div>
  );
}
