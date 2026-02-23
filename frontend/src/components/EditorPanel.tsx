import React, { useState, useEffect } from 'react';
import { X, FileCode, Save, RefreshCw, ChevronRight } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useApp } from '../context/AppContext';
import { useFiles } from '../hooks/useApi';

interface EditorPanelProps {
  onToggle?: () => void;
}

export default function EditorPanel({ onToggle }: EditorPanelProps) {
  const { state, dispatch } = useApp();
  const { readFile, createFile } = useFiles();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (state.activeFile) {
      loadFileContent(state.activeFile);
    }
  }, [state.activeFile]);

  const loadFileContent = async (path: string) => {
    setLoading(true);
    try {
      const fileContent = await readFile(path);
      setContent(fileContent || '');
    } catch (error) {
      console.error('Failed to load file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    dispatch({ type: 'SET_ACTIVE_FILE', payload: null });
    dispatch({ type: 'REMOVE_OPEN_FILE', payload: state.activeFile || '' });
  };

  const handleSave = async () => {
    if (!state.activeFile) return;
    setIsSaving(true);
    await createFile(state.activeFile, content);
    setIsSaving(false);
  };

  const handleRemoveTab = (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_OPEN_FILE', payload: filePath });
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      default:
        return 'plaintext';
    }
  };

  if (!state.activeFile && state.openFiles.length === 0) {
    return (
      <div className="editor-panel">
        <div className="editor-panel-header">
          <span className="editor-panel-title">编辑器</span>
          {onToggle && (
            <button className="panel-header-btn" onClick={onToggle} title="折叠">
              <ChevronRight size={14} />
            </button>
          )}
        </div>
        <div className="editor-panel-empty">
          <FileCode size={48} className="editor-panel-empty-icon" />
          <span className="editor-panel-empty-text">
            点击文件进行编辑
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-panel">
      <div className="editor-panel-header">
        <div className="editor-panel-tabs">
          {state.openFiles.map((file) => (
            <div
              key={file}
              className={`editor-panel-tab ${file === state.activeFile ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_ACTIVE_FILE', payload: file })}
            >
              <span className="editor-panel-tab-name">{file.split('/').pop()}</span>
              <button
                className="editor-panel-tab-close"
                onClick={(e) => handleRemoveTab(file, e)}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="editor-panel-actions">
          <button
            className="editor-panel-action-btn"
            onClick={handleSave}
            disabled={isSaving || !state.activeFile}
            title="保存"
          >
            <Save size={14} />
          </button>
          <button
            className="editor-panel-action-btn"
            onClick={() => state.activeFile && loadFileContent(state.activeFile)}
            disabled={!state.activeFile}
            title="刷新"
          >
            <RefreshCw size={14} />
          </button>
          <button
            className="editor-panel-action-btn"
            onClick={handleClose}
            title="关闭"
          >
            <X size={14} />
          </button>
          {onToggle && (
            <button className="editor-panel-action-btn" onClick={onToggle} title="折叠">
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="editor-panel-content">
        {loading ? (
          <div className="editor-panel-loading">
            <RefreshCw size={24} className="spin" />
            加载中...
          </div>
        ) : state.activeFile ? (
          <Editor
            height="100%"
            language={getLanguage(state.activeFile)}
            value={content}
            onChange={(value) => setContent(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="editor-panel-empty">
            <FileCode size={48} className="editor-panel-empty-icon" />
            <span>选择文件进行编辑</span>
          </div>
        )}
      </div>
    </div>
  );
}
