import { useEffect } from 'react';
import { FlowEditor } from './components/FlowEditor';
import { FlowList } from './components/FlowList';
import { useFlowStore } from './stores/useFlowStore';

export default function App() {
  const { loadFlows } = useFlowStore();

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <FlowList />
      <FlowEditor />
    </div>
  );
}
