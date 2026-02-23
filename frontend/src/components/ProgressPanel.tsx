import React from 'react';
import { Check, X, Loader, Circle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Circle size={16} />,
  running: <Loader size={16} className="spin" />,
  completed: <Check size={16} />,
  failed: <X size={16} />,
};

export default function ProgressPanel() {
  const { state, dispatch } = useApp();
  const { currentPlan, progress, executionStatus, stepStatuses } = state;

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_PROGRESS', payload: false });
    if (executionStatus === 'completed' || executionStatus === 'failed') {
      dispatch({ type: 'SET_EXECUTION_STATUS', payload: 'idle' });
      dispatch({ type: 'SET_PROGRESS', payload: 0 });
    }
  };

  const isCompleted = executionStatus === 'completed' || executionStatus === 'failed';

  return (
    <div className="modal-overlay" onClick={isCompleted ? handleClose : undefined}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {executionStatus === 'executing' ? '执行中...' : 
             executionStatus === 'completed' ? '执行完成' : '执行失败'}
          </h2>
          {isCompleted && (
            <button className="modal-close" onClick={handleClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="modal-body progress-panel">
          <div className="progress-header">
            <span className="progress-title">执行进度</span>
            <span style={{ color: 'var(--text-secondary)' }}>{progress}%</span>
          </div>

          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${progress}%`,
                background: executionStatus === 'failed' 
                  ? 'var(--accent-red)' 
                  : 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))'
              }} 
            />
          </div>

          <div className="progress-steps">
            {currentPlan?.steps.map((step, index) => (
              <div key={step.id} className="progress-step">
                <div className={`step-status ${stepStatuses[step.id] || 'pending'}`}>
                  {statusIcons[stepStatuses[step.id] || 'pending']}
                </div>
                <div className="step-info" style={{ flex: 1 }}>
                  <div className="step-description">{step.description}</div>
                  {(step.output || step.error) && (
                    <div className="step-output">
                      {step.error || step.output}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isCompleted && (
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={handleClose}>
              {executionStatus === 'completed' ? '完成' : '关闭'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
