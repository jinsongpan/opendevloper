import { Server, Socket } from 'socket.io';
import { ProgressUpdate, FileNode } from '../types.js';
import { sandboxService, currentSandboxId } from '../routes/sandbox.js';

const sandboxClients: Map<string, Set<string>> = new Map();

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-sandbox', (sandboxId: string) => {
      socket.join(`sandbox-${sandboxId}`);
      
      if (!sandboxClients.has(sandboxId)) {
        sandboxClients.set(sandboxId, new Set());
      }
      sandboxClients.get(sandboxId)!.add(socket.id);
      
      console.log(`Socket ${socket.id} joined sandbox ${sandboxId}. Active clients: ${sandboxClients.get(sandboxId)!.size}`);
    });

    socket.on('leave-sandbox', (sandboxId: string) => {
      socket.leave(`sandbox-${sandboxId}`);
      sandboxClients.get(sandboxId)?.delete(socket.id);
    });

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      
      for (const [sandboxId, clients] of sandboxClients.entries()) {
        if (clients.has(socket.id)) {
          clients.delete(socket.id);
          console.log(`Client ${socket.id} left sandbox ${sandboxId}. Remaining: ${clients.size}`);
          
          if (clients.size === 0) {
            console.log(`No more clients for sandbox ${sandboxId}, keeping sandbox for later`);
          }
        }
      }
    });
  });
}

export function emitProgress(io: Server, sandboxId: string, update: ProgressUpdate): void {
  io.to(`sandbox-${sandboxId}`).emit('progress', update);
}

export function emitLog(io: Server, sandboxId: string, log: { stepId: string; message: string }): void {
  io.to(`sandbox-${sandboxId}`).emit('log', log);
}

export interface CompleteResult {
  success: boolean;
  message: string;
  files?: FileNode[];
  serverUrl?: string;
}

export function emitComplete(io: Server, sandboxId: string, result: CompleteResult): void {
  io.to(`sandbox-${sandboxId}`).emit('complete', result);
}

export function emitServerStarted(io: Server, sandboxId: string, data: { url: string; port: number }): void {
  io.to(`sandbox-${sandboxId}`).emit('server-started', data);
}
