export type UUID = string;

export interface Flow {
  id: UUID;
  name: string;
  description?: string;
  steps: Step[];
  createdAt: string;
  updatedAt: string;
}

export type StepType = 'input' | 'prompt' | 'branch' | 'output' | 'conversion' | 'wiki-retrieval';

export interface Step {
  id: UUID;
  type: StepType;
  name: string;
  collapsed: boolean;
  config: StepConfig;
}

export type StepConfig =
  | { kind: 'input'; payload: InputPayload }
  | { kind: 'prompt'; template: string; provider?: ProviderConfig }
  | { kind: 'branch'; options: BranchOption[] }
  | { kind: 'output'; format: 'text' | 'markdown' }
  | { kind: 'conversion'; targetMime: string }
  | { kind: 'wiki-retrieval'; queryTemplate: string };

export interface BranchOption {
  id: UUID;
  label: string;
  nextStepId?: UUID;
}

export type ContentKind = 'text' | 'rich-text' | 'image' | 'pdf' | 'audio' | 'url';

export interface ContentItem {
  kind: ContentKind;
  value: string;
  mimeType?: string;
  filename?: string;
}

export interface InputPayload {
  items: ContentItem[];
  manualText?: string;
}

export interface OutputPayload {
  content: string | ContentItem[];
  trace?: unknown;
}

export interface ExecutionRun {
  id: UUID;
  flowId: UUID;
  startedAt: string;
  finishedAt?: string;
  branchChoices: Record<string, string>;
  results: ExecutionNodeResult[];
}

export interface ExecutionNodeResult {
  stepId: UUID;
  input: InputPayload;
  output?: OutputPayload;
  sanitization?: SanitizationResult;
  providerUsed?: string;
  durationMs: number;
}

export interface SanitizationConfig {
  enabled: boolean;
  passes: ('regex' | 'structured' | 'llm')[];
  policy: 'strip-phi' | 'redact-identifiers' | 'keep-clinical-only';
}

export interface SanitizationResult {
  original: string;
  sanitized: string;
  audit: { pass: string; changes: string[] }[];
  changed: boolean;
}

export interface WikiPage {
  id: UUID;
  title: string;
  content: string;
  sourceAssetId: UUID;
}

export interface ProviderConfig {
  id: 'local-ollama' | 'stub';
  model?: string;
}

export const createUUID = (): UUID => crypto.randomUUID();
export const nowISO = (): string => new Date().toISOString();
