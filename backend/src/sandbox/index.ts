import { ISandboxService, RemoteConfig } from './interfaces';
import { LocalSandboxService } from './local/LocalSandboxService';
import { DockerSandboxService } from './docker/DockerSandboxService';
import { RemoteSandboxClient } from './remote/RemoteSandboxClient';

type SandboxType = 'local' | 'docker' | 'remote';

export function createSandboxService(): ISandboxService {
  const type = (process.env.SANDBOX_TYPE || 'local') as SandboxType;
  const fallback = process.env.SANDBOX_FALLBACK === 'true';
  
  try {
    switch (type) {
      case 'local':
        console.log('[SandboxFactory] Using local sandbox service');
        return new LocalSandboxService();
      
      case 'docker':
        console.log('[SandboxFactory] Using Docker sandbox service');
        return new DockerSandboxService();
      
      case 'remote': {
        const config: RemoteConfig = {
          host: process.env.SANDBOX_HOST || 'localhost',
          port: parseInt(process.env.SANDBOX_PORT || '50051'),
          timeout: parseInt(process.env.SANDBOX_TIMEOUT || '30000'),
          retries: parseInt(process.env.SANDBOX_RETRIES || '3'),
        };
        console.log(`[SandboxFactory] Using remote sandbox service: ${config.host}:${config.port}`);
        return new RemoteSandboxClient(config);
      }
      
      default:
        console.warn(`[SandboxFactory] Unknown type "${type}", falling back to local`);
        return new LocalSandboxService();
    }
  } catch (error) {
    console.error('[SandboxFactory] Failed to create sandbox service:', error);
    
    if (fallback && type !== 'local') {
      console.warn('[SandboxFactory] Falling back to local sandbox service');
      return new LocalSandboxService();
    }
    
    throw error;
  }
}

export { ISandboxService, ServerInfo, ExecResult, ServerResult, StreamCallback, RemoteConfig } from './interfaces.js';
