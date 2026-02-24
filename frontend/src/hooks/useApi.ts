import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useApp } from '../context/AppContext';
import { Settings, ExecutionPlan, ProgressUpdate, FileNode } from '../types';

const API_BASE = '/api';
const currentMessageIdRef = { current: null as string | null };

const stepTypeLabels: Record<string, string> = {
  CREATE_FILE: '创建文件',
  EDIT_FILE: '编辑文件',
  DELETE_FILE: '删除文件',
  RUN_COMMAND: '运行命令',
  RUN_SERVER: '启动服务器',
  INSTALL_PACKAGE: '安装依赖',
  OPEN_BROWSER: '打开浏览器',
};

let sharedAbortController: AbortController | null = null;

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 300000, abortController?: AbortController): Promise<Response> => {
  const controller = abortController || new AbortController();
  if (!abortController) {
    sharedAbortController = controller;
  }
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    throw error;
  } finally {
    clearTimeout(id);
    if (!abortController) {
      sharedAbortController = null;
    }
  }
};

export const abortCurrentRequest = () => {
  if (sharedAbortController) {
    sharedAbortController.abort();
    sharedAbortController = null;
    return true;
  }
  return false;
};

export function useChat() {
  const { state, dispatch } = useApp();
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    currentMessageIdRef.current = null;
    abortControllerRef.current = new AbortController();
    
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: message,
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    const assistantMessageId = `msg-${Date.now() + 1}`;
    currentMessageIdRef.current = assistantMessageId;
    const thinkingMessage = {
      id: assistantMessageId,
      role: 'assistant' as const,
      content: '',
      timestamp: Date.now() + 1,
      status: 'thinking' as const,
      thoughtSteps: [],
    };
    dispatch({ type: 'ADD_MESSAGE', payload: thinkingMessage });

    dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'planning' });

    const hasExistingFiles = state.sandboxId && state.files && state.files.length > 0;
    const isModification = state.messages.length > 0 || hasExistingFiles;

    const history = state.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await fetchWithTimeout(`${API_BASE}/sandbox/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements: message,
          settings: state.settings,
          provider: state.model,
          isModification,
          history,
          sandboxId: state.sandboxId,
        }),
      }, 300000, abortControllerRef.current);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate plan' }));
        throw new Error(errorData.error || 'Failed to generate plan');
      }

      const plan = await response.json();

      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          id: assistantMessageId,
          updates: {
            status: 'planning',
            plan: plan,
            content: `正在分析需求并生成执行计划...`,
            thoughtSteps: [{
              id: 'thought-1',
              type: 'thought' as const,
              content: `分析需求: ${message.slice(0, 50)}${message.length > 50 ? '...' : ''}`,
              timestamp: Date.now()
            }]
          },
        },
      });

      dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'executing' });

      const execResponse = await fetchWithTimeout(`${API_BASE}/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, sandboxId: state.sandboxId }),
      }, 300000, abortControllerRef.current);

      const execResult = await execResponse.json();
      console.log('[useChat] Execute result:', execResult);

      if (execResult.success) {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            id: assistantMessageId,
            updates: {
              status: 'completed',
              content: '✅ 项目已创建完成！\n\n您可以在右侧文件浏览器中查看生成的文件，或继续描述新的需求。',
            },
          },
        });
        dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'completed' });
        
        const filesUrl = state.sandboxId 
          ? `${API_BASE}/sandbox/files?sandboxId=${state.sandboxId}`
          : `${API_BASE}/sandbox/files`;
        const filesRes = await fetchWithTimeout(filesUrl);
        const data = await filesRes.json();
        const files = Array.isArray(data) ? data : (data.files || []);
        dispatch({ type: 'SET_FILES', payload: files });
        
        if (execResult.serverUrl) {
          dispatch({ type: 'SET_SERVER_URL', payload: execResult.serverUrl });
        }
      } else {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            id: assistantMessageId,
            updates: {
              status: 'failed',
              content: `执行失败: ${execResult.error || '未知错误'}`,
            },
          },
        });
        dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'failed' });
      }

    } catch (error: any) {
      if (error.name === 'AbortError' || error.message === 'The user aborted a request.') {
        console.log('Request aborted by user');
        dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'idle' });
        return;
      }
      console.error('Chat error:', error);
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          id: assistantMessageId,
          updates: {
            status: 'failed',
            content: `抱歉，发生错误: ${error.message}`,
          },
        },
      });
      dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'failed' });
    }
  }, [state.settings, state.model, state.sandboxId, dispatch]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'idle' });
      return true;
    }
    return false;
  }, [dispatch]);

  return { sendMessage, abort, messages: state.messages };
}

export function usePlan() {
  const { state, dispatch } = useApp();

  const generatePlan = useCallback(async (requirements: string) => {
    dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'planning' });

    try {
      const response = await fetch(`${API_BASE}/sandbox/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements,
          settings: state.settings,
          provider: state.model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate plan' }));
        throw new Error(errorData.error || 'Failed to generate plan');
      }

      const plan: ExecutionPlan = await response.json();
      dispatch({ type: 'SET_PLAN', payload: plan });
      dispatch({ type: 'TOGGLE_PLAN_MODAL', payload: true });
      dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'idle' });
      return plan;
    } catch (error: any) {
      dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'idle' });
      const errorMessage = error.message || '生成计划失败';
      if (errorMessage.includes('clipboard') || errorMessage.includes('image') || errorMessage.includes('vision')) {
        throw new Error('当前模型不支持图像输入，请检查模型配置或更换支持视觉的模型');
      }
      if (errorMessage.includes('api key') || errorMessage.includes('API key') || errorMessage.includes('unauthorized')) {
        throw new Error('API Key 无效或未配置，请检查设置中的 API Key');
      }
      throw error;
    }
  }, [state.settings, dispatch]);

  const executePlan = useCallback(async (plan: ExecutionPlan) => {
    dispatch({ type: 'TOGGLE_PLAN_MODAL', payload: false });
    dispatch({ type: 'TOGGLE_PROGRESS', payload: true });
    dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'executing' });

    plan.steps.forEach(step => {
      dispatch({ type: 'UPDATE_STEP_STATUS', payload: { stepId: step.id, status: 'pending' } });
    });

    try {
      const response = await fetch(`${API_BASE}/sandbox/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, sandboxId: state.sandboxId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Execute failed');
      }
    } catch (error: any) {
      console.error('Execute plan error:', error);
      dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'failed' });
    }
  }, [dispatch, state.sandboxId]);

  return { generatePlan, executePlan, currentPlan: state.currentPlan };
}

export function useFiles() {
  const { state, dispatch } = useApp();

  const fetchFiles = useCallback(async (dir: string = '') => {
    try {
      const url = state.sandboxId 
        ? `${API_BASE}/sandbox/files?sandboxId=${state.sandboxId}&dir=${encodeURIComponent(dir)}`
        : `${API_BASE}/sandbox/files?dir=${encodeURIComponent(dir)}`;
      const response = await fetchWithTimeout(url);
      const data = await response.json();
      const files: FileNode[] = Array.isArray(data) ? data : (data.files || []);
      
      if (dir === '') {
        dispatch({ type: 'SET_FILES', payload: files });
      }
      
      return files;
    } catch (error) {
      console.error('Failed to fetch files:', error);
      return [];
    }
  }, [dispatch, state.sandboxId]);

  const readFile = useCallback(async (path: string) => {
    try {
      const url = state.sandboxId 
        ? `${API_BASE}/files/${path}?sandboxId=${state.sandboxId}`
        : `${API_BASE}/files/${path}`;
      const response = await fetchWithTimeout(url);
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  }, [state.sandboxId]);

  const createFile = useCallback(async (path: string, content: string) => {
    try {
      const url = state.sandboxId 
        ? `${API_BASE}/files?sandboxId=${state.sandboxId}`
        : `${API_BASE}/files`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content }),
      });
      await fetchFiles();
    } catch (error) {
      console.error('Failed to create file:', error);
    }
  }, [fetchFiles, state.sandboxId]);

  const deleteFile = useCallback(async (path: string) => {
    try {
      const url = state.sandboxId 
        ? `${API_BASE}/files/${path}?sandboxId=${state.sandboxId}`
        : `${API_BASE}/files/${path}`;
      await fetch(url, {
        method: 'DELETE',
      });
      await fetchFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }, [fetchFiles, state.sandboxId]);

  return { files: state.files, fetchFiles, readFile, createFile, deleteFile };
}

export function useSocket() {
  const { state, dispatch } = useApp();
  const socketRef = useRef<Socket | null>(null);
  const stateRef = useRef(state);
  const thoughtStepCounter = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (socketRef.current?.connected && state.sandboxId) {
      socketRef.current.emit('join-sandbox', state.sandboxId);
      console.log('[Socket] Joined sandbox room:', state.sandboxId);
    }
  }, [state.sandboxId]);

  useEffect(() => {
    const socketUrl = window.location.origin;
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current?.id);
      const currentSandboxId = stateRef.current.sandboxId;
      if (currentSandboxId) {
        socketRef.current?.emit('join-sandbox', currentSandboxId);
        console.log('[Socket] Joined sandbox room:', currentSandboxId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketRef.current.on('reconnect', (attemptNumber: number) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      const currentSandboxId = stateRef.current.sandboxId;
      if (currentSandboxId) {
        socketRef.current?.emit('join-sandbox', currentSandboxId);
        console.log('[Socket] Re-joined sandbox room:', currentSandboxId);
      }
    });

    socketRef.current.on('reconnect_attempt', (attemptNumber: number) => {
      console.log('Socket reconnection attempt:', attemptNumber);
    });

    socketRef.current.on('reconnect_error', (error: Error) => {
      console.error('Socket reconnection error:', error);
    });

    socketRef.current.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });

    socketRef.current.on('progress', (update: ProgressUpdate) => {
      dispatch({ type: 'SET_PROGRESS', payload: update.progress });
      dispatch({ 
        type: 'UPDATE_STEP_STATUS', 
        payload: { stepId: update.stepId, status: update.status } 
      });

      const currentState = stateRef.current;
      const currentMsgId = currentMessageIdRef.current;
      const activeMessage = currentMsgId 
        ? currentState.messages.find(m => m.id === currentMsgId)
        : currentState.messages.find(m => m.plan);
      
      if (activeMessage?.plan) {
        const currentStep = activeMessage.plan.steps.find(s => s.id === update.stepId);
        
        const updatedSteps = activeMessage.plan.steps.map(step => {
          if (step.id === update.stepId) {
            return { 
              ...step, 
              status: update.status as 'pending' | 'running' | 'completed' | 'failed',
              output: update.output,
              error: update.error
            };
          }
          return step;
        });

        const newThoughtSteps = [...(activeMessage.thoughtSteps || [])];
        
        if (update.status === 'running') {
          thoughtStepCounter.current += 1;
          newThoughtSteps.push({
            id: `exec-action-${thoughtStepCounter.current}`,
            type: 'action' as const,
            content: `${stepTypeLabels[currentStep?.type || 'RUN_COMMAND']}: ${currentStep?.description || update.stepId}`,
            timestamp: Date.now()
          });
        } else if (update.status === 'completed') {
          thoughtStepCounter.current += 1;
          newThoughtSteps.push({
            id: `exec-obs-${thoughtStepCounter.current}`,
            type: 'observation' as const,
            content: `完成: ${currentStep?.description || update.stepId}`,
            timestamp: Date.now()
          });
        } else if (update.status === 'failed') {
          thoughtStepCounter.current += 1;
          newThoughtSteps.push({
            id: `exec-error-${thoughtStepCounter.current}`,
            type: 'observation' as const,
            content: `失败: ${update.error || currentStep?.description || update.stepId}`,
            timestamp: Date.now()
          });
        }

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            id: activeMessage.id,
            updates: {
              plan: { ...activeMessage.plan, steps: updatedSteps },
              thoughtSteps: newThoughtSteps
            }
          }
        });
      }
    });

    socketRef.current.on('log', (log: { stepId: string; message: string }) => {
      const currentState = stateRef.current;
      const currentMsgId = currentMessageIdRef.current;
      const activeMessage = currentMsgId 
        ? currentState.messages.find(m => m.id === currentMsgId)
        : currentState.messages.find(m => m.plan);
      if (activeMessage?.plan) {
        const updatedSteps = activeMessage.plan.steps.map(step => {
          if (step.id === log.stepId) {
            return { ...step, output: (step.output || '') + '\n' + log.message };
          }
          return step;
        });

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            id: activeMessage.id,
            updates: {
              plan: { ...activeMessage.plan, steps: updatedSteps }
            }
          }
        });
      }
    });

    socketRef.current.on('complete', (result: { success: boolean; message: string; files?: FileNode[]; serverUrl?: string }) => {
      const currentState = stateRef.current;
      const currentMsgId = currentMessageIdRef.current;
      const activeMessage = currentMsgId 
        ? currentState.messages.find(m => m.id === currentMsgId)
        : currentState.messages.find(m => m.plan);
      
      if (result.serverUrl) {
        dispatch({ type: 'SET_SERVER_URL', payload: result.serverUrl });
      }
      
      if (activeMessage?.plan) {
        const completedCount = activeMessage.plan.steps.filter(s => s.status === 'completed').length;
        const totalSteps = activeMessage.plan.steps.length;
        
        const updatedSteps = activeMessage.plan.steps.map(step => ({
          ...step,
          status: 'completed' as const,
        }));
        
        if (result.success) {
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              id: activeMessage.id,
              updates: {
                status: 'completed',
                progress: 100,
                plan: { ...activeMessage.plan, steps: updatedSteps },
                content: '✅ 项目已创建完成！\n\n您可以在右侧文件浏览器中查看生成的文件，或继续描述新的需求。',
              },
            },
          });
        } else {
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              id: activeMessage.id,
              updates: {
                status: 'failed',
                plan: { ...activeMessage.plan, steps: updatedSteps },
                content: `执行失败: ${result.message}`,
              },
            },
          });
        }
      }
      
      if (result.success) {
        dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'completed' });
        if (result.files && result.files.length > 0) {
          dispatch({ type: 'SET_FILES', payload: result.files });
        } else {
          const filesUrl = state.sandboxId 
            ? `${API_BASE}/sandbox/files?sandboxId=${state.sandboxId}`
            : `${API_BASE}/sandbox/files`;
          fetch(filesUrl)
            .then(res => res.json())
            .then((data) => {
              const files = Array.isArray(data) ? data : (data.files || []);
              dispatch({ type: 'SET_FILES', payload: files });
            })
            .catch(error => {
              console.error('Failed to refresh files:', error);
            });
        }
      } else {
        dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'failed' });
      }
    });

    socketRef.current.on('server-started', (data: { url: string; port: number }) => {
      dispatch({ type: 'SET_SERVER_URL', payload: data.url });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [dispatch]);

  return socketRef.current;
}

export function useSandbox() {
  const createSandbox = useCallback(async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE}/sandbox/create`, {
        method: 'POST',
      });
      const data = await response.json();
      return data.sandboxId;
    } catch (error) {
      console.error('Failed to create sandbox:', error);
      return null;
    }
  }, []);

  const destroySandbox = useCallback(async () => {
    try {
      await fetchWithTimeout(`${API_BASE}/sandbox/destroy`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to destroy sandbox:', error);
    }
  }, []);

  const runCommand = useCallback(async (command: string) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE}/sandbox/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to run command:', error);
      return { output: '', exitCode: 1 };
    }
  }, []);

  return { createSandbox, destroySandbox, runCommand };
}
