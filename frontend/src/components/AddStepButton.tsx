import { useFlowStore } from '../stores/useFlowStore';
import { createUUID } from '../lib/types';
import type { Step, StepType } from '../lib/types';

const STEP_TYPES: { type: StepType; label: string; color: string }[] = [
  { type: 'input', label: 'Input', color: '#22c55e' },
  { type: 'prompt', label: 'Prompt', color: '#6366f1' },
  { type: 'branch', label: 'Branch', color: '#f59e0b' },
  { type: 'output', label: 'Output', color: '#3b82f6' },
  { type: 'conversion', label: 'Conversion', color: '#ec4899' },
  { type: 'wiki-retrieval', label: 'Wiki Retrieval', color: '#14b8a6' },
];

function makeStep(type: StepType): Step {
  const id = createUUID();
  const base = { id, type, name: `New ${type} step`, collapsed: false };
  switch (type) {
    case 'input':
      return { ...base, config: { kind: 'input', payload: { items: [] } } };
    case 'prompt':
      return { ...base, config: { kind: 'prompt', template: '', provider: { id: 'stub' } } };
    case 'branch':
      return {
        ...base,
        config: {
          kind: 'branch',
          options: [
            { id: createUUID(), label: 'Option A' },
            { id: createUUID(), label: 'Option B' },
          ],
        },
      };
    case 'output':
      return { ...base, config: { kind: 'output', format: 'markdown' } };
    case 'conversion':
      return { ...base, config: { kind: 'conversion', targetMime: 'text/plain' } };
    case 'wiki-retrieval':
      return { ...base, config: { kind: 'wiki-retrieval', queryTemplate: '' } };
  }
}

export function AddStepButton() {
  const { currentFlow, saveFlow } = useFlowStore();

  const handleAdd = (type: StepType) => {
    if (!currentFlow) return;
    const step = makeStep(type);
    saveFlow({ ...currentFlow, steps: [...currentFlow.steps, step] });
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
      {STEP_TYPES.map(({ type, label, color }) => (
        <button
          key={type}
          onClick={() => handleAdd(type)}
          style={{
            padding: '5px 12px',
            background: 'none',
            border: `1px solid ${color}`,
            borderRadius: 6,
            color,
            fontSize: 12,
            fontWeight: 600,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = color + '22';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'none';
          }}
        >
          + {label}
        </button>
      ))}
    </div>
  );
}
