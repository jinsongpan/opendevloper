export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface PlanStep {
  id: string;
  type: 'CREATE_FILE' | 'EDIT_FILE' | 'DELETE_FILE' | 'RUN_COMMAND' | 'RUN_SERVER' | 'INSTALL_PACKAGE' | 'OPEN_BROWSER';
  description: string;
  target?: string;
  content?: string;
  command?: string;
  url?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

export interface ExecutionPlan {
  id: string;
  steps: PlanStep[];
  estimatedTime?: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
}

export interface LLMConfig {
  provider: 'anthropic' | 'openai' | 'openrouter';
  apiKey: string;
  model: string;
}

export interface Settings {
  anthropic: {
    apiKey: string;
    model: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
  openrouter: {
    apiKey: string;
    model: string;
  };
}

export interface ChatRequest {
  message: string;
  settings: Settings;
  context?: {
    files?: FileNode[];
    history?: Message[];
  };
}

export interface PlanRequest {
  requirements: string;
  settings: Settings;
  context?: {
    files?: FileNode[];
  };
}

export interface ExecuteRequest {
  plan: ExecutionPlan;
  sandboxId: string;
}

export interface ProgressUpdate {
  stepId: string;
  status: 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
  progress: number;
}
