import type { Step } from '../lib/types';
import { useFlowStore } from '../stores/useFlowStore';

export function InputPayloadEditor({ step }: { step: Step }) {
  const { currentFlow, saveFlow } = useFlowStore();

  if (step.config.kind !== 'input') return null;
  const manualText = step.config.payload.manualText ?? '';

  const handleChange = (value: string) => {
    if (!currentFlow) return;
    const updated = {
      ...currentFlow,
      steps: currentFlow.steps.map((s) =>
        s.id === step.id && s.config.kind === 'input'
          ? {
              ...s,
              config: {
                ...s.config,
                payload: { ...s.config.payload, manualText: value },
              },
            }
          : s
      ),
    };
    saveFlow(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ color: '#a1a1aa', fontSize: 12 }}>Input text</label>
      <textarea
        rows={4}
        value={manualText}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Enter patient information..."
      />
    </div>
  );
}
