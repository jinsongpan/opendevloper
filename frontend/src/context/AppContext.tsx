import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { Message, PlanStep, ExecutionPlan, FileNode, Settings, AppView } from '../types';

interface AppState {
  messages: Message[];
  currentPlan: ExecutionPlan | null;
  executionStatus: 'idle' | 'planning' | 'executing' | 'completed' | 'failed';
  progress: number;
  stepStatuses: Record<string, 'pending' | 'running' | 'completed' | 'failed'>;
  files: FileNode[];
  openFiles: string[];
  activeFile: string | null;
  settings: Settings;
  model: string;
  view: AppView;
  isSettingsOpen: boolean;
  isPlanModalOpen: boolean;
  isProgressOpen: boolean;
  isEditorOpen: boolean;
  isPreviewOpen: boolean;
  isFileBrowserOpen: boolean;
  serverUrl: string | null;
  projectName: string;
  sandboxId: string | null;
  error: string | null;
}

type Action =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_PLAN'; payload: ExecutionPlan | null }
  | { type: 'SET_EXECUTION_STATUS'; payload: AppState['executionStatus'] }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'UPDATE_STEP_STATUS'; payload: { stepId: string; status: 'pending' | 'running' | 'completed' | 'failed' } }
  | { type: 'SET_FILES'; payload: FileNode[] }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_VIEW'; payload: AppView }
  | { type: 'TOGGLE_SETTINGS'; payload?: boolean }
  | { type: 'TOGGLE_PLAN_MODAL'; payload?: boolean }
  | { type: 'TOGGLE_PROGRESS'; payload?: boolean }
  | { type: 'TOGGLE_EDITOR'; payload?: boolean }
  | { type: 'TOGGLE_PREVIEW'; payload?: boolean }
  | { type: 'TOGGLE_FILE_BROWSER'; payload?: boolean }
  | { type: 'SET_ACTIVE_FILE'; payload: string | null }
  | { type: 'ADD_OPEN_FILE'; payload: string }
  | { type: 'REMOVE_OPEN_FILE'; payload: string }
  | { type: 'SET_SERVER_URL'; payload: string | null }
  | { type: 'SET_PROJECT_NAME'; payload: string }
  | { type: 'SET_SANDBOX_ID'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null };

const initialSettings: Settings = {
  anthropic: {
    apiKey: '',
    model: 'claude-3-5-sonnet-20241022',
  },
  openai: {
    apiKey: '',
    model: 'gpt-4o',
  },
  openrouter: {
    apiKey: '',
    model: 'z-ai/glm-4.5-air:free',
  },
};

const initialState: AppState = {
  messages: [],
  currentPlan: null,
  executionStatus: 'idle',
  progress: 0,
  stepStatuses: {},
  files: [],
  openFiles: [],
  activeFile: null,
  settings: initialSettings,
  model: 'openrouter',
  view: 'chat',
  isSettingsOpen: false,
  isPlanModalOpen: false,
  isProgressOpen: false,
  isEditorOpen: false,
  isPreviewOpen: true,
  isFileBrowserOpen: true,
  serverUrl: null,
  projectName: '未命名项目',
  sandboxId: null,
  error: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
      };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_PLAN':
      return { ...state, currentPlan: action.payload };
    case 'SET_EXECUTION_STATUS':
      return { ...state, executionStatus: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'UPDATE_STEP_STATUS':
      return {
        ...state,
        stepStatuses: {
          ...state.stepStatuses,
          [action.payload.stepId]: action.payload.status,
        },
      };
    case 'SET_FILES':
      return { ...state, files: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_MODEL':
      return { ...state, model: action.payload };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, isSettingsOpen: action.payload ?? !state.isSettingsOpen };
    case 'TOGGLE_PLAN_MODAL':
      return { ...state, isPlanModalOpen: action.payload ?? !state.isPlanModalOpen };
    case 'TOGGLE_PROGRESS':
      return { ...state, isProgressOpen: action.payload ?? !state.isProgressOpen };
    case 'TOGGLE_EDITOR':
      return { ...state, isEditorOpen: action.payload ?? !state.isEditorOpen };
    case 'TOGGLE_PREVIEW':
      return { ...state, isPreviewOpen: action.payload ?? !state.isPreviewOpen };
    case 'TOGGLE_FILE_BROWSER':
      return { ...state, isFileBrowserOpen: action.payload ?? !state.isFileBrowserOpen };
    case 'SET_ACTIVE_FILE':
      return { ...state, activeFile: action.payload };
    case 'ADD_OPEN_FILE':
      if (state.openFiles.includes(action.payload)) return state;
      return { ...state, openFiles: [...state.openFiles, action.payload] };
    case 'REMOVE_OPEN_FILE':
      return {
        ...state,
        openFiles: state.openFiles.filter(f => f !== action.payload),
        activeFile: state.activeFile === action.payload ? null : state.activeFile,
      };
    case 'SET_SERVER_URL':
      return { ...state, serverUrl: action.payload };
    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.payload };
    case 'SET_SANDBOX_ID':
      return { ...state, sandboxId: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    const savedModel = localStorage.getItem('model');
    const savedSession = localStorage.getItem('currentSession');
    const savedProjectName = localStorage.getItem('projectName');
    
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        if (parsedSession.length > 0) {
          dispatch({ type: 'SET_MESSAGES', payload: parsedSession });
        }
      } catch (e) {
        console.error('Failed to parse saved session:', e);
      }
    }
    
    if (savedProjectName) {
      dispatch({ type: 'SET_PROJECT_NAME', payload: savedProjectName });
    }
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        dispatch({ type: 'SET_SETTINGS', payload: parsedSettings });
        if (savedModel) {
          dispatch({ type: 'SET_MODEL', payload: savedModel });
        }
        setIsInitialized(true);
        return;
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    
    fetch('/api/config')
      .then(res => res.json())
      .then(config => {
        const hasProviders = config.anthropic?.apiKey || config.openai?.apiKey || config.openrouter?.apiKey;
        
        if (hasProviders) {
          const mergedSettings = {
            anthropic: { ...config.anthropic, model: config.anthropic?.model || 'claude-sonnet-4.6' },
            openai: { ...config.openai, model: config.openai?.model || 'gpt-5.2-codex' },
            openrouter: { ...config.openrouter, model: config.openrouter?.model || 'z-ai/glm-4.5-air:free' },
          };
          
          dispatch({ type: 'SET_SETTINGS', payload: mergedSettings });
          
          if (config.anthropic?.apiKey) {
            dispatch({ type: 'SET_MODEL', payload: 'anthropic' });
          } else if (config.openai?.apiKey) {
            dispatch({ type: 'SET_MODEL', payload: 'openai' });
          } else if (config.openrouter?.apiKey) {
            dispatch({ type: 'SET_MODEL', payload: 'openrouter' });
          }
        }
      })
      .catch(err => console.error('Failed to load config:', err))
      .finally(() => {
        setIsInitialized(true);
      });
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    const SANDBOX_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
    
    const initSandbox = async () => {
      const savedSandboxId = localStorage.getItem('sandboxId');
      const savedSandboxCreatedAt = localStorage.getItem('sandboxCreatedAt');
      const savedServerUrl = localStorage.getItem('serverUrl');
      
      const isExpired = savedSandboxCreatedAt && (Date.now() - parseInt(savedSandboxCreatedAt)) > SANDBOX_EXPIRY_MS;
      
      if (savedSandboxId && !isExpired) {
        try {
          const response = await fetch(`/api/sandbox/files?sandboxId=${savedSandboxId}`);
          if (response.ok) {
            console.log('[AppProvider] Restoring sandbox:', savedSandboxId);
            dispatch({ type: 'SET_SANDBOX_ID', payload: savedSandboxId });
            
            const data = await response.json();
            dispatch({ type: 'SET_FILES', payload: data.files || [] });
            
            const serverUrl = savedServerUrl || data.serverUrl;
            if (serverUrl) {
              dispatch({ type: 'SET_SERVER_URL', payload: serverUrl });
            }
            
            return;
          }
          console.log('[AppProvider] Sandbox not found (status:', response.status, '), keeping for retry');
        } catch (e) {
          console.log('[AppProvider] Sandbox validation failed, keeping for retry:', e);
        }
      } else if (isExpired) {
        console.log('[AppProvider] Sandbox expired (24h), creating new one');
        localStorage.removeItem('sandboxId');
        localStorage.removeItem('sandboxCreatedAt');
        localStorage.removeItem('serverUrl');
        localStorage.removeItem('currentSession');
        localStorage.removeItem('projectName');
      }
      
      try {
        const response = await fetch('/api/sandbox/create', {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error(`Sandbox creation failed: ${response.status}`);
        }
        const data = await response.json();
        console.log('[AppProvider] Sandbox created:', data.sandboxId);
        localStorage.setItem('sandboxId', data.sandboxId);
        localStorage.setItem('sandboxCreatedAt', Date.now().toString());
        dispatch({ type: 'SET_SANDBOX_ID', payload: data.sandboxId });
      } catch (error: any) {
        console.error('[AppProvider] Failed to create sandbox:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message || '沙箱创建失败，请刷新页面重试' });
      }
    };
    
    initSandbox();
  }, [isInitialized]);
  
  useEffect(() => {
    if (state.serverUrl) {
      localStorage.setItem('serverUrl', state.serverUrl);
    } else {
      localStorage.removeItem('serverUrl');
    }
  }, [state.serverUrl]);
  
  useEffect(() => {
    if (state.messages.length > 0) {
      localStorage.setItem('currentSession', JSON.stringify(state.messages));
    } else {
      localStorage.removeItem('currentSession');
    }
  }, [state.messages]);
  
  useEffect(() => {
    if (state.projectName) {
      localStorage.setItem('projectName', state.projectName);
    }
  }, [state.projectName]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
