import { Router } from 'express';
import { sandboxService, currentSandboxId } from './sandbox.js';
import archiver from 'archiver';

const router = Router();

function sanitizePath(filePath: string): string {
  if (filePath.includes('..') || filePath.startsWith('/') || filePath.startsWith('\\')) {
    throw new Error('Invalid path: path traversal not allowed');
  }
  return filePath;
}

router.get('/', async (req, res) => {
  try {
    const sandboxId = req.query.sandboxId as string || currentSandboxId;
    if (!sandboxService || !sandboxId) {
      return res.json([]);
    }
    const dir = req.query.dir as string || '';
    const files = await sandboxService.listFiles(sandboxId, dir);
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:path(*)', async (req, res) => {
  try {
    const sandboxId = req.query.sandboxId as string || currentSandboxId;
    if (!sandboxService || !sandboxId) {
      return res.status(500).json({ error: 'Sandbox not initialized' });
    }
    const filePath = sanitizePath(req.params.path);
    const content = await sandboxService.readFile(sandboxId, filePath);
    res.json({ path: filePath, content });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const sandboxId = req.query.sandboxId as string || currentSandboxId;
    if (!sandboxService || !sandboxId) {
      return res.status(500).json({ error: 'Sandbox not initialized' });
    }
    const { path: filePath, content } = req.body;
    const sanitizedPath = sanitizePath(filePath);
    await sandboxService.createFile(sandboxId, sanitizedPath, content);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:path(*)', async (req, res) => {
  try {
    const sandboxId = req.query.sandboxId as string || currentSandboxId;
    if (!sandboxService || !sandboxId) {
      return res.status(500).json({ error: 'Sandbox not initialized' });
    }
    const filePath = sanitizePath(req.params.path);
    await sandboxService.deleteFile(sandboxId, filePath);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/download', async (req, res) => {
  try {
    if (!sandboxService || !currentSandboxId) {
      return res.status(500).json({ error: 'Sandbox not initialized' });
    }

    const sandboxId = currentSandboxId;
    const files = await sandboxService.listFiles(sandboxId, '');
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=project.zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    const addFiles = async (items: any[], basePath: string = '') => {
      for (const item of items) {
        const fullPath = basePath ? `${basePath}/${item.name}` : item.name;
        if (item.type === 'directory' && item.children) {
          await addFiles(item.children, fullPath);
        } else if (item.type === 'file') {
          try {
            const content = await sandboxService.readFile(sandboxId, fullPath);
            archive.append(content, { name: fullPath });
          } catch (e) {
            console.error(`Failed to read file ${fullPath}:`, e);
          }
        }
      }
    };

    await addFiles(files);
    await archive.finalize();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as filesRouter };
