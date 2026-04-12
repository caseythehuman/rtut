import type {
  Flow,
  ExecutionRun,
  ExecutionNodeResult,
  WikiPage,
} from '../../../../shared/src/index';

interface ExecuteOptions {
  wikiPages?: WikiPage[];
}

export async function executeFlow(
  flow: Flow,
  branchChoices: Record<string, string>,
  options: ExecuteOptions = {}
): Promise<ExecutionRun> {
  const wikiPages = options.wikiPages ?? [];
  const run: ExecutionRun = {
    id: crypto.randomUUID(),
    flowId: flow.id,
    startedAt: new Date().toISOString(),
    branchChoices,
    results: [],
  };

  let inputText = '';
  let lastOutput = '';
  let wikiContext = '';

  let i = 0;
  while (i < flow.steps.length) {
    const step = flow.steps[i];
    const t0 = Date.now();
    const result: ExecutionNodeResult = {
      stepId: step.id,
      input: { items: [] },
      durationMs: 0,
    };

    if (step.type === 'input' && step.config.kind === 'input') {
      inputText = step.config.payload.manualText ?? '';
      result.input = step.config.payload;
    } else if (step.type === 'wiki-retrieval' && step.config.kind === 'wiki-retrieval') {
      const rawQuery = renderTemplate(step.config.queryTemplate, inputText, lastOutput, wikiContext);
      const query = rawQuery.trim() || inputText;
      const matches = findRelevantPages(query, wikiPages, 3);
      wikiContext = matches
        .map((page) => `Title: ${page.title}\n${page.content.slice(0, 1000)}`)
        .join('\n\n');

      result.output = {
        content: `📚 Retrieved ${matches.length} wiki page(s) for query: ${query || '(empty query)'}`,
        trace: { query, pageIds: matches.map((m) => m.id), titles: matches.map((m) => m.title) },
      };
      lastOutput = result.output.content as string;
    } else if (step.type === 'prompt' && step.config.kind === 'prompt') {
      const promptText = buildPrompt(step.config.template, inputText, wikiContext, lastOutput);
      result.output = {
        content: `✅ Executed prompt: ${step.name}\n\n${promptText}`,
        trace: {
          usedWikiContext: Boolean(wikiContext),
          wikiChars: wikiContext.length,
        },
      };
      lastOutput = result.output.content as string;
    } else if (step.type === 'output') {
      const prev = run.results[run.results.length - 1];
      result.output = prev?.output ?? { content: '' };
      lastOutput = String(result.output.content ?? '');
    }

    result.durationMs = Date.now() - t0;
    run.results.push(result);
    i++;
  }

  run.finishedAt = new Date().toISOString();
  return run;
}

function buildPrompt(template: string, input: string, wiki: string, output: string): string {
  const rendered = renderTemplate(template, input, output, wiki);
  if (!wiki) {
    return rendered;
  }

  if (template.includes('{{wiki}}')) {
    return rendered;
  }

  return `${rendered}\n\nContext from wiki:\n${wiki}`;
}

function renderTemplate(
  template: string,
  input: string,
  output: string,
  wiki: string
): string {
  return template
    .replaceAll('{{input}}', input)
    .replaceAll('{{output}}', output)
    .replaceAll('{{wiki}}', wiki);
}

function findRelevantPages(query: string, pages: WikiPage[], limit: number): WikiPage[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) {
    return pages.slice(0, limit);
  }

  const terms = normalized.split(/\s+/).filter((term) => term.length > 1);
  const scored = pages
    .map((page) => {
      const haystack = `${page.title}\n${page.content}`.toLowerCase();
      const score = terms.reduce((acc, term) => (haystack.includes(term) ? acc + 1 : acc), 0);
      return { page, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.page);

  if (scored.length > 0) {
    return scored;
  }

  return pages.slice(0, limit);
}
