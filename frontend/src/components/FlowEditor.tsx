import { useFlowStore } from '../stores/useFlowStore';
import { StepCard } from './StepCard';
import { AddStepButton } from './AddStepButton';
import { RunControls } from './RunControls';
import { SanitizationPreview } from './SanitizationPreview';
import { WikiBrowser } from './WikiBrowser';

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    gap: 0,
    overflow: 'hidden',
    height: '100vh',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    color: '#fafafa',
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#52525b',
    fontSize: 16,
  },
  sidebar: {
    width: 300,
    minWidth: 300,
    background: '#18181b',
    borderLeft: '1px solid #27272a',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    overflow: 'auto',
  },
};

export function FlowEditor() {
  const { currentFlow } = useFlowStore();

  if (!currentFlow) {
    return <div style={styles.empty}>Select a flow to get started</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.title}>{currentFlow.name}</div>
        {currentFlow.steps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
        <AddStepButton />
      </div>
      <div style={styles.sidebar}>
        <RunControls />
        <SanitizationPreview />
        <WikiBrowser />
      </div>
    </div>
  );
}
