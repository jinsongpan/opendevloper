import React, { useState, useEffect, useRef } from 'react';
import { Globe, RefreshCw, ExternalLink, Code } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Editor from '@monaco-editor/react';

export default function PreviewPanel() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [codeContent, setCodeContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [previewInfo, setPreviewInfo] = useState<{
    reachable: boolean;
    previewType: 'iframe' | 'image' | 'text' | 'download';
    contentType?: string;
    url?: string;
  } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (state.activeFile) {
      loadFileContent(state.activeFile);
    }
  }, [state.activeFile]);

  useEffect(() => {
    if (state.activeFile) {
      setActiveTab('code');
    }
  }, [state.activeFile]);

  useEffect(() => {
    if (state.serverUrl) {
      const port = getServerPort(state.serverUrl);
      fetch(`/api/preview-info/${port}`)
        .then(res => res.json())
        .then(data => setPreviewInfo(data))
        .catch(() => setPreviewInfo({ reachable: false, previewType: 'download' }));
    } else {
      setPreviewInfo(null);
    }
  }, [state.serverUrl]);

  const loadFileContent = async (path: string) => {
    setLoading(true);
    try {
      const url = state.sandboxId 
        ? `/api/files/${path}?sandboxId=${state.sandboxId}`
        : `/api/files/${path}`;
      const response = await fetch(url);
      const data = await response.json();
      setCodeContent(data.content || '');
    } catch (error) {
      console.error('Failed to load file:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServerPort = (url: string): string => {
    const match = url.match(/:(\d+)/);
    return match ? match[1] : '3000';
  };

  const handleRefresh = () => {
    if (iframeRef.current && state.serverUrl) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }
  };

  const handleOpenExternal = () => {
    if (state.serverUrl) {
      window.open(state.serverUrl, '_blank');
    }
  };

  const handleClose = () => {
    dispatch({ type: 'SET_ACTIVE_FILE', payload: null });
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'py': return 'python';
      default: return 'plaintext';
    }
  };

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <div className="preview-tabs">
          <button
            className={`preview-tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Globe size={14} />
            预览
          </button>
          <button
            className={`preview-tab ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <Code size={14} />
            代码
          </button>
        </div>
        <div className="preview-actions">
          {activeTab === 'preview' && state.serverUrl && (
            <>
              <button className="preview-action-btn" onClick={handleRefresh} title="刷新">
                <RefreshCw size={14} />
              </button>
              <button className="preview-action-btn" onClick={handleOpenExternal} title="新标签页打开">
                <ExternalLink size={14} />
              </button>
            </>
          )}
          {activeTab === 'code' && state.activeFile && (
            <button 
              className="preview-action-btn" 
              onClick={() => state.activeFile && loadFileContent(state.activeFile)} 
              title="刷新"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="preview-content">
        {loading ? (
          <div className="preview-loading">
            <RefreshCw size={24} className="spin" />
            加载中...
          </div>
        ) : activeTab === 'preview' ? (
          state.serverUrl ? (
            previewInfo?.reachable === false ? (
              <div className="preview-empty">
                <Globe size={48} className="preview-empty-icon" />
                <span className="preview-empty-text">
                  服务器未运行
                </span>
              </div>
            ) : previewInfo?.previewType === 'image' ? (
              <div className="preview-image">
                <img src={previewInfo.url} alt="Preview" />
              </div>
            ) : previewInfo?.previewType === 'text' ? (
              <div className="preview-text">
                {state.activeFile ? (
                  <Editor
                    height="100%"
                    language={getLanguage(state.activeFile)}
                    value={`// 内容类型: ${previewInfo.contentType}\n// 请在新窗口打开查看完整内容`}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                ) : (
                  <div className="preview-empty">
                    <Code size={48} className="preview-empty-icon" />
                    <span className="preview-empty-text">
                      点击文件查看代码
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={`/api/preview-server/${getServerPort(state.serverUrl)}`}
                className="preview-iframe"
                title="Server Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            )
          ) : (
            <div className="preview-empty">
              <Globe size={48} className="preview-empty-icon" />
              <span className="preview-empty-text">
                暂无预览内容
              </span>
            </div>
          )
        ) : (
          <div className="preview-code">
            {state.activeFile ? (
              <Editor
                height="100%"
                language={getLanguage(state.activeFile)}
                value={codeContent}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            ) : (
              <div className="preview-empty">
                <Code size={48} className="preview-empty-icon" />
                <span className="preview-empty-text">
                  点击文件查看代码
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
