import { create } from 'zustand';
import type { Flow } from '../lib/types';

interface State {
  flows: Flow[];
  currentFlow: Flow | null;
  loadFlows: () => Promise<void>;
  setCurrentFlow: (flow: Flow) => void;
  saveFlow: (flow: Flow) => Promise<void>;
}

export const useFlowStore = create<State>((set) => ({
  flows: [],
  currentFlow: null,
  loadFlows: async () => {
    const res = await fetch('/api/flows');
    const flows: Flow[] = await res.json();
    set({ flows });
    if (flows.length) set({ currentFlow: flows[0] });
  },
  setCurrentFlow: (flow) => set({ currentFlow: flow }),
  saveFlow: async (flow) => {
    await fetch(`/api/flows/${flow.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flow),
    });
    set((s) => ({
      flows: s.flows.map((f) => (f.id === flow.id ? flow : f)),
      currentFlow: s.currentFlow?.id === flow.id ? flow : s.currentFlow,
    }));
  },
}));
