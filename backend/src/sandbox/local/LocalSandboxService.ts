import { ISandboxService, ExecResult, ServerResult, ServerInfo, StreamCallback } from '../interfaces';
import { FileNode } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class LocalSandboxService implements ISandboxService {
  private projectDirs: Map<string, string> = new Map();
  private serverPids: Map<string, number[]> = new Map();
  private servers: Map<string, ServerInfo[]> = new Map();
  private serverOutputs: Map<string, string> = new Map();

  constructor() {
    this.recoverSandboxes();
    this.startZombieCleanup();
  }

  private async recoverSandboxes() {
    try {
      const baseDir = '/tmp/ai-developer';
      await fs.access(baseDir);
      const entries = await fs.readdir(baseDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const sandboxId = entry.name;
          this.projectDirs.set(sandboxId, path.join(baseDir, sandboxId));
          console.log(`[LocalSandbox] Recovered sandbox: ${sandboxId}`);
        }
      }
    } catch {
      console.log('[LocalSandbox] No existing sandboxes to recover');
    }
  }

  private startZombieCleanup() {
    setInterval(() => {
      console.log('[LocalSandbox] Zombie cleanup check...');
      for (const [sandboxId, serverList] of this.servers) {
        const validServers: ServerInfo[] = [];
        for (const server of serverList) {
          try {
            process.kill(server.pid, 0);
            validServers.push(server);
          } catch {
            console.log(`[LocalSandbox] Removing dead server PID ${server.pid} for sandbox ${sandboxId}`);
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

  private async detectPort(pid: number, output: string, defaultPort: number): Promise<number> {
    await new Promise(r => setTimeout(r, 2000));

    const portPatterns = [
      /listening on.*?:(\d+)/i,
      /running on.*?:(\d+)/i,
      /ready on.*?:(\d+)/i,
      /http:\/\/[^:]+:(\d+)/i,
      /localhost:(\d+)/i,
      /127\.0\.0\.1:(\d+)/i,
      /port[:\s]+(\d+)/i,
    ];

    for (const pattern of portPatterns) {
      const match = output.match(pattern);
      if (match) {
        const port = parseInt(match[1]);
        if (port >= 3001 && port <= 9999) {
          console.log(`[LocalSandbox] Detected port ${port} from output`);
          return port;
        }
      }
    }

    try {
      const { stdout } = await execAsync(`lsof -i -P -n 2>/dev/null | grep LISTEN | grep ${pid}`);
      const match = stdout.match(/:(\d+)/);
      if (match) {
        const port = parseInt(match[1]);
        if (port >= 3001 && port <= 9999) {
          console.log(`[LocalSandbox] Detected port ${port} from lsof`);
          return port;
        }
      }
    } catch {}

    console.log(`[LocalSandbox] Using default port ${defaultPort}`);
    return defaultPort;
  }

  addServer(sandboxId: string, info: ServerInfo) {
    const existing = this.servers.get(sandboxId) || [];
    this.servers.set(sandboxId, [...existing, info]);
    console.log(`[LocalSandbox] Added server ${info.url} for sandbox ${sandboxId}`);
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
    
    console.log(`[LocalSandbox] Created sandbox ${sandboxId} at ${projectDir}`);
    return sandboxId;
  }

  async destroySandbox(sandboxId: string): Promise<void> {
    const projectDir = this.projectDirs.get(sandboxId);
    
    const killProcess = async (pid: number): Promise<void> => {
      const processGroup = pid > 0 ? -pid : pid;
      
      try {
        process.kill(processGroup, 'SIGTERM');
      } catch (err: any) {
        if (err.code === 'ESRCH') return;
        try {
          process.kill(pid, 'SIGTERM');
        } catch (err2: any) {
          if (err2.code === 'ESRCH') return;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try { process.kill(processGroup, 'SIGKILL'); } catch {}
      try { process.kill(pid, 'SIGKILL'); } catch {}
    };
    
    const pids = this.serverPids.get(sandboxId);
    if (pids && pids.length > 0) {
      console.log(`[LocalSandbox] Killing processes: ${pids.join(', ')}`);
      await Promise.all(pids.map(pid => killProcess(pid)));
    }

    const servers = this.servers.get(sandboxId) || [];
    for (const server of servers) {
      await killProcess(server.pid);
    }
    this.clearServers(sandboxId);
    this.serverOutputs.delete(sandboxId);

    const allPids = await this.findPidsByProjectDir(projectDir || '');
    if (allPids.length > 0) {
      await Promise.all(allPids.map(pid => killProcess(pid)));
    }

    if (projectDir) {
      try {
        await fs.rm(projectDir, { recursive: true, force: true });
      } catch (error) {
        console.error('[LocalSandbox] Error removing project directory:', error);
      }
      this.projectDirs.delete(sandboxId);
    }
    
    console.log(`[LocalSandbox] Destroyed sandbox ${sandboxId}`);
  }

  private async findPidsByProjectDir(projectDir: string): Promise<number[]> {
    if (!projectDir) return [];
    
    try {
      const { stdout } = await execAsync(`lsof -t +D "${projectDir}" 2>/dev/null || echo ""`);
      const pids = stdout.trim().split('\n').filter(p => p.trim()).map(p => parseInt(p.trim())).filter(p => !isNaN(p));
      return pids;
    } catch {
      return [];
    }
  }

  async execCommand(sandboxId: string, command: string, onStream?: StreamCallback): Promise<ExecResult> {
    const projectDir = this.projectDirs.get(sandboxId);
    if (!projectDir) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    return new Promise((resolve) => {
      const { spawn } = require('child_process');
      const child = spawn('sh', ['-c', command], {
        cwd: projectDir,
      });

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
      
      child.on('error', (error: Error) => {
        console.error(`[LocalSandbox] Exec error: ${error.message}`);
      });
      
      child.on('close', (code: number | null) => {
        resolve({ output, exitCode: code || 0 });
      });
    });
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
          nodes.push({
            name: entry.name,
            path: nodePath,
            type: 'directory',
            children,
          });
        } else {
          nodes.push({
            name: entry.name,
            path: nodePath,
            type: 'file',
          });
        }
      }

      return nodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
    } catch (error) {
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

    const { exec: nodeExec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(nodeExec);
    
    let output = '';
    
    try {
      await fs.access(path.join(projectDir, 'requirements.txt'));
      output += '检测到 requirements.txt，正在安装依赖...\n';
      
      try {
        const { stdout, stderr } = await execAsync(`cd "${projectDir}" && pip install -r requirements.txt`);
        output += stdout + stderr + '\n依赖安装完成！\n';
        return { output, exitCode: 0 };
      } catch (error: any) {
        console.error('[LocalSandbox] pip install error:', error.message);
        return { output: output + error.message, exitCode: 1 };
      }
    } catch {
      try {
        await fs.access(path.join(projectDir, 'package.json'));
        output += '检测到 package.json，正在安装依赖...\n';
        
        try {
          const { stdout, stderr } = await execAsync(`cd "${projectDir}" && npm install`);
          output += stdout + stderr + '\n依赖安装完成！\n';
          return { output, exitCode: 0 };
        } catch (error: any) {
          console.error('[LocalSandbox] npm install error:', error.message);
          return { output: output + error.message, exitCode: 1 };
        }
      } catch {
        output += '未检测到 requirements.txt 或 package.json，跳过依赖安装\n';
        return { output, exitCode: 0 };
      }
    }
  }

  async runServer(sandboxId: string, command: string, defaultPort: string = '8000', onStream?: StreamCallback): Promise<ServerResult> {
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
        console.log(`[LocalSandbox] Killed process on port ${port}`);
        await new Promise(r => setTimeout(r, 500));
      } catch {}
    };

    let port = parseInt(defaultPort);
    const basePort = Math.max(port, 3001);
    
    for (let i = 0; i < 100; i++) {
      if (await isPortAvailable(port)) {
        break;
      }
      console.log(`[LocalSandbox] Port ${port} is occupied, trying to kill and reuse...`);
      await killPort(port);
      port++;
      if (port > 9999) port = basePort;
    }

    console.log(`[LocalSandbox] Starting server in ${projectDir} with command: ${command} on port ${port}`);

    const portArg = port.toString();
    const commandWithPort = command.replace(/\bport[:\s]*\d+\b/i, `port ${portArg}`).replace(/\b8000\b/, portArg);
    
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const child = spawn('sh', ['-c', commandWithPort], {
        cwd: projectDir,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      const pid = child.pid!;
      console.log(`[LocalSandbox] Server process started with PID: ${pid}`);
      
      if (pid) {
        const existingPids = this.serverPids.get(sandboxId) || [];
        if (!existingPids.includes(pid)) {
          this.serverPids.set(sandboxId, [...existingPids, pid]);
        }
      }

      let output = '';
      
      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        console.log(`[LocalSandbox] stdout: ${text}`);
        onStream?.(text, false);
      });

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        console.log(`[LocalSandbox] stderr: ${text}`);
        onStream?.(text, true);
      });

      child.on('error', (error: Error) => {
        console.error(`[LocalSandbox] Error: ${error.message}`);
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

        output = `✅ 服务器已启动: ${url}\n\n${output}\n\n如需停止服务器，请刷新页面或创建新项目。`;
        console.log(`[LocalSandbox] Resolving with URL: ${url}, port: ${actualPort}`);
        resolve({ output, url, port: actualPort, pid, exitCode: 0 });
      }, 5000);
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      await fs.access('/tmp/ai-developer');
      return true;
    } catch {
      return false;
    }
  }

  async runStaticServer(sandboxId: string, defaultPort: string = '8000'): Promise<{ url: string; port: number; pid: number }> {
    const projectDir = this.projectDirs.get(sandboxId);
    if (!projectDir) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    const existingServers = this.servers.get(sandboxId) || [];
    if (existingServers.length > 0) {
      console.log(`[LocalSandbox] Reusing existing server for sandbox ${sandboxId}`);
      return existingServers[0];
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

    const hash = sandboxId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    const basePort = 8000 + Math.abs(hash % 1000);

    const killPort = async (port: number) => {
      try {
        await execAsync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`);
        console.log(`[LocalSandbox] Killed process on port ${port}`);
        await new Promise(r => setTimeout(r, 500));
      } catch {}
    };

    let port = basePort;
    for (let i = 0; i < 100; i++) {
      if (await isPortAvailable(port)) {
        break;
      }
      await killPort(port);
      port++;
      if (port > 9000) throw new Error('No available ports');
    }

    const url = `http://localhost:${port}`;
    const command = `python3 -m http.server ${port}`;
    
    const { spawn } = await import('child_process');
    const child = spawn('sh', ['-c', command], {
      cwd: projectDir,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const pid = child.pid!;
    console.log(`[LocalSandbox] Started static server with PID: ${pid} on port ${port}`);
    
    const existingPids = this.serverPids.get(sandboxId) || [];
    this.serverPids.set(sandboxId, [...existingPids, pid]);
    
    this.addServer(sandboxId, {
      sandboxId,
      port,
      url,
      pid,
      startTime: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    return { url, port, pid };
  }
}
