import React, { useState, useRef, useEffect } from 'react';
import { Plus, FileCode, Send, Trash2, ChevronDown, ChevronRight, Loader2, Check, X, File, Play, Eye, Lightbulb, Folder, FolderOpen, Square } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSandbox, useChat } from '../hooks/useApi';
import { ThoughtStep, PlanStep, FileNode } from '../types';

interface HistoryItem {
  id: string;
  title: string;
  summary: string;
  createdAt: number;
  messages: any[];
  sandboxId?: string;
  files?: FileNode[];
  serverUrl?: string;
}

function StepItem({ step, isLast }: { step: ThoughtStep; isLast: boolean }) {
  const getIcon = () => {
    switch (step.type) {
      case 'thought': return <Lightbulb size={14} className="step-icon thought" />;
      case 'action': return <Play size={14} className="step-icon action" />;
      case 'observation': return <Eye size={14} className="step-icon observation" />;
      default: return <Play size={14} className="step-icon" />;
    }
  };

  const getClassName = () => {
    return `chat-step ${step.type}`;
  };

  return (
    <div className={getClassName()}>
      <div className="chat-step-header">
        {getIcon()}
        <span className="step-content">{step.content}</span>
      </div>
      {!isLast && <div className="step-connector" />}
    </div>
  );
}

function PlanSummary({ plan }: { plan: any }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  React.useEffect(() => {
    setForceUpdate(v => v + 1);
  }, [plan.id, plan.steps?.length]);

  const completedCount = React.useMemo(() => {
    return plan.steps.filter((s: PlanStep) => s.status === 'completed').length;
  }, [plan.steps, forceUpdate]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 size={12} className="spin" />;
      case 'completed': return <Check size={12} className="text-green-500" />;
      case 'failed': return <X size={12} className="text-red-500" />;
      default: return <div className="step-dot" />;
    }
  };

  const getStepTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CREATE_FILE: '创建文件',
      EDIT_FILE: '编辑文件',
      DELETE_FILE: '删除文件',
      RUN_COMMAND: '运行命令',
      RUN_SERVER: '启动服务器',
      INSTALL_PACKAGE: '安装依赖',
      OPEN_BROWSER: '打开浏览器',
    };
    return labels[type] || type;
  };

  const progress = Math.round((completedCount / plan.steps.length) * 100);

  return (
    <div className="plan-summary">
      <div className="plan-summary-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="plan-summary-title">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>执行计划 ({completedCount}/{plan.steps.length})</span>
        </div>
        <div className="plan-progress-bar">
          <div className="plan-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      {isExpanded && (
        <div className="plan-steps">
          {plan.steps.map((step: PlanStep, index: number) => (
            <div key={step.id} className={`plan-step ${step.status}`}>
              <div className="plan-step-icon">{getStepIcon(step.status)}</div>
              <div className="plan-step-info">
                <span className="plan-step-label">{getStepTypeLabel(step.type)}</span>
                <span className="plan-step-desc">{step.description}</span>
                {step.output && <pre className="plan-step-output">{step.output.slice(-500)}</pre>}
                {step.error && <pre className="plan-step-error">{step.error}</pre>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const { createSandbox, destroySandbox } = useSandbox();
  const { sendMessage, abort } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const handleNewProjectClick = () => {
    setNewProjectName('');
    setIsNewProjectDialogOpen(true);
  };

  const handleConfirmNewProject = async () => {
    const projectName = newProjectName.trim() || '未命名项目';
    setIsNewProjectDialogOpen(false);
    
    const messagesToSave = state.messages.length > 0 ? [...state.messages] : [];
    
    try {
      if (messagesToSave.length > 0) {
        const newHistoryItem: HistoryItem = {
          id: `history-${Date.now()}`,
          title: messagesToSave[0]?.content?.slice(0, 30) || '新项目',
          summary: messagesToSave.length > 1 ? `${messagesToSave.length} 条消息` : '',
          createdAt: Date.now(),
          messages: messagesToSave,
          sandboxId: state.sandboxId || undefined,
          files: state.files.length > 0 ? state.files : undefined,
          serverUrl: state.serverUrl || undefined,
        };
        const newHistory = [newHistoryItem, ...history];
        setHistory(newHistory);
        localStorage.setItem('chat-history', JSON.stringify(newHistory));
      }
      
      await destroySandbox();
      localStorage.removeItem('sandboxId');
      localStorage.removeItem('sandboxCreatedAt');
      const sandboxId = await createSandbox();
      localStorage.setItem('sandboxId', sandboxId);
      localStorage.setItem('sandboxCreatedAt', Date.now().toString());
      
      dispatch({ type: 'SET_MESSAGES', payload: [] });
      dispatch({ type: 'SET_FILES', payload: [] });
      dispatch({ type: 'SET_PLAN', payload: null });
      dispatch({ type: 'SET_SERVER_URL', payload: null });
      dispatch({ type: 'SET_PROJECT_NAME', payload: projectName });
      dispatch({ type: 'SET_SANDBOX_ID', payload: sandboxId });
    } catch (error) {
      console.error('Failed to create new project:', error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleHistoryClick = async (item: HistoryItem) => {
    dispatch({ type: 'SET_MESSAGES', payload: item.messages });
    dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'idle' });
    dispatch({ type: 'SET_PROGRESS', payload: 0 });
    dispatch({ type: 'SET_PLAN', payload: null });
    dispatch({ type: 'TOGGLE_PREVIEW', payload: true });
    dispatch({ type: 'TOGGLE_EDITOR', payload: false });
    
    if (item.sandboxId) {
      try {
        const response = await fetch(`/api/sandbox/files?sandboxId=${item.sandboxId}`);
        if (response.ok) {
          console.log('[History] Restoring sandbox:', item.sandboxId);
          dispatch({ type: 'SET_SANDBOX_ID', payload: item.sandboxId });
          localStorage.setItem('sandboxId', item.sandboxId);
          
          const files = await response.json();
          dispatch({ type: 'SET_FILES', payload: files });
          
          if (item.serverUrl) {
            dispatch({ type: 'SET_SERVER_URL', payload: item.serverUrl });
            localStorage.setItem('serverUrl', item.serverUrl);
          }
          return;
        }
      } catch (e) {
        console.log('[History] Failed to restore sandbox, creating new one');
      }
      localStorage.removeItem('sandboxId');
      localStorage.removeItem('serverUrl');
    }
    
    if (item.files) {
      dispatch({ type: 'SET_FILES', payload: item.files });
    } else {
      dispatch({ type: 'SET_FILES', payload: [] });
    }
    
    if (item.serverUrl) {
      dispatch({ type: 'SET_SERVER_URL', payload: item.serverUrl });
    } else {
      dispatch({ type: 'SET_SERVER_URL', payload: null });
    }
    
    try {
      await destroySandbox();
      
      const sandboxId = await createSandbox();
      localStorage.setItem('sandboxId', sandboxId);
      localStorage.setItem('sandboxCreatedAt', Date.now().toString());
      dispatch({ type: 'SET_SANDBOX_ID', payload: sandboxId });
    } catch (error) {
      console.error('Failed to create new sandbox for history:', error);
    }
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('chat-history', JSON.stringify(newHistory));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-new-project">
        <button className="sidebar-new-project-btn" onClick={handleNewProjectClick}>
          <Plus size={16} />
          新建项目
        </button>
      </div>

      <div className="sidebar-section">
        <div 
          className="sidebar-section-title" 
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          style={{ cursor: 'pointer' }}
        >
          {isHistoryExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          历史会话
        </div>
        {isHistoryExpanded && (
          <div className="sidebar-history">
          {history.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <span className="empty-state-text">暂无历史记录</span>
            </div>
          ) : (
            history.map(item => (
              <div 
                key={item.id} 
                className="history-item"
                onClick={() => handleHistoryClick(item)}
              >
                <FileCode size={16} className="history-item-icon" />
                <div className="history-item-content">
                  <div className="history-item-title">{item.title}</div>
                  <div className="history-item-summary">{item.summary}</div>
                </div>
                <button 
                  className="preview-action-btn" 
                  onClick={(e) => handleDeleteHistory(e, item.id)}
                  title="删除"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
        )}
      </div>

      <div className="sidebar-chat">
        <div className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>当前对话</span>
          <button 
            className="icon-btn" 
            onClick={() => dispatch({ type: 'TOGGLE_FILE_BROWSER' })}
            title={state.isFileBrowserOpen ? "隐藏项目面板" : "显示项目面板"}
          >
            {state.isFileBrowserOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
          </button>
        </div>
        <div className="sidebar-chat-messages">
          {state.messages.map((msg, index) => (
            <div key={index} className={`sidebar-chat-message ${msg.role} ${msg.status || ''}`}>
              <div className="sidebar-chat-message-content">
                {msg.plan && <PlanSummary key={msg.plan.id} plan={msg.plan} />}
                {msg.thoughtSteps && msg.thoughtSteps.length > 0 && (
                  <div className="thought-steps">
                    {msg.thoughtSteps.map((step, i) => (
                      <StepItem key={step.id || i} step={step} isLast={i === msg.thoughtSteps!.length - 1} />
                    ))}
                  </div>
                )}
                {msg.status === 'thinking' && (
                  <div className="message-status">
                    <Loader2 size={14} className="spin" />
                    <span>AI 思考中...</span>
                  </div>
                )}
                {msg.status === 'planning' && (
                  <div className="message-status">
                    <Loader2 size={14} className="spin" />
                    <span>生成计划中...</span>
                  </div>
                )}
                {msg.status === 'executing' && (
                  <div className="message-status">
                    <Loader2 size={14} className="spin" />
                    <span>执行中...</span>
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="sidebar-chat-input">
          <div className="sidebar-chat-input-wrapper">
            <textarea
              className="sidebar-chat-textarea"
              placeholder="描述你想要构建的项目..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button 
              className="sidebar-chat-send"
              onClick={() => {
                if (state.executionStatus === 'executing' || state.executionStatus === 'planning') {
                  abort();
                } else {
                  handleSend();
                }
              }}
              disabled={!inputValue.trim() && state.executionStatus !== 'executing' && state.executionStatus !== 'planning'}
              title={state.executionStatus === 'executing' || state.executionStatus === 'planning' ? '停止' : '发送'}
            >
              {state.executionStatus === 'executing' || state.executionStatus === 'planning' ? <Square size={14} /> : <Send size={14} />}
            </button>
          </div>
        </div>
      </div>

      {isNewProjectDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsNewProjectDialogOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>新建项目</h3>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="modal-input"
                placeholder="请输入项目名称"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConfirmNewProject()}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setIsNewProjectDialogOpen(false)}>
                取消
              </button>
              <button className="modal-btn confirm" onClick={handleConfirmNewProject}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
