import React, { useEffect, useState } from 'react';
import { Folder, FileCode, FileJson, FileText, ChevronRight, ChevronDown, Plus, RefreshCw, Download, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFiles } from '../hooks/useApi';
import { FileNode } from '../types';

interface FileBrowserProps {
  onToggle?: () => void;
  isCollapsed?: boolean;
}

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode size={16} className="file-icon" color="#f7df1e" />;
    case 'json':
      return <FileJson size={16} className="file-icon" color="#cbcb41" />;
    case 'md':
    case 'txt':
      return <FileText size={16} className="file-icon" color="#42a5f5" />;
    default:
      return <FileText size={16} className="file-icon" color="#8b949e" />;
  }
};

function FileTreeItem({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { dispatch } = useApp();
  const { readFile } = useFiles();

  const handleClick = async () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    } else {
      dispatch({ type: 'ADD_OPEN_FILE', payload: node.path });
      dispatch({ type: 'SET_ACTIVE_FILE', payload: node.path });
    }
  };

  return (
    <div>
      <div
        className="file-item"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'directory' ? (
          <>
            {isExpanded ? (
              <ChevronDown size={14} color="#8b949e" />
            ) : (
              <ChevronRight size={14} color="#8b949e" />
            )}
            <Folder size={16} className="file-icon" color="#d29922" />
          </>
        ) : (
          <>
            <span style={{ width: 14 }} />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="file-name">{node.name}</span>
      </div>
      {node.type === 'directory' && isExpanded && node.children && (
        <div className="folder-children">
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileBrowser({ onToggle }: FileBrowserProps) {
  const { state, dispatch } = useApp();
  const { files, fetchFiles } = useFiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    console.log('[FileBrowser] executionStatus:', state.executionStatus);
    if (state.sandboxId) {
      fetchFiles();
    }
  }, [fetchFiles, state.sandboxId]);

  useEffect(() => {
    console.log('[FileBrowser] Files loaded:', files.length);
  }, [files]);

  useEffect(() => {
    console.log('[FileBrowser] Status changed to:', state.executionStatus);
    if (state.sandboxId && (state.executionStatus === 'completed' || state.executionStatus === 'failed')) {
      console.log('[FileBrowser] Refreshing files after execution...');
      setTimeout(() => {
        fetchFiles();
      }, 500);
    }
  }, [state.executionStatus, fetchFiles, state.sandboxId]);

  const safeFiles = Array.isArray(files) ? files : [];
  
  const filteredFiles = searchQuery
    ? safeFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : safeFiles;

  const handleDownload = async () => {
    if (safeFiles.length === 0) return;
    setIsDownloading(true);
    try {
      const url = state.sandboxId 
        ? `/api/files/download?sandboxId=${state.sandboxId}`
        : '/api/files/download';
      const response = await fetch(url, {
        method: 'POST',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'project.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <aside className="file-browser">
      <div className="file-browser-header">
        <span className="file-browser-title">{state.projectName}</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className="icon-btn" 
            onClick={handleDownload} 
            title={files.length > 0 ? "下载项目" : "暂无文件可下载"}
            disabled={files.length === 0 || isDownloading}
          >
            <Download size={16} />
          </button>
          <button className="icon-btn" onClick={() => fetchFiles()} title="刷新">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="file-search">
        <input
          type="text"
          className="file-search-input"
          placeholder="搜索文件..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="file-tree">
        {filteredFiles.length === 0 ? (
          <div className="empty-state">
            <Folder size={32} className="empty-state-icon" />
            <span className="empty-state-text">暂无文件</span>
          </div>
        ) : (
          filteredFiles.map((node) => (
            <FileTreeItem key={node.path} node={node} />
          ))
        )}
      </div>
    </aside>
  );
}
