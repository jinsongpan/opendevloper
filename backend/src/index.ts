import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { chatRouter } from './routes/chat.js';
import { filesRouter } from './routes/files.js';
import { sandboxRouter, setSocketIO, currentSandboxId, sandboxService } from './routes/sandbox.js';
import { setupSocketHandlers } from './services/socket.js';

dotenv.config();

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

if (allowedOrigin === '*') {
  console.error('SECURITY WARNING: CORS origin cannot be "*". Using default origin instead.');
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin !== '*' ? allowedOrigin : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: allowedOrigin !== '*' ? allowedOrigin : 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.get('/api/config', (req, res) => {
  const defaultProviders = (process.env.DEFAULT_PROVIDERS || '')
    .split(',')
    .map(p => p.trim().toLowerCase())
    .filter(p => p);
  
  const response: any = {};
  
  if (defaultProviders.includes('anthropic')) {
    response.anthropic = {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      configured: !!process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4.6',
    };
  }
  
  if (defaultProviders.includes('openai')) {
    response.openai = {
      apiKey: process.env.OPENAI_API_KEY || '',
      configured: !!process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-5.2-codex',
    };
  }
  
  if (defaultProviders.includes('openrouter')) {
    response.openrouter = {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      configured: !!process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'z-ai/glm-4.5-air:free',
    };
  }
  
  res.json(response);
});

app.get('/api/preview/:filePath(*)', async (req, res) => {
  let filePath = req.params.filePath;
  
  if (!currentSandboxId) {
    return res.status(404).send('No sandbox available');
  }
  
  if (filePath.includes('..') || filePath.startsWith('/') || filePath.startsWith('\\')) {
    return res.status(400).send('Invalid path: path traversal not allowed');
  }
  
  const projectDir = path.join('/tmp/ai-developer', currentSandboxId);
  const fullPath = path.join(projectDir, filePath);
  
  if (!fullPath.startsWith(projectDir)) {
    return res.status(400).send('Invalid path: path traversal not allowed');
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
  } catch (error) {
    res.status(404).send('File not found');
  }
});

app.get('/api/servers', (req, res) => {
  if (!currentSandboxId) {
    return res.json([]);
  }
  const servers = sandboxService.getServers(currentSandboxId);
  res.json(servers);
});

app.all('/api/preview-server/:port(*)', async (req, res) => {
  const { port } = req.params;
  
  const portNum = parseInt(port);
  if (isNaN(portNum) || portNum < 3001 || portNum > 9999) {
    return res.status(403).send('Port not allowed. Only ports 3001-9999 are permitted.');
  }

  const basePath = `/api/preview-server/${port}`;
  const targetPath = req.url.slice(basePath.length) || '/';
  const targetUrl = `http://127.0.0.1:${port}${targetPath}`;
  
  console.log(`[preview-server] Proxying to: ${targetUrl}`);
  
  if (targetUrl.startsWith('ws://') || targetUrl.startsWith('wss://')) {
    return res.status(400).send('WebSocket not supported');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value && !['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers[key] = Array.isArray(value) ? value[0] : value;
      }
    }
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      signal: controller.signal,
      redirect: 'follow',
    });
    
    clearTimeout(timeoutId);
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');
    res.removeHeader('content-encoding');
    
    res.set('Content-Security-Policy', 
      "default-src 'none'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; " +
      "style-src 'self' 'unsafe-inline' http://127.0.0.1:*; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*; " +
      "frame-src 'self' http://localhost:* http://127.0.0.1:* https://*; " +
      "worker-src 'self' blob:;"
    );
    
    res.status(response.status);
    
    let body = await response.arrayBuffer();
    
    if (contentType.includes('text/html')) {
      const decoder = new TextDecoder('utf-8');
      let htmlContent = decoder.decode(body);
      
      const baseTag = `<base href="http://127.0.0.1:${port}/" target="_blank">`;
      if (!htmlContent.includes('<base')) {
        htmlContent = htmlContent.replace('<head>', `<head>${baseTag}`);
      }
      
      body = new TextEncoder().encode(htmlContent).buffer as ArrayBuffer;
    }
    
    res.send(Buffer.from(body));
  } catch (error: any) {
    console.error('[preview-server] Error:', error.message);
    if (error.name === 'AbortError') {
      res.status(504).send('Gateway Timeout');
    } else {
      res.status(502).send('Backend server not reachable');
    }
  }
});

app.use('/api/chat', chatRouter);
app.use('/api/files', filesRouter);
app.use('/api/sandbox', sandboxRouter);

setupSocketHandlers(io);
setSocketIO(io);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
