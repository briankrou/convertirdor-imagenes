import React, { useState } from 'react';
import {
  ArrowLeft, FileText, RotateCcw, Trash2,
  ShoppingBag, Briefcase, Image, Share2, Archive, Settings
} from 'lucide-react';
import { UserPromptSettings, ContentModeConfig, ModePromptConfig } from '../types';
import { CONTENT_MODES } from '../services/contentModes';
import { Popup } from './Popup';
import { usePopup } from '../hooks/usePopup';

interface PromptConfigProps {
  settings: UserPromptSettings;
  modePrompts: Partial<Record<string, ModePromptConfig>>;
  customModes: ContentModeConfig[];
  activeMode: ContentModeConfig;
  onSettingsChange: (settings: UserPromptSettings) => void;
  onModePromptsChange: (prompts: Partial<Record<string, ModePromptConfig>>) => void;
  onClearSettings: () => void;
  onBack: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  ShoppingBag: ({ className }) => <ShoppingBag className={className} />,
  Briefcase:   ({ className }) => <Briefcase className={className} />,
  Image:       ({ className }) => <Image className={className} />,
  Share2:      ({ className }) => <Share2 className={className} />,
  Archive:     ({ className }) => <Archive className={className} />,
  Settings:    ({ className }) => <Settings className={className} />,
};

const TabIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon className={className} /> : <Settings className={className} />;
};

const ECOMMERCE_DEFAULTS = {
  titlePrompt: 'Genera un título atractivo y descriptivo para esta imagen (máximo 60 caracteres). El título debe ser claro, conciso y que capture la esencia del producto mostrado.',
  descriptionPrompt: 'Describe detalladamente lo que ves en esta imagen. Incluye características visuales, colores, materiales, estilo y cualquier detalle relevante del producto (2-3 oraciones).',
  captionPrompt: 'Crea una leyenda corta y atractiva para esta imagen que resalte las características principales del producto (1 oración).',
  altTextPrompt: 'Genera un texto alternativo descriptivo para accesibilidad que describa claramente el contenido de la imagen (máximo 125 caracteres).',
};

// ─── Pestaña E-commerce ─────────────────────────────────────────────────────

const EcommerceTab: React.FC<{
  settings: UserPromptSettings;
  onSettingsChange: (s: UserPromptSettings) => void;
}> = ({ settings, onSettingsChange }) => {
  const fields: { key: keyof typeof ECOMMERCE_DEFAULTS; label: string; rows: number }[] = [
    { key: 'titlePrompt',       label: 'Título del producto',    rows: 3 },
    { key: 'descriptionPrompt', label: 'Descripción',            rows: 4 },
    { key: 'captionPrompt',     label: 'Leyenda (Caption)',      rows: 3 },
    { key: 'altTextPrompt',     label: 'Texto alternativo',      rows: 3 },
  ];

  const current = settings.useCustomPrompts ? settings : { ...settings, ...ECOMMERCE_DEFAULTS };

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Usar prompts personalizados</p>
          <p className="text-xs text-gray-500 mt-0.5">Personaliza las instrucciones para cada campo</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.useCustomPrompts}
            onChange={e => {
              if (e.target.checked) {
                onSettingsChange({ ...settings, useCustomPrompts: true });
              } else {
                onSettingsChange({ ...settings, useCustomPrompts: false, ...ECOMMERCE_DEFAULTS });
              }
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
        </label>
      </div>

      {settings.useCustomPrompts && fields.map(({ key, label, rows }) => (
        <div key={key} className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
            <button
              onClick={() => onSettingsChange({ ...settings, [key]: ECOMMERCE_DEFAULTS[key] })}
              className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar</span>
            </button>
          </div>
          <textarea
            value={current[key]}
            onChange={e => onSettingsChange({ ...settings, [key]: e.target.value })}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
          />
        </div>
      ))}

      {settings.useCustomPrompts && (
        <button
          onClick={() => onSettingsChange({ ...settings, ...ECOMMERCE_DEFAULTS, useCustomPrompts: true })}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restaurar todos los predeterminados</span>
        </button>
      )}
    </div>
  );
};

// ─── Pestaña modo genérico ───────────────────────────────────────────────────

const ModeTab: React.FC<{
  mode: ContentModeConfig;
  config: ModePromptConfig | undefined;
  onChange: (config: ModePromptConfig) => void;
}> = ({ mode, config, onChange }) => {
  const isOn = config?.useCustom ?? false;

  const emptyConfig = (): ModePromptConfig => ({
    useCustom: true,
    defaultPrompt: mode.defaultPrompt,
    fieldPrompts: Object.fromEntries(mode.fields.filter(f => f.enabled).map(f => [f.key, ''])),
  });

  const current: ModePromptConfig = config ?? emptyConfig();

  const setField = (key: string, value: string) => {
    onChange({ ...current, useCustom: true, fieldPrompts: { ...current.fieldPrompts, [key]: value } });
  };

  const setDefaultPrompt = (value: string) => {
    onChange({ ...current, useCustom: true, defaultPrompt: value });
  };

  const enabledFields = mode.fields.filter(f => f.enabled);

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Usar prompts personalizados</p>
          <p className="text-xs text-gray-500 mt-0.5">Anula el prompt predeterminado de este modo</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isOn}
            onChange={e => {
              if (e.target.checked) {
                onChange(config ? { ...config, useCustom: true } : { ...emptyConfig(), useCustom: true });
              } else {
                onChange({ ...current, useCustom: false });
              }
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
        </label>
      </div>

      {isOn && (
        <>
          {/* Prompt principal */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Instrucción principal</h3>
              <button
                onClick={() => onChange({ ...current, defaultPrompt: mode.defaultPrompt })}
                className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar</span>
              </button>
            </div>
            <textarea
              value={current.defaultPrompt}
              onChange={e => setDefaultPrompt(e.target.value)}
              rows={3}
              placeholder={mode.defaultPrompt}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Predeterminado: "{mode.defaultPrompt}"
            </p>
          </div>

          {/* Instrucciones por campo */}
          {enabledFields.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Instrucción por campo (deja vacío para usar la etiqueta del campo)
              </p>
              {enabledFields.map(field => (
                <div key={field.key} className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{field.label}</h3>
                      <code className="text-xs text-gray-400">{field.key}</code>
                      {field.maxLength && (
                        <span className="text-xs text-gray-400 ml-2">· máx. {field.maxLength} chars</span>
                      )}
                    </div>
                    <button
                      onClick={() => setField(field.key, '')}
                      className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Limpiar</span>
                    </button>
                  </div>
                  <textarea
                    value={current.fieldPrompts?.[field.key] ?? ''}
                    onChange={e => setField(field.key, e.target.value)}
                    rows={2}
                    placeholder={`Ej: Genera ${field.label.toLowerCase()} de forma concisa y directa...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!isOn && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <p className="text-sm font-medium text-gray-700 mb-1">Prompt predeterminado activo:</p>
          <p className="text-sm text-gray-500 italic">{mode.defaultPrompt}</p>
          <div className="mt-3 space-y-2">
            {enabledFields.map(field => (
              <div key={field.key} className="flex items-center space-x-2">
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{field.key}</span>
                <span className="text-xs text-gray-500">{field.label}{field.maxLength ? ` (máx. ${field.maxLength})` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────

export const PromptConfig: React.FC<PromptConfigProps> = ({
  settings,
  modePrompts,
  customModes,
  activeMode,
  onSettingsChange,
  onModePromptsChange,
  onClearSettings,
  onBack,
}) => {
  const predefinedModes = CONTENT_MODES.filter(m => m.id !== 'custom');
  const allTabs = [...predefinedModes, ...customModes];
  const [activeTab, setActiveTab] = useState<string>(activeMode.id === 'custom' ? (customModes[0]?.label ?? predefinedModes[0].id) : activeMode.id);
  const { popupState, hidePopup, showConfirm } = usePopup();

  const handleModePromptChange = (modeKey: string, config: ModePromptConfig) => {
    onModePromptsChange({ ...modePrompts, [modeKey]: config });
  };

  const handleClearSettings = () => {
    showConfirm(
      'Limpiar configuración',
      '¿Estás seguro? Se restablecerán todos los prompts de todos los modos a sus valores predeterminados.',
      () => onClearSettings(),
      { confirmText: 'Limpiar', cancelText: 'Cancelar', type: 'warning' }
    );
  };

  const activeTabMode = allTabs.find(m => (m.id === activeTab && m.id !== 'custom') || m.label === activeTab) ?? allTabs[0];
  const tabKey = activeTabMode.id === 'custom' ? activeTabMode.label : activeTabMode.id;

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-semibold text-gray-900">Configuración de Prompts</h1>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 overflow-x-auto">
        <div className="flex min-w-max px-4">
          {allTabs.map(mode => {
            const key = mode.id === 'custom' ? mode.label : mode.id;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TabIcon name={mode.icon} className="w-4 h-4" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {activeTabMode.id === 'ecommerce' ? (
            <EcommerceTab settings={settings} onSettingsChange={onSettingsChange} />
          ) : (
            <ModeTab
              mode={activeTabMode}
              config={modePrompts[tabKey]}
              onChange={config => handleModePromptChange(tabKey, config)}
            />
          )}

          {/* Limpiar configuración */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Limpiar toda la configuración</p>
              <p className="text-xs text-gray-500 mt-0.5">Restablece los prompts de todos los modos</p>
            </div>
            <button
              onClick={handleClearSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar todo</span>
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
