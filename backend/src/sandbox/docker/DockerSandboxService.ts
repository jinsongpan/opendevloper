import { ISandboxService, ExecResult, ServerResult, ServerInfo, StreamCallback } from '../interfaces';
import { FileNode } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ContainerInfo {
  sandboxId: string;
  container: any;
  projectDir: string;
  lastUsed: number;
  inUse: boolean;
}

const POOL_MAX_SIZE = 3;

export class DockerSandboxService implements ISandboxService {
  private projectDirs: Map<string, string> = new Map();
  private serverPids: Map<string, number[]> = new Map();
  private servers: Map<string, ServerInfo[]> = new Map();
  private serverOutputs: Map<string, string> = new Map();
  private docker: any = null;
  private containerPool: ContainerInfo[] = [];

  constructor() {
    this.initDocker();
    this.startZombieCleanup();
    this.startPoolCleanup();
  }

  private async initDocker() {
    try {
      const Docker = (await import('dockerode')).default;
      this.docker = new Docker();
      await this.docker.ping();
      console.log('[DockerSandbox] Docker is available');
    } catch (error) {
      console.error('[DockerSandbox] Docker not available:', error);
      throw new Error('Docker is not available. Please set SANDBOX_TYPE=local or USE_DOCKER=false');
    }
  }

  private startZombieCleanup() {
    setInterval(() => {
      console.log('[DockerSandbox] Zombie cleanup check...');
      for (const [sandboxId, serverList] of this.servers) {
        const validServers: ServerInfo[] = [];
        for (const server of serverList) {
          try {
            process.kill(server.pid, 0);
            validServers.push(server);
          } catch {
            console.log(`[DockerSandbox] Removing dead server PID ${server.pid}`);
          }
        }
        if (validServers.length > 0) {
          this.servers.set(sandboxId, validServers);
        } else {
          this.servers.delete(sandboxId);
        }
      }
    }, 5 * 60 * 1000);
  }

  private startPoolCleanup() {
    setInterval(async () => {
      if (this.containerPool.length <= POOL_MAX_SIZE) return;
      
      console.log('[DockerSandbox] Starting container pool cleanup...');
      
      const toRemove = this.containerPool.length - POOL_MAX_SIZE;
      const sortedPool = [...this.containerPool].sort((a, b) => a.lastUsed - b.lastUsed);
      
      for (let i = 0; i < toRemove; i++) {
        const containerInfo = sortedPool[i];
        if (!containerInfo.inUse) {
          try {
            await containerInfo.container.stop();
            await containerInfo.container.remove({ force: true });
            console.log(`[DockerSandbox] Removed idle container ${containerInfo.sandboxId}`);
            this.containerPool = this.containerPool.filter(c => c.sandboxId !== containerInfo.sandboxId);
          } catch (error) {
            console.error('[DockerSandbox] Error removing container:', error);
          }
        }
      }
    }, 60 * 1000);
  }

  private async getOrCreateContainer(sandboxId: string, projectDir: string): Promise<any> {
    const idleContainer = this.containerPool.find(c => !c.inUse);
    
    if (idleContainer) {
      console.log(`[DockerSandbox] Reusing idle container for ${sandboxId}`);
      idleContainer.sandboxId = sandboxId;
      idleContainer.projectDir = projectDir;
      idleContainer.lastUsed = Date.now();
      idleContainer.inUse = true;
      await this.resetContainer(sandboxId, projectDir);
      return idleContainer.container;
    }
    
    try {
      console.log(`[DockerSandbox] Creating new container for ${sandboxId}`);
      const container = await this.docker.createContainer({
        Image: 'node:20-alpine',
        Cmd: ['sleep', 'infinity'],
        HostConfig: {
          Binds: [`${projectDir}:/app`],
          Memory: 1024 * 1024 * 1024,
          NanoCpus: 2000000000,
        },
        WorkingDir: '/app',
        name: `ai-developer-${sandboxId}`,
      });
      
      await container.start();
      
      this.containerPool.push({
        sandboxId,
        container,
        projectDir,
        lastUsed: Date.now(),
        inUse: true,
      });
      
      return container;
    } catch (error) {
      console.error('[DockerSandbox] Docker container creation failed:', error);
      throw error;
    }
  }

  private async resetContainer(sandboxId: string, projectDir: string): Promise<void> {
    try {
      await fs.rm(projectDir, { recursive: true, force: true });
      await fs.mkdir(projectDir, { recursive: true });
      console.log(`[DockerSandbox] Reset container directory for ${sandboxId}`);
    } catch (error) {
      console.error('[DockerSandbox] Error resetting container:', error);
    }
  }

  private releaseContainer(sandboxId: string): void {
    const containerInfo = this.containerPool.find(c => c.sandboxId === sandboxId);
    if (containerInfo) {
      console.log(`[DockerSandbox] Releasing container for ${sandboxId}`);
      containerInfo.inUse = false;
      containerInfo.lastUsed = Date.now();
    }
  }

  private async detectPort(pid: number, output: string, defaultPort: number): Promise<number> {
    await new Promise(r => setTimeout(r, 2000));

    const portPatterns = [
      /listening on.*?:(\d+)/i,
      /running on.*?:(\d+)/i,
      /ready on.*?:(\d+)/i,
      /http:\/\/[^:]+:(\d+)/i,
      /localhost:(\d+)/i,
      /127\.0\.0\.1:(\d+)/i,
    ];

    for (const pattern of portPatterns) {
      const match = output.match(pattern);
      if (match) {
        const port = parseInt(match[1]);
        if (port >= 3001 && port <= 9999) return port;
      }
    }

    return defaultPort;
  }

  addServer(sandboxId: string, info: ServerInfo) {
    const existing = this.servers.get(sandboxId) || [];
    this.servers.set(sandboxId, [...existing, info]);
  }

  getServers(sandboxId: string): ServerInfo[] {
    return this.servers.get(sandboxId) || [];
  }

  clearServers(sandboxId: string) {
    this.servers.delete(sandboxId);
    this.serverPids.delete(sandboxId);
  }

  private appendServerOutput(sandboxId: string, output: string) {
    const existing = this.serverOutputs.get(sandboxId) || '';
    this.serverOutputs.set(sandboxId, existing + output);
  }

  private getServerOutput(sandboxId: string): string {
    return this.serverOutputs.get(sandboxId) || '';
  }

  async createSandbox(): Promise<string> {
    const sandboxId = uuidv4();
    const projectDir = path.join('/tmp/ai-developer', sandboxId);
    
    await fs.mkdir(projectDir, { recursive: true });
    this.projectDirs.set(sandboxId, projectDir);

    const container = await this.getOrCreateContainer(sandboxId, projectDir);
    
    if (container) {
      try {
        await this.dockerExec(sandboxId, 'npm init -y');
      } catch (error) {
        console.error('[DockerSandbox] Docker exec failed:', error);
      }
    }
    
    console.log(`[DockerSandbox] Created sandbox ${sandboxId}`);
    return sandboxId;
  }

  async destroySandbox(sandboxId: string): Promise<void> {
    const projectDir = this.projectDirs.get(sandboxId);
    
    this.releaseContainer(sandboxId);
    
    const killProcess = async (pid: number): Promise<void> => {
      try {
        process.kill(-pid, 'SIGTERM');
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 500));
      try { process.kill(-pid, 'SIGKILL'); } catch {}
      try { process.kill(pid, 'SIGKILL'); } catch {}
    };
    
    const pids = this.serverPids.get(sandboxId);
    if (pids && pids.length > 0) {
      await Promise.all(pids.map(pid => killProcess(pid)));
    }

    const servers = this.servers.get(sandboxId) || [];
    for (const server of servers) {
      await killProcess(server.pid);
    }
    this.clearServers(sandboxId);
    this.serverOutputs.delete(sandboxId);

    if (projectDir) {
      try {
        await fs.rm(projectDir, { recursive: true, force: true });
      } catch (error) {
        console.error('[DockerSandbox] Error removing project directory:', error);
      }
      this.projectDirs.delete(sandboxId);
    }
    
    console.log(`[DockerSandbox] Destroyed sandbox ${sandboxId}`);
  }

  private async dockerExec(sandboxId: string, command: string): Promise<{ output: string; exitCode: number }> {
    const containers = await this.docker.listContainers({ all: true });
    const container = containers.find((c: any) => c.Names.includes(`ai-developer-${sandboxId}`));
    
    if (!container) {
      return { output: 'Container not found', exitCode: 1 };
    }

    const dockerContainer = this.docker.getContainer(container.Id);
    const exec = await dockerContainer.exec({
      Cmd: ['sh', '-c', command],
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await exec.start({ hijack: true, stdin: false });
    
    return new Promise((resolve) => {
      let output = '';
      stream.on('data', (chunk: Buffer) => {
        output += chunk.toString();
      });
      stream.on('end', () => {
        exec.inspect().then((info: any) => {
          resolve({ output, exitCode: info.ExitCode || 0 });
        });
      });
    });
  }

  async execCommand(sandboxId: string, command: string, onStream?: StreamCallback): Promise<ExecResult> {
    const projectDir = this.projectDirs.get(sandboxId);
    if (!projectDir) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    try {
      return await this.dockerExec(sandboxId, command);
    } catch (error: any) {
      return { output: error.message, exitCode: 1 };
    }
  }

  async createFile(sandboxId: string, filePath: string, content: string): Promise<void> {
    let projectDir = this.projectDirs.get(sandboxId);
    if (!projectDir) {
      const newProjectDir = path.join('/tmp/ai-developer', sandboxId);
      await fs.mkdir(newProjectDir, { recursive: true });
      this.projectDirs.set(sandboxId, newProjectDir);
    }

    const projectPath = this.projectDirs.get(sandboxId)!;
    const fullPath = path.join(projectPath, filePath);
    
    if (!fullPath.startsWith(projectPath)) {
      throw new Error('Invalid path: escape detected');
    }
    
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async readFile(sandboxId: string, filePath: string): Promise<string> {
    const projectDir = this.projectDirs.get(sandboxId);
    if (!projectDir) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    const fullPath = path.join(projectDir, filePath);
    
    if (!fullPath.startsWith(projectDir)) {
      throw new Error('Invalid path: escape detected');
    }
    
    return fs.readFile(fullPath, 'utf-8');
  }

  async listFiles(sandboxId: string, dirPath: string = ''): Promise<FileNode[]> {
    let projectDir = this.projectDirs.get(sandboxId);
    
    if (!projectDir) {
      projectDir = path.join('/tmp/ai-developer', sandboxId);
      try {
        await fs.access(projectDir);
        this.projectDirs.set(sandboxId, projectDir);
      } catch {
        return [];
      }
    }

    const fullPath = path.join(projectDir, dirPath);
    
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      const nodes: FileNode[] = [];

      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;

        const nodePath = dirPath ? `${dirPath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          const children = await this.listFiles(sandboxId, nodePath);
          nodes.push({ name: entry.name, path: nodePath, type: 'directory', children });
        } else {
          nodes.push({ name: entry.name, path: nodePath, type: 'file' });
        }
      }

      return nodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
    } catch {
      return [];
    }
  }

  async deleteFile(sandboxId: string, filePath: string): Promise<void> {
    const projectDir = this.projectDirs.get(sandboxId);
    if (!projectDir) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    const fullPath = path.join(projectDir, filePath);
    
    if (!fullPath.startsWith(projectDir)) {
      throw new Error('Invalid path: escape detected');
    }
    
    await fs.rm(fullPath, { recursive: true, force: true });
  }

  async runApplication(sandboxId: string, command: string): Promise<ExecResult> {
    return this.execCommand(sandboxId, command);
  }

  async installDependencies(sandboxId: string): Promise<ExecResult> {
    const projectDir = this.projectDirs.get(sandboxId);
    if (!projectDir) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    try {
      await fs.access(path.join(projectDir, 'requirements.txt'));
      return await this.dockerExec(sandboxId, 'pip install -r requirements.txt');
    } catch {
      try {
        await fs.access(path.join(projectDir, 'package.json'));
        return await this.dockerExec(sandboxId, 'npm install');
      } catch {
        return { output: 'No package manager detected', exitCode: 0 };
      }
    }
  }

  async runServer(sandboxId: string, command: string, defaultPort: string = '8080', onStream?: StreamCallback): Promise<ServerResult> {
    const projectDir = this.projectDirs.get(sandboxId);
    if (!projectDir) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    const net = await import('net');
    
    const isPortAvailable = (port: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        server.listen(port, '127.0.0.1');
      });
    };

    const killPort = async (port: number) => {
      try {
        await execAsync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`);
        console.log(`[DockerSandbox] Killed process on port ${port}`);
        await new Promise(r => setTimeout(r, 500));
      } catch {}
    };

    let port = parseInt(defaultPort);
    const basePort = Math.max(port, 3001);
    
    for (let i = 0; i < 100; i++) {
      if (await isPortAvailable(port)) {
        break;
      }
      console.log(`[DockerSandbox] Port ${port} is occupied, trying to kill and reuse...`);
      await killPort(port);
      port++;
      if (port > 9999) port = basePort;
    }

    const portArg = port.toString();
    const commandWithPort = command.replace(/\bport[:\s]*\d+\b/i, `port ${portArg}`).replace(/\b8000\b/, portArg);
    
    console.log(`[DockerSandbox] Starting server in ${projectDir} with command: ${commandWithPort} on port ${port}`);

    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const child = spawn('sh', ['-c', commandWithPort], {
        cwd: projectDir,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      const pid = child.pid!;
      console.log(`[DockerSandbox] Server process started with PID: ${pid}`);
      
      if (pid) {
        const existingPids = this.serverPids.get(sandboxId) || [];
        this.serverPids.set(sandboxId, [...existingPids, pid]);
      }

      let output = '';
      
      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        onStream?.(text, false);
      });

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        onStream?.(text, true);
      });

      this.appendServerOutput(sandboxId, output);

      setTimeout(async () => {
        const fullOutput = output + this.getServerOutput(sandboxId);
        const actualPort = await this.detectPort(pid, fullOutput, port);
        const url = `http://localhost:${actualPort}`;

        this.addServer(sandboxId, {
          sandboxId,
          port: actualPort,
          url,
          pid,
          startTime: Date.now()
        });

        output = `✅ 服务器已启动: ${url}\n\n${output}`;
        resolve({ output, url, port: actualPort, pid, exitCode: 0 });
      }, 5000);
    });
  }

  async healthCheck(): Promise<boolean> {
    if (!this.docker) return false;
    try {
      await this.docker.ping();
      return true;
    } catch {
      return false;
    }
  }

  async runStaticServer(sandboxId: string, defaultPort: string = '8080'): Promise<{ url: string; port: number; pid: number }> {
    const projectDir = this.projectDirs.get(sandboxId);
    if (!projectDir) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    const parsedPort = parseInt(defaultPort);
    const url = `http://localhost:${parsedPort}`;
    const command = `python3 -m http.server ${parsedPort}`;
    
    const { spawn } = await import('child_process');
    const child = spawn('sh', ['-c', command], {
      cwd: projectDir,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const pid = child.pid!;
    console.log(`[DockerSandbox] Started static server with PID: ${pid} on port ${parsedPort}`);
    
    const existingPids = this.serverPids.get(sandboxId) || [];
    this.serverPids.set(sandboxId, [...existingPids, pid]);
    
    this.addServer(sandboxId, {
      sandboxId,
      port: parsedPort,
      url,
      pid,
      startTime: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    return { url, port: parsedPort, pid };
  }
}
