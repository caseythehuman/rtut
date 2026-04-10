import { useState } from 'react';
import type { Step } from '../lib/types';
import { useFlowStore } from '../stores/useFlowStore';
import { BranchSelector } from './BranchSelector';
import { PromptEditor } from './PromptEditor';
import { InputPayloadEditor } from './InputPayloadEditor';
import { OutputViewer } from './OutputViewer';

const TYPE_COLORS: Record<string, string> = {
  input: '#22c55e',
  prompt: '#6366f1',
  branch: '#f59e0b',
  output: '#3b82f6',
  conversion: '#ec4899',
  'wiki-retrieval': '#14b8a6',
};

export function StepCard({ step }: { step: Step }) {
  const [collapsed, setCollapsed] = useState(step.collapsed);
  const { currentFlow, saveFlow } = useFlowStore();

  const handleDelete = () => {
    if (!currentFlow) return;
    const updated = {
      ...currentFlow,
      steps: currentFlow.steps.filter((s) => s.id !== step.id),
    };
    saveFlow(updated);
  };

  const color = TYPE_COLORS[step.type] ?? '#71717a';

  return (
    <div
      style={{
        background: '#18181b',
        border: `1px solid #27272a`,
        borderRadius: 8,
        overflow: 'hidden',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 14px',
          gap: 8,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span style={{ color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
          {step.type}
        </span>
        <span style={{ flex: 1, fontWeight: 600 }}>{step.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#52525b',
            fontSize: 16,
            padding: '0 4px',
            lineHeight: 1,
          }}
          title="Delete step"
        >
          ×
        </button>
        <span style={{ color: '#52525b', fontSize: 12 }}>{collapsed ? '▶' : '▼'}</span>
      </div>

      {!collapsed && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {step.config.kind === 'input' && <InputPayloadEditor step={step} />}
          {step.config.kind === 'prompt' && <PromptEditor step={step} />}
          {step.config.kind === 'branch' && <BranchSelector step={step} />}
          {step.config.kind === 'output' && <OutputViewer step={step} />}
          {step.config.kind === 'conversion' && (
            <div style={{ color: '#a1a1aa', fontSize: 12 }}>
              Target MIME: {step.config.targetMime}
            </div>
          )}
          {step.config.kind === 'wiki-retrieval' && (
            <div style={{ color: '#a1a1aa', fontSize: 12 }}>
              Query: {step.config.queryTemplate}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
