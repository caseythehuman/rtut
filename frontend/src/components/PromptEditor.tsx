import type { Step } from '../lib/types';
import { useFlowStore } from '../stores/useFlowStore';

export function PromptEditor({ step }: { step: Step }) {
  const { currentFlow, saveFlow } = useFlowStore();

  if (step.config.kind !== 'prompt') return null;

  const handleChange = (value: string) => {
    if (!currentFlow) return;
    const updated = {
      ...currentFlow,
      steps: currentFlow.steps.map((s) =>
        s.id === step.id && s.config.kind === 'prompt'
          ? { ...s, config: { ...s.config, template: value } }
          : s
      ),
    };
    saveFlow(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ color: '#a1a1aa', fontSize: 12 }}>
        Prompt template{' '}
        <span style={{ color: '#52525b' }}>(use {'{{input}}'} for previous step output)</span>
      </label>
      <textarea
        rows={6}
        value={step.config.template}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="You are a clinician. Summarize: {{input}}"
        style={{ fontFamily: 'ui-monospace, monospace' }}
      />
      <div style={{ color: '#52525b', fontSize: 11 }}>
        Provider: {step.config.provider?.id ?? 'stub'}
        {step.config.provider?.model ? ` / ${step.config.provider.model}` : ''}
      </div>
    </div>
  );
}
