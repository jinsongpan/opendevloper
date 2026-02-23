export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'thinking' | 'planning' | 'executing' | 'completed' | 'failed';
  plan?: ExecutionPlan;
  currentStep?: number;
  progress?: number;
  thoughtSteps?: ThoughtStep[];
}

export interface ThoughtStep {
  id: string;
  type: 'thought' | 'action' | 'observation';
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
  confirmed?: boolean;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
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

export interface ProgressUpdate {
  stepId: string;
  status: 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
  progress: number;
}

export interface ServerInfo {
  url: string;
  port: number;
}

export type AppView = 'chat' | 'history';

export interface PlanRequest {
  requirements: string;
  settings?: Settings;
  provider?: string;
  isModification?: boolean;
}
