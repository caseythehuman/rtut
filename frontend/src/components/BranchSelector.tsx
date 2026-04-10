import { useState } from 'react';
import type { Step, BranchOption } from '../lib/types';
import { createUUID } from '../lib/types';
import { useFlowStore } from '../stores/useFlowStore';

export function BranchSelector({ step }: { step: Step }) {
  const { currentFlow, saveFlow } = useFlowStore();
  const [selected, setSelected] = useState<string | null>(null);

  if (step.config.kind !== 'branch') return null;
  const options: BranchOption[] = step.config.options;

  const handleAddOption = () => {
    if (!currentFlow) return;
    const newOption: BranchOption = { id: createUUID(), label: 'New option' };
    const updated = {
      ...currentFlow,
      steps: currentFlow.steps.map((s) =>
        s.id === step.id && s.config.kind === 'branch'
          ? { ...s, config: { ...s.config, options: [...(s.config as typeof step.config).options, newOption] } }
          : s
      ),
    };
    saveFlow(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 4 }}>Select branch:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: `1px solid ${selected === opt.id ? '#f59e0b' : '#3f3f46'}`,
              background: selected === opt.id ? '#451a03' : '#27272a',
              color: selected === opt.id ? '#fbbf24' : '#d4d4d8',
              fontWeight: 600,
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button
        onClick={handleAddOption}
        style={{
          alignSelf: 'flex-start',
          padding: '4px 10px',
          background: 'none',
          border: '1px dashed #3f3f46',
          borderRadius: 6,
          color: '#71717a',
          fontSize: 12,
        }}
      >
        + Add option
      </button>
    </div>
  );
}
