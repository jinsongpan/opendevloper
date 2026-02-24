import { ISandboxService, ExecResult, ServerResult, ServerInfo, StreamCallback, RemoteConfig } from '../interfaces';
import { FileNode } from '../../types';

export class RemoteSandboxClient implements ISandboxService {
  private config: RemoteConfig;
  private address: string;

  constructor(config: RemoteConfig) {
    this.config = config;
    this.address = `${config.host}:${config.port}`;
    console.log(`[RemoteSandbox] Initialized with address: ${this.address}`);
  }

  private async call<T>(method: string, request: Record<string, any>): Promise<T> {
    const url = `http://${this.address}${method}`;
    
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal: controller.signal,
        });
        
        clearTimeout(timeout);
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Remote sandbox error: ${response.status} - ${error}`);
        }
        
        const result = await response.json() as T;
        return result;
      } catch (error: any) {
        console.error(`[RemoteSandbox] Attempt ${attempt} failed:`, error.message);
        if (attempt === this.config.retries) {
          throw new Error(`Remote sandbox unavailable after ${attempt} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw new Error('Remote sandbox call failed');
  }

  async createSandbox(): Promise<string> {
    const response = await this.call<{ sandbox_id: string }>('/sandbox/create', {});
    return response.sandbox_id;
  }

  async destroySandbox(sandboxId: string): Promise<void> {
    await this.call('/sandbox/destroy', { sandbox_id: sandboxId });
  }

  async createFile(sandboxId: string, path: string, content: string): Promise<void> {
    await this.call('/sandbox/file/create', { sandbox_id: sandboxId, path, content });
  }

  async readFile(sandboxId: string, path: string): Promise<string> {
    const response = await this.call<{ content: string }>('/sandbox/file/read', { sandbox_id: sandboxId, path });
    return response.content;
  }

  async listFiles(sandboxId: string, dir: string = ''): Promise<FileNode[]> {
    const response = await this.call<{ files: FileNode[] }>('/sandbox/files', { sandbox_id: sandboxId, dir });
    return response.files;
  }

  async deleteFile(sandboxId: string, path: string): Promise<void> {
    await this.call('/sandbox/file/delete', { sandbox_id: sandboxId, path });
  }

  async execCommand(sandboxId: string, command: string, onStream?: StreamCallback): Promise<ExecResult> {
    const response = await this.call<ExecResult>('/sandbox/exec', { sandbox_id: sandboxId, command });
    return response;
  }

  async runApplication(sandboxId: string, command: string): Promise<ExecResult> {
    return this.execCommand(sandboxId, command);
  }

  async installDependencies(sandboxId: string): Promise<ExecResult> {
    const response = await this.call<ExecResult>('/sandbox/install', { sandbox_id: sandboxId });
    return response;
  }

  async runServer(sandboxId: string, command: string, port: string = '8080', onStream?: StreamCallback): Promise<ServerResult> {
    const response = await this.call<ServerResult>('/sandbox/server', { sandbox_id: sandboxId, command, port });
    return response;
  }

  async runStaticServer(sandboxId: string, port: string = '8080'): Promise<{ url: string; port: number; pid: number }> {
    const response = await this.call<{ url: string; port: number; pid: number }>('/sandbox/static-server', { sandbox_id: sandboxId, port });
    return response;
  }

  getServers(sandboxId: string): ServerInfo[] {
    return [];
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`http://${this.address}/health`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }
}
