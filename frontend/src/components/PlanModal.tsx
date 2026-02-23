import React from 'react';
import { X, Clock, FileCode, Terminal, Package, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePlan } from '../hooks/useApi';

const stepTypeIcons: Record<string, React.ReactNode> = {
  CREATE_FILE: <FileCode size={14} />,
  EDIT_FILE: <FileCode size={14} />,
  DELETE_FILE: <Trash2 size={14} />,
  RUN_COMMAND: <Terminal size={14} />,
  INSTALL_PACKAGE: <Package size={14} />,
};

const stepTypeLabels: Record<string, string> = {
  CREATE_FILE: '创建文件',
  EDIT_FILE: '编辑文件',
  DELETE_FILE: '删除文件',
  RUN_COMMAND: '运行命令',
  INSTALL_PACKAGE: '安装依赖',
};

export default function PlanModal() {
  const { state, dispatch } = useApp();
  const { executePlan } = usePlan();

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_PLAN_MODAL', payload: false });
    dispatch({ type: 'SET_PLAN', payload: null });
  };

  const handleExecute = async () => {
    if (!state.currentPlan) return;
    await executePlan(state.currentPlan);
  };

  if (!state.currentPlan) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">执行计划</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="plan-list">
            {state.currentPlan.steps.map((step, index) => (
              <div key={step.id} className="plan-step">
                <div className="step-number">{index + 1}</div>
                <div className="step-info">
                  <div className="step-type" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {stepTypeIcons[step.type]}
                    {stepTypeLabels[step.type]}
                  </div>
                  <div className="step-description">{step.description}</div>
                  {step.target && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      目标: {step.target}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {state.currentPlan.estimatedTime && (
            <div className="plan-estimated">
              <Clock size={14} />
              预计时间: {state.currentPlan.estimatedTime}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-danger" onClick={handleClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleExecute}>
            确认执行
          </button>
        </div>
      </div>
    </div>
  );
}
