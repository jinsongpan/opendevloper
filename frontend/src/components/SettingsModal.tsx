import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsModal() {
  const { state, dispatch } = useApp();
  const { settings } = state;

  const [anthropicKey, setAnthropicKey] = useState(settings.anthropic.apiKey);
  const [anthropicModel, setAnthropicModel] = useState(settings.anthropic.model);
  const [openaiKey, setOpenaiKey] = useState(settings.openai.apiKey);
  const [openaiModel, setOpenaiModel] = useState(settings.openai.model);
  const [openrouterKey, setOpenrouterKey] = useState(settings.openrouter.apiKey);
  const [openrouterModel, setOpenrouterModel] = useState(settings.openrouter.model);

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_SETTINGS', payload: false });
  };

  const handleSave = () => {
    const newSettings = {
      anthropic: {
        apiKey: anthropicKey,
        model: anthropicModel || 'claude-sonnet-4.6',
      },
      openai: {
        apiKey: openaiKey,
        model: openaiModel || 'gpt-5.2-codex',
      },
      openrouter: {
        apiKey: openrouterKey,
        model: openrouterModel || 'z-ai/glm-4.5-air:free',
      },
    };
    
    console.log('Saving settings:', newSettings);
    dispatch({ type: 'SET_SETTINGS', payload: newSettings });
    localStorage.setItem('settings', JSON.stringify(newSettings));
    
    let selectedModel = 'anthropic';
    if (anthropicKey) {
      selectedModel = 'anthropic';
    } else if (openaiKey) {
      selectedModel = 'openai';
    } else if (openrouterKey) {
      selectedModel = 'openrouter';
    }
    dispatch({ type: 'SET_MODEL', payload: selectedModel });
    localStorage.setItem('model', selectedModel);
    
    dispatch({ type: 'TOGGLE_SETTINGS', payload: false });
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">设置</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="settings-section">
            <h3 className="settings-section-title">Anthropic (Claude)</h3>
            <div className="settings-field">
              <label className="settings-label">API Key</label>
              <input
                id="anthropic-key"
                type="password"
                className="settings-input"
                placeholder="sk-ant-..."
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label">模型</label>
              <input
                id="anthropic-model"
                type="text"
                className="settings-input"
                placeholder="claude-3-5-sonnet-20241022"
                value={anthropicModel}
                onChange={(e) => setAnthropicModel(e.target.value)}
              />
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">OpenAI</h3>
            <div className="settings-field">
              <label className="settings-label">API Key</label>
              <input
                id="openai-key"
                type="password"
                className="settings-input"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label">模型</label>
              <input
                id="openai-model"
                type="text"
                className="settings-input"
                placeholder="gpt-4o"
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
              />
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">OpenRouter</h3>
            <div className="settings-field">
              <label className="settings-label">API Key</label>
              <input
                id="openrouter-key"
                type="password"
                className="settings-input"
                placeholder="sk-..."
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label">模型</label>
              <input
                id="openrouter-model"
                type="text"
                className="settings-input"
                placeholder="z-ai/glm-4.5-air:free"
                value={openrouterModel}
                onChange={(e) => setOpenrouterModel(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
