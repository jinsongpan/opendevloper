import { Router } from 'express';
import { DeepAgentsService } from '../agents/deepAgents.js';
import { ChatRequest, Settings } from '../types.js';
import { v4 as uuidv4 } from 'uuid';
import { sandboxService, currentSandboxId, setCurrentSandboxId } from './sandbox.js';

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

async function ensureSandbox(): Promise<string> {
  if (!currentSandboxId) {
    const sandboxId = await sandboxService.createSandbox();
    setCurrentSandboxId(sandboxId);
    console.log('[chat] Created new sandbox:', sandboxId);
  }
  return currentSandboxId!;
}

router.post('/', async (req, res) => {
  try {
    const { message, settings, provider } = req.body as ChatRequest & { provider?: string };
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid message: must be a non-empty string' });
    }
    
    if (message.length > 10000) {
      return res.status(400).json({ error: 'Message too long: maximum 10000 characters' });
    }
    
    const validProviders = ['anthropic', 'openai', 'openrouter'];
    const finalProvider = (provider && validProviders.includes(provider)) ? provider : 'anthropic';
    const finalSettings = settings && typeof settings === 'object' ? settings : defaultSettings;
    
    if (!finalSettings[finalProvider as keyof typeof finalSettings]?.apiKey) {
      return res.status(400).json({ error: `No API key configured for provider: ${finalProvider}` });
    }
    
    await ensureSandbox();
    
    const agent = new DeepAgentsService(finalSettings, finalProvider);
    const response = await agent.chat([
      { id: uuidv4(), role: 'user', content: message, timestamp: Date.now() },
    ]);

    res.json({
      id: uuidv4(),
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to get response' });
  }
});

export { router as chatRouter };
