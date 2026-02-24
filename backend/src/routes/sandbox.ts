import { Router } from 'express';
import { createSandboxService } from '../sandbox/index.js';
import { DeepAgentsService } from '../agents/deepAgents.js';
import { PlanStep, Settings, ExecutionPlan } from '../types.js';
import { Server } from 'socket.io';
import { emitProgress, emitComplete, emitLog, emitServerStarted, CompleteResult } from '../services/socket.js';
import { v4 as uuidv4 } from 'uuid';

export const sandboxService = createSandboxService();
export let currentSandboxId: string | null = null;
let io: Server;
let isCreatingSandbox = false;

export function setSocketIO(socketIO: Server) {
  io = socketIO;
}

export function setCurrentSandboxId(id: string | null) {
  currentSandboxId = id;
}

const router = Router();

const defaultSettings: Settings = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4.6',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-5.2-codex',
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'z-ai/glm-4.5-air:free',
  },
};

router.post('/create', async (req, res) => {
  try {
    if (isCreatingSandbox) {
      return res.status(409).json({ error: 'Sandbox creation in progress' });
    }
    
    isCreatingSandbox = true;
    try {
      if (currentSandboxId) {
        await sandboxService.destroySandbox(currentSandboxId);
      }
      currentSandboxId = await sandboxService.createSandbox();
      setCurrentSandboxId(currentSandboxId);
      res.json({ sandboxId: currentSandboxId });
    } finally {
      isCreatingSandbox = false;
    }
  } catch (error: any) {
    console.error('Create sandbox error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/destroy', async (req, res) => {
  try {
    if (currentSandboxId) {
      await sandboxService.destroySandbox(currentSandboxId);
      currentSandboxId = null;
      setCurrentSandboxId(null);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/plan', async (req, res) => {
  try {
    const { requirements, settings, provider, isModification, history, sandboxId: reqSandboxId } = req.body as { requirements: string; settings?: Settings; provider?: string; isModification?: boolean; history?: { role: string; content: string }[]; sandboxId?: string };
    
    if (!requirements || typeof requirements !== 'string' || requirements.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid requirements: must be a non-empty string' });
    }
    
    if (requirements.length > 10000) {
      return res.status(400).json({ error: 'Requirements too long: maximum 10000 characters' });
    }
    
    const validProviders = ['anthropic', 'openai', 'openrouter'];
    const finalProvider = (provider && validProviders.includes(provider)) ? provider : 'anthropic';
    const finalSettings = settings && typeof settings === 'object' ? settings : defaultSettings;
    
    if (!finalSettings[finalProvider as keyof typeof finalSettings]?.apiKey) {
      return res.status(400).json({ error: `No API key configured for provider: ${finalProvider}` });
    }
    
    console.log('Provider:', finalProvider);
    console.log('Is modification:', isModification);
    console.log('History length:', history?.length || 0);
    
    const agent = new DeepAgentsService(finalSettings, finalProvider);
    
    const targetSandboxId = reqSandboxId || currentSandboxId;
    let existingFiles: { path: string; content: string }[] = [];
    if (targetSandboxId) {
      try {
        const files = await sandboxService.listFiles(targetSandboxId);
        for (const file of files) {
          if (file.type === 'file') {
            try {
              const content = await sandboxService.readFile(targetSandboxId, file.path);
              existingFiles.push({ path: file.path, content });
            } catch (e) {
              console.warn(`[Plan] Failed to read file ${file.path}:`, e);
            }
          }
        }
      } catch (e) {
        console.warn('[Plan] Failed to list files for context:', e);
      }
    }

    const steps = await agent.generatePlan(requirements, existingFiles, isModification, history);
    
    const plan: ExecutionPlan = {
      id: uuidv4(),
      steps,
      estimatedTime: `${steps.length * 30}秒`,
    };

    res.json(plan);
  } catch (error: any) {
    console.error('Plan generation error:', error);
    const errorMessage = error.message || 'Failed to generate plan';
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/execute', async (req, res) => {
  try {
    const { plan, sandboxId: reqSandboxId } = req.body;
    const targetSandboxId = reqSandboxId || currentSandboxId;

    if (!targetSandboxId) {
      return res.status(400).json({ error: 'No sandbox available' });
    }

    if (!plan || typeof plan !== 'object' || !Array.isArray(plan.steps) || plan.steps.length === 0) {
      return res.status(400).json({ error: 'Invalid plan: must have at least one step' });
    }

    const totalSteps = plan.steps.length;
    let completedSteps = 0;

    for (const step of plan.steps as PlanStep[]) {
      console.log('Emitting progress - running:', step.id, step.type);
      emitProgress(io, targetSandboxId, {
        stepId: step.id,
        status: 'running',
        progress: Math.round((completedSteps / totalSteps) * 100),
      });

      try {
        let output = '';
        
        switch (step.type) {
          case 'CREATE_FILE':
            if (step.target && step.content) {
              await sandboxService.createFile(targetSandboxId, step.target, step.content);
              output = `Created file: ${step.target}`;
            }
            break;
            
          case 'EDIT_FILE':
            if (step.target && step.content) {
              await sandboxService.createFile(targetSandboxId, step.target, step.content);
              output = `Updated file: ${step.target}`;
            }
            break;
            
          case 'DELETE_FILE':
            if (step.target) {
              await sandboxService.deleteFile(targetSandboxId, step.target);
              output = `Deleted: ${step.target}`;
            }
            break;
            
          case 'RUN_COMMAND':
            if (step.command) {
              const result = await sandboxService.runApplication(targetSandboxId, step.command);
              output = result.output;
              if (result.exitCode !== 0) {
                throw new Error(`Command failed with exit code ${result.exitCode}`);
              }
            }
            break;

          case 'INSTALL_PACKAGE':
            const depResult = await sandboxService.installDependencies(targetSandboxId);
            output = depResult.output;
            if (depResult.exitCode !== 0) {
              throw new Error(`Dependency installation failed with exit code ${depResult.exitCode}`);
            }
            break;

          case 'RUN_SERVER':
            if (step.command) {
              const port = step.target || '8080';
              
              const serverInfo = await sandboxService.runServer(targetSandboxId, step.command, port);
              output = serverInfo.output;
              step.url = serverInfo.url;
              
              emitServerStarted(io, targetSandboxId, { url: serverInfo.url, port: serverInfo.port });
            }
            break;

          case 'OPEN_BROWSER':
            const existingServers = sandboxService.getServers(targetSandboxId);
            let serverUrl: string;
            
            if (existingServers.length > 0) {
              serverUrl = existingServers[0].url;
            } else if (step.url && (step.url.startsWith('http://') || step.url.startsWith('https://'))) {
              serverUrl = step.url;
            } else if (
              (step.target && (step.target.endsWith('.html') || step.target.endsWith('.htm'))) ||
              (step.url && (step.url.endsWith('.html') || step.url.endsWith('.htm') || step.url.includes('.html')))
            ) {
              const serverInfo = await sandboxService.runStaticServer(targetSandboxId, '8080');
              serverUrl = serverInfo.url;
              emitServerStarted(io, targetSandboxId, { url: serverUrl, port: serverInfo.port });
            } else {
              const serverInfo = await sandboxService.runStaticServer(targetSandboxId, '8080');
              serverUrl = serverInfo.url;
              emitServerStarted(io, targetSandboxId, { url: serverUrl, port: serverInfo.port });
            }
            
            output = serverUrl;
            break;
        }

        completedSteps++;
        
        console.log('Emitting progress - completed:', step.id, step.type);
        emitProgress(io, targetSandboxId, {
          stepId: step.id,
          status: 'completed',
          output,
          progress: Math.round((completedSteps / totalSteps) * 100),
        });

        emitLog(io, targetSandboxId, {
          stepId: step.id,
          message: output,
        });

      } catch (stepError: any) {
        emitProgress(io, targetSandboxId, {
          stepId: step.id,
          status: 'failed',
          error: stepError.message,
          progress: Math.round((completedSteps / totalSteps) * 100),
        });

        emitComplete(io, targetSandboxId, {
          success: false,
          message: stepError.message,
        });

        res.json({ success: false, error: stepError.message });
        return;
      }
    }

    const files = await sandboxService.listFiles(targetSandboxId);
    
    const servers = sandboxService.getServers(targetSandboxId);
    const lastServer = servers.length > 0 ? servers[servers.length - 1] : undefined;
    
    emitComplete(io, targetSandboxId, {
      success: true,
      message: '所有步骤执行完成',
      files,
      serverUrl: lastServer?.url,
    });

    res.json({ success: true, serverUrl: lastServer?.url });
  } catch (error: any) {
    console.error('Execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/exec', async (req, res) => {
  try {
    const { command, sandboxId: reqSandboxId } = req.body;
    const targetSandboxId = reqSandboxId || currentSandboxId;

    if (!targetSandboxId) {
      throw new Error('No sandbox available');
    }

    const result = await sandboxService.runApplication(targetSandboxId, command);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/files', async (req, res) => {
  try {
    const dir = req.query.dir as string || '';
    const sandboxId = req.query.sandboxId as string || currentSandboxId;
    if (!sandboxId) {
      return res.json({ files: [], serverUrl: null });
    }
    const files = await sandboxService.listFiles(sandboxId, dir);
    let servers = sandboxService.getServers(sandboxId);
    
    if (servers.length === 0) {
      const hasHtml = files.some((f: any) => f.name.endsWith('.html')) || 
        files.some((f: any) => f.type === 'directory' && f.name === 'templates');
      if (hasHtml) {
        try {
          const serverInfo = await sandboxService.runStaticServer(sandboxId, '8080');
          servers = [{
            ...serverInfo,
            sandboxId,
            startTime: Date.now()
          }];
        } catch (e) {
          console.error('Failed to start server:', e);
        }
      }
    }
    
    res.json({ files, serverUrl: servers.length > 0 ? servers[0].url : null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as sandboxRouter };
