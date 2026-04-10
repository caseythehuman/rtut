import type { Flow, ExecutionRun, ExecutionNodeResult } from '../../../../shared/src/index';

export async function executeFlow(
  flow: Flow,
  branchChoices: Record<string, string>
): Promise<ExecutionRun> {
  const run: ExecutionRun = {
    id: crypto.randomUUID(),
    flowId: flow.id,
    startedAt: new Date().toISOString(),
    branchChoices,
    results: [],
  };

  let i = 0;
  while (i < flow.steps.length) {
    const step = flow.steps[i];
    const t0 = Date.now();
    const result: ExecutionNodeResult = {
      stepId: step.id,
      input: { items: [] },
      durationMs: 0,
    };

    if (step.type === 'prompt') {
      result.output = { content: `✅ Executed prompt: ${step.name}` };
    } else if (step.type === 'output') {
      const prev = run.results[run.results.length - 1];
      result.output = prev?.output ?? { content: '' };
    }

    result.durationMs = Date.now() - t0;
    run.results.push(result);
    i++;
  }

  run.finishedAt = new Date().toISOString();
  return run;
}
