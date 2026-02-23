import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSandboxService } from '../src/sandbox/index.js';
import { ISandboxService } from '../src/sandbox/interfaces.js';

vi.mock('../src/sandbox/local/LocalSandboxService.js');
vi.mock('../src/sandbox/docker/DockerSandboxService.js');
vi.mock('../src/sandbox/remote/RemoteSandboxClient.js');

describe('SandboxFactory', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.SANDBOX_TYPE;
    delete process.env.USE_DOCKER;
    delete process.env.SANDBOX_HOST;
    delete process.env.SANDBOX_PORT;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create LocalSandboxService by default', async () => {
    const { LocalSandboxService } = await import('../src/sandbox/local/LocalSandboxService.js');
    createSandboxService();
    expect(LocalSandboxService).toHaveBeenCalled();
  });

  it('should create DockerSandboxService when USE_DOCKER=true', async () => {
    process.env.USE_DOCKER = 'true';
    const { DockerSandboxService } = await import('../src/sandbox/docker/DockerSandboxService.js');
    createSandboxService();
    expect(DockerSandboxService).toHaveBeenCalled();
  });

  it('should create DockerSandboxService when SANDBOX_TYPE=docker', async () => {
    process.env.SANDBOX_TYPE = 'docker';
    const { DockerSandboxService } = await import('../src/sandbox/docker/DockerSandboxService.js');
    createSandboxService();
    expect(DockerSandboxService).toHaveBeenCalled();
  });

  it('should create DockerSandboxService when USE_DOCKER and SANDBOX_TYPE=local', async () => {
    process.env.USE_DOCKER = 'true';
    process.env.SANDBOX_TYPE = 'local';
    const { DockerSandboxService } = await import('../src/sandbox/docker/DockerSandboxService.js');
    createSandboxService();
    expect(DockerSandboxService).toHaveBeenCalled();
  });

  it('should create RemoteSandboxClient when SANDBOX_TYPE=remote', async () => {
    process.env.SANDBOX_TYPE = 'remote';
    process.env.SANDBOX_HOST = 'localhost';
    process.env.SANDBOX_PORT = '50051';
    const { RemoteSandboxClient } = await import('../src/sandbox/remote/RemoteSandboxClient.js');
    createSandboxService();
    expect(RemoteSandboxClient).toHaveBeenCalledWith({
      host: 'localhost',
      port: 50051,
      timeout: 30000,
      retries: 3,
    });
  });

  it('should use default remote config values', async () => {
    process.env.SANDBOX_TYPE = 'remote';
    const { RemoteSandboxClient } = await import('../src/sandbox/remote/RemoteSandboxClient.js');
    createSandboxService();
    expect(RemoteSandboxClient).toHaveBeenCalledWith({
      host: 'localhost',
      port: 50051,
      timeout: 30000,
      retries: 3,
    });
  });
});

describe('ISandboxService Interface', () => {
  it('should have all required methods', () => {
    const requiredMethods = [
      'createSandbox',
      'destroySandbox',
      'createFile',
      'readFile',
      'listFiles',
      'deleteFile',
      'execCommand',
      'runApplication',
      'installDependencies',
      'runServer',
      'runStaticServer',
      'getServers',
      'healthCheck',
    ];

    const mockService: Partial<ISandboxService> = {
      createSandbox: vi.fn(),
      destroySandbox: vi.fn(),
      createFile: vi.fn(),
      readFile: vi.fn(),
      listFiles: vi.fn(),
      deleteFile: vi.fn(),
      execCommand: vi.fn(),
      runApplication: vi.fn(),
      installDependencies: vi.fn(),
      runServer: vi.fn(),
      runStaticServer: vi.fn(),
      getServers: vi.fn(),
      healthCheck: vi.fn(),
    };

    for (const method of requiredMethods) {
      expect(typeof mockService[method]).toBe('function');
    }
  });
});
