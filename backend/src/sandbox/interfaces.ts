import type { FileNode } from '../types';

export interface ServerInfo {
  sandboxId: string;
  port: number;
  url: string;
  pid: number;
  startTime: number;
}

export interface ExecResult {
  output: string;
  exitCode: number;
}

export interface ServerResult {
  output: string;
  url: string;
  port: number;
  pid: number;
  exitCode: number;
}

export type StreamCallback = (data: string, isError?: boolean) => void;

export interface ISandboxService {
  createSandbox(): Promise<string>;
  destroySandbox(sandboxId: string): Promise<void>;

  createFile(sandboxId: string, path: string, content: string): Promise<void>;
  readFile(sandboxId: string, path: string): Promise<string>;
  listFiles(sandboxId: string, dir?: string): Promise<FileNode[]>;
  deleteFile(sandboxId: string, path: string): Promise<void>;

  execCommand(sandboxId: string, command: string, onStream?: StreamCallback): Promise<ExecResult>;
  runApplication(sandboxId: string, command: string): Promise<ExecResult>;
  installDependencies(sandboxId: string): Promise<ExecResult>;
  runServer(sandboxId: string, command: string, port?: string, onStream?: StreamCallback): Promise<ServerResult>;
  runStaticServer(sandboxId: string, port?: string): Promise<{ url: string; port: number; pid: number }>;

  getServers(sandboxId: string): ServerInfo[];
  healthCheck(): Promise<boolean>;
}

export interface RemoteConfig {
  host: string;
  port: number;
  timeout: number;
  retries: number;
}
