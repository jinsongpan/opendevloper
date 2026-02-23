import React, { useState, useRef, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileBrowser from './components/FileBrowser';
import PreviewPanel from './components/PreviewPanel';
import EditorPanel from './components/EditorPanel';
import SettingsModal from './components/SettingsModal';
import PlanModal from './components/PlanModal';
import ProgressPanel from './components/ProgressPanel';
import { useSocket } from './hooks/useApi';

function AppContent() {
  const { state, dispatch } = useApp();
  useSocket();
  const [splitRatio, setSplitRatio] = useState(0.4);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFileBrowser = () => {
    dispatch({ type: 'TOGGLE_FILE_BROWSER' });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newRatio = (e.clientX - containerRect.left) / containerRect.width;
      setSplitRatio(Math.max(0.2, Math.min(0.8, newRatio)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="app">
      <Header />
      <div className="main-content" ref={containerRef}>
        <div style={{ width: `${splitRatio * 100}%`, flexShrink: 0, display: 'flex' }}>
          <Sidebar />
          {state.isFileBrowserOpen && (
            <>
              <div className="panel-divider" />
              <FileBrowser onToggle={toggleFileBrowser} isCollapsed={false} />
            </>
          )}
        </div>
        
        {state.isPreviewOpen && (
          <>
            <div 
              className="panel-resizer"
              onMouseDown={() => setIsResizing(true)}
            />
            <div style={{ width: `${(1 - splitRatio) * 100}%`, flexShrink: 0 }}>
              <PreviewPanel />
            </div>
          </>
        )}
      </div>
      
      {state.isSettingsOpen && <SettingsModal />}
      {state.isPlanModalOpen && <PlanModal />}
      {state.isProgressOpen && <ProgressPanel />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
