import React, { useState } from 'react';
import { ArrowLeft, Brain, Key, CheckCircle, XCircle, Eye, EyeOff, Trash2, Layers, ChevronDown } from 'lucide-react';
import { UserChatGPTSettings, AIProvider, AIProviderConfig, ContentMode, ModeModelConfig } from '../types';
import { AI_PROVIDERS, AI_PROVIDER_INFO, getDefaultModel } from '../services/aiProviders';
import { CONTENT_MODES } from '../services/contentModes';
import { ChatGPTService } from '../services/chatgptService';
import { Popup } from './Popup';
import { usePopup } from '../hooks/usePopup';

interface ChatGPTConfigProps {
  settings: UserChatGPTSettings;
  onSettingsChange: (settings: UserChatGPTSettings) => void;
  aiProviders: Partial<Record<AIProvider, AIProviderConfig>>;
  onProvidersChange: (providers: Partial<Record<AIProvider, AIProviderConfig>>) => void;
  modeModels: Partial<Record<ContentMode, ModeModelConfig>>;
  onModeModelsChange: (models: Partial<Record<ContentMode, ModeModelConfig>>) => void;
  onClearSettings: () => void;
  onBack: () => void;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export const ChatGPTConfig: React.FC<ChatGPTConfigProps> = ({
  settings,
  onSettingsChange,
  aiProviders,
  onProvidersChange,
  modeModels,
  onModeModelsChange,
  onClearSettings,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<AIProvider>('openai');
  const [showKeys, setShowKeys] = useState<Partial<Record<AIProvider, boolean>>>({});
  const [testStatus, setTestStatus] = useState<Partial<Record<AIProvider, TestStatus>>>({});
  const [isTestingImage, setIsTestingImage] = useState(false);
  const [imageTestResult, setImageTestResult] = useState('');
  const { popupState, hidePopup, showConfirm } = usePopup();

  // ── OpenAI (uses existing settings object) ──────────────────────────────

  const getProviderConfig = (provider: AIProvider): AIProviderConfig => {
    if (provider === 'openai') return { apiKey: settings.apiKey, enabled: settings.enabled };
    return aiProviders[provider] ?? { apiKey: '', enabled: false };
  };

  const setProviderApiKey = (provider: AIProvider, apiKey: string) => {
    if (provider === 'openai') {
      onSettingsChange({ ...settings, apiKey });
    } else {
      const current = aiProviders[provider] ?? { apiKey: '', enabled: false };
      onProvidersChange({ ...aiProviders, [provider]: { ...current, apiKey } });
    }
    setTestStatus(prev => ({ ...prev, [provider]: 'idle' }));
  };

  const setProviderEnabled = (provider: AIProvider, enabled: boolean) => {
    if (provider === 'openai') {
      onSettingsChange({ ...settings, enabled });
    } else {
      const current = aiProviders[provider] ?? { apiKey: '', enabled: false };
      onProvidersChange({ ...aiProviders, [provider]: { ...current, enabled } });
    }
  };

  const setDefaultModel = (model: UserChatGPTSettings['model']) => {
    onSettingsChange({ ...settings, model });
  };

  // ── Connection test ──────────────────────────────────────────────────────

  const testConnection = async (provider: AIProvider) => {
    const apiKey = getProviderConfig(provider).apiKey;
    if (!apiKey.trim()) { setTestStatus(prev => ({ ...prev, [provider]: 'error' })); return; }
    setTestStatus(prev => ({ ...prev, [provider]: 'testing' }));
    const ok = await ChatGPTService.testProviderConnection(provider, apiKey);
    setTestStatus(prev => ({ ...prev, [provider]: ok ? 'success' : 'error' }));
  };

  const testImageAnalysis = async () => {
    if (!settings.apiKey.trim()) { setImageTestResult('❌ API key de OpenAI no configurada'); return; }
    setIsTestingImage(true);
    setImageTestResult('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200; canvas.height = 200;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#4F46E5'; ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = 'white'; ctx.font = '18px Arial'; ctx.textAlign = 'center';
      ctx.fillText('Imagen de Prueba', 100, 100);
      const { ChatGPTService: Svc } = await import('../services/chatgptService');
      const svc = new Svc(settings);
      const result = await svc.testImageAnalysis({ id: 0, name: 'imagen-prueba.png', url: canvas.toDataURL(), file: null as any, size: 0, originalFormat: 'png' });
      setImageTestResult(result.success ? `✅ ${result.details?.content ?? 'Análisis completado'}` : `❌ ${result.error}`);
    } catch (e) {
      setImageTestResult(`❌ ${e instanceof Error ? e.message : 'Error desconocido'}`);
    } finally {
      setIsTestingImage(false);
    }
  };

  // ── Per-mode model ────────────────────────────────────────────────────────

  const getModeModel = (modeId: ContentMode): ModeModelConfig | undefined => modeModels[modeId];

  const setModeModel = (modeId: ContentMode, value: ModeModelConfig | undefined) => {
    const updated = { ...modeModels };
    if (value) updated[modeId] = value;
    else delete updated[modeId];
    onModeModelsChange(updated);
  };

  // ── Clear ─────────────────────────────────────────────────────────────────

  const handleClearSettings = () => {
    showConfirm(
      'Limpiar configuración',
      '¿Estás seguro de que quieres limpiar la configuración de IA? Se borrarán todas las API keys y configuraciones por modo.',
      () => {
        onClearSettings();
        onProvidersChange({});
        onModeModelsChange({});
      },
      { confirmText: 'Limpiar', cancelText: 'Cancelar', type: 'warning' }
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const tabInfo = AI_PROVIDER_INFO[activeTab];
  const providerCfg = getProviderConfig(activeTab);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center space-x-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <Brain className="w-6 h-6 text-blue-600" />
        <h1 className="text-xl font-semibold text-gray-900">Configuración de IA</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* ── Provider tabs ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-200">
              {AI_PROVIDERS.map(p => {
                const info = AI_PROVIDER_INFO[p];
                const cfg = getProviderConfig(p);
                const isActive = activeTab === p;
                return (
                  <button
                    key={p}
                    onClick={() => setActiveTab(p)}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      isActive ? info.activeTabClass : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>{info.shortLabel}</span>
                    {cfg.enabled && cfg.apiKey && (
                      <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-500 align-middle" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className={`p-6 space-y-5 ${tabInfo.bgColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-base font-semibold ${tabInfo.textColor}`}>{tabInfo.label}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeTab === 'openai' && 'Proveedor principal. La clave de API se usará como predeterminado.'}
                    {activeTab === 'anthropic' && 'API de Anthropic. Formato: sk-ant-...'}
                    {activeTab === 'google' && 'Google AI Studio API key para Gemini con visión.'}
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={providerCfg.enabled}
                    onChange={e => setProviderEnabled(activeTab, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative" />
                </label>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Clave API</label>
                <div className="relative">
                  <input
                    type={showKeys[activeTab] ? 'text' : 'password'}
                    value={providerCfg.apiKey}
                    onChange={e => setProviderApiKey(activeTab, e.target.value)}
                    placeholder={activeTab === 'openai' ? 'sk-...' : activeTab === 'anthropic' ? 'sk-ant-...' : 'AIza...'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys(prev => ({ ...prev, [activeTab]: !prev[activeTab] }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    {showKeys[activeTab] ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Almacenada localmente, nunca se envía a nuestros servidores.</p>
              </div>

              {/* Test connection */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => testConnection(activeTab)}
                  disabled={!providerCfg.apiKey.trim() || testStatus[activeTab] === 'testing'}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  {testStatus[activeTab] === 'testing' ? 'Probando...' : 'Probar conexión'}
                </button>

                {activeTab === 'openai' && (
                  <button
                    onClick={testImageAnalysis}
                    disabled={!settings.apiKey.trim() || isTestingImage}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                  >
                    {isTestingImage ? 'Probando imagen...' : 'Probar análisis de imagen'}
                  </button>
                )}

                {testStatus[activeTab] === 'success' && (
                  <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle className="w-4 h-4" /> Conexión exitosa</span>
                )}
                {testStatus[activeTab] === 'error' && (
                  <span className="flex items-center gap-1 text-sm text-red-600"><XCircle className="w-4 h-4" /> Error de conexión</span>
                )}
              </div>

              {imageTestResult && activeTab === 'openai' && (
                <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">{imageTestResult}</div>
              )}

              {/* Default model (OpenAI uses the main settings model; others just pick for per-mode assignment) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {activeTab === 'openai' ? 'Modelo predeterminado' : 'Modelos disponibles'}
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {tabInfo.models.map(m => (
                    <label
                      key={m.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        activeTab === 'openai' && settings.model === m.id
                          ? `${tabInfo.borderColor} bg-white`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {activeTab === 'openai' && (
                        <input
                          type="radio"
                          name="default-model"
                          value={m.id}
                          checked={settings.model === m.id}
                          onChange={() => setDefaultModel(m.id as UserChatGPTSettings['model'])}
                          className="w-4 h-4 text-blue-600 border-gray-300"
                        />
                      )}
                      <div className={activeTab === 'openai' ? 'ml-3 flex-1' : 'flex-1'}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{m.label}</span>
                          <span className="text-xs text-gray-400">{m.price}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {activeTab !== 'openai' && (
                  <p className="text-xs text-gray-400 mt-2">Asigna estos modelos a modos específicos en la sección "Modelo por modo" de abajo.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Per-mode model assignment ──────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <Layers className="w-5 h-5 text-gray-500" />
              <h2 className="text-base font-semibold text-gray-900">Modelo por modo</h2>
              <span className="text-xs text-gray-400 ml-auto">Opcional — anula el modelo predeterminado por modo de contenido</span>
            </div>

            <div className="divide-y divide-gray-100">
              {CONTENT_MODES.map(mode => {
                const modeModel = getModeModel(mode.id);
                const selectedProvider: AIProvider = modeModel?.provider ?? 'openai';
                const selectedModel: string = modeModel?.model ?? '';
                const providerModels = AI_PROVIDER_INFO[selectedProvider]?.models ?? [];

                return (
                  <div key={mode.id} className="px-6 py-4 flex items-center gap-3">
                    <div className="w-36 flex-shrink-0">
                      <p className="text-sm font-medium text-gray-800">{mode.label}</p>
                    </div>

                    {/* Provider select */}
                    <div className="relative flex-1">
                      <select
                        value={modeModel ? selectedProvider : ''}
                        onChange={e => {
                          const p = e.target.value as AIProvider;
                          if (!p) { setModeModel(mode.id, undefined); return; }
                          setModeModel(mode.id, { provider: p, model: getDefaultModel(p) });
                        }}
                        className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Predeterminado (OpenAI)</option>
                        {AI_PROVIDERS.map(p => (
                          <option key={p} value={p}>{AI_PROVIDER_INFO[p].shortLabel}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Model select — only when a provider is explicitly chosen */}
                    {modeModel && (
                      <div className="relative flex-1">
                        <select
                          value={selectedModel}
                          onChange={e => setModeModel(mode.id, { provider: selectedProvider, model: e.target.value })}
                          className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {providerModels.map(m => (
                            <option key={m.id} value={m.id}>{m.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    )}

                    {!modeModel && (
                      <div className="flex-1 px-3 py-2 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                        {settings.model} (global)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Info box ─────────────────────────────────────────────────── */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 space-y-1">
            <p className="font-medium text-blue-900">¿Cómo funciona?</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Configura la API key de cada proveedor que quieras usar</li>
              <li>El proveedor OpenAI es el predeterminado para todos los modos</li>
              <li>En "Modelo por modo" puedes asignar un proveedor y modelo distinto a cada modo de contenido</li>
              <li>Se cobra por uso directamente al proveedor según el modelo seleccionado</li>
            </ul>
          </div>

          {/* ── Clear ────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Limpiar configuración de IA</h3>
              <p className="text-xs text-gray-500 mt-0.5">Elimina todas las API keys y asignaciones por modo</p>
            </div>
            <button
              onClick={handleClearSettings}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar todo
            </button>
          </div>
        </div>
      </div>

      <Popup
        isOpen={popupState.isOpen}
        onClose={hidePopup}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
        onConfirm={popupState.onConfirm}
        onCancel={popupState.onCancel}
        confirmText={popupState.confirmText}
        cancelText={popupState.cancelText}
        showButtons={popupState.showButtons}
      />
    </div>
  );
};
