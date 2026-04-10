import { useFlowStore } from '../stores/useFlowStore';
import type { Flow } from '../lib/types';
import { createUUID, nowISO } from '../lib/types';

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 240,
    minWidth: 240,
    background: '#18181b',
    borderRight: '1px solid #27272a',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 0',
  },
  header: {
    padding: '0 16px 12px',
    fontWeight: 700,
    fontSize: 13,
    color: '#a1a1aa',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  item: {
    padding: '8px 16px',
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    transition: 'all 0.15s',
    fontSize: 13,
  },
  addBtn: {
    margin: '12px 16px 0',
    padding: '6px 12px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export function FlowList() {
  const { flows, currentFlow, setCurrentFlow, loadFlows } = useFlowStore();

  const handleNew = async () => {
    const flow: Flow = {
      id: createUUID(),
      name: 'New Flow',
      steps: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flow),
    });
    await loadFlows();
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>Flows</div>
      {flows.map((flow) => (
        <div
          key={flow.id}
          style={{
            ...styles.item,
            background: currentFlow?.id === flow.id ? '#27272a' : 'transparent',
            borderLeftColor: currentFlow?.id === flow.id ? '#6366f1' : 'transparent',
            color: currentFlow?.id === flow.id ? '#fafafa' : '#a1a1aa',
          }}
          onClick={() => setCurrentFlow(flow)}
        >
          {flow.name}
        </div>
      ))}
      <button style={styles.addBtn} onClick={handleNew}>
        + New Flow
      </button>
    </div>
  );
}
