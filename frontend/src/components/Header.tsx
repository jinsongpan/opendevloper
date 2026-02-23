import React from 'react';
import { Sparkles, Cog } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { state, dispatch } = useApp();
  const { settings, model } = state;

  const availableModels = [
    { 
      value: 'anthropic', 
      label: settings.anthropic.model || 'Claude', 
      hasKey: !!settings.anthropic.apiKey 
    },
    { 
      value: 'openai', 
      label: settings.openai.model || 'OpenAI', 
      hasKey: !!settings.openai.apiKey 
    },
    { 
      value: 'openrouter', 
      label: settings.openrouter.model || 'OpenRouter', 
      hasKey: !!settings.openrouter.apiKey 
    },
  ].filter(m => m.hasKey);

  const currentModel = availableModels.find(m => m.value === model);
  const displayModel = currentModel || availableModels[0];
  const showModelSelector = availableModels.length > 0;

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_MODEL', payload: e.target.value });
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <Sparkles size={18} color="white" />
        </div>
        <h1 className="app-title">AI Developer</h1>
      </div>

      <div className="header-center">
        {showModelSelector ? (
          <select
            className="model-select"
            value={displayModel?.value || model}
            onChange={handleModelChange}
          >
            {availableModels.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        ) : (
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {availableModels.length === 0 ? '请先在设置中配置 API Key' : ''}
          </span>
        )}
      </div>

      <div className="header-right">
        <button
          className="icon-btn"
          onClick={() => dispatch({ type: 'TOGGLE_SETTINGS', payload: true })}
          title="设置"
        >
          <Cog size={20} />
        </button>
      </div>
    </header>
  );
}
