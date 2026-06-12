import React, { useState } from 'react';
import {
  ArrowLeft, ShoppingBag, Briefcase, Image, Share2, Archive, Settings, Check, Plus, Trash2
} from 'lucide-react';
import { ContentModeConfig, ContentMode, AIField } from '../types';
import { CONTENT_MODES } from '../services/contentModes';

interface ContentModeSelectorProps {
  activeMode: ContentModeConfig;
  customModes: ContentModeConfig[];
  onModeChange: (mode: ContentModeConfig) => void;
  onCustomModesChange: (modes: ContentModeConfig[]) => void;
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

const ModeIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon className={className} /> : <Settings className={className} />;
};

const DEFAULT_CUSTOM_FIELD: AIField = { key: '', label: '', enabled: true };

export const ContentModeSelector: React.FC<ContentModeSelectorProps> = ({
  activeMode,
  customModes,
  onModeChange,
  onCustomModesChange,
  onBack,
}) => {
  const [editingCustom, setEditingCustom] = useState<ContentModeConfig | null>(null);
  const [newField, setNewField] = useState<AIField>({ ...DEFAULT_CUSTOM_FIELD });

  const allModes: ContentModeConfig[] = [
    ...CONTENT_MODES.filter(m => m.id !== 'custom'),
    ...customModes,
    CONTENT_MODES.find(m => m.id === 'custom')!,
  ];

  const handleSelectMode = (mode: ContentModeConfig) => {
    if (mode.id === 'custom' && customModes.length === 0) {
      // Abrir editor de modo personalizado nuevo
      setEditingCustom({
        id: 'custom',
        label: 'Mi modo personalizado',
        icon: 'Settings',
        fields: [],
        defaultPrompt: '',
      });
      return;
    }
    onModeChange(mode);
  };

  const handleSaveCustomMode = () => {
    if (!editingCustom) return;
    const isNew = !customModes.find(m => m.label === editingCustom.label && customModes.includes(m));
    const updated = isNew
      ? [...customModes, editingCustom]
      : customModes.map(m => m === editingCustom ? editingCustom : m);
    onCustomModesChange(updated);
    onModeChange(editingCustom);
    setEditingCustom(null);
  };

  const handleDeleteCustomMode = (mode: ContentModeConfig) => {
    const updated = customModes.filter(m => m !== mode);
    onCustomModesChange(updated);
    if (activeMode === mode) onModeChange(CONTENT_MODES[0]);
  };

  const handleAddField = () => {
    if (!editingCustom || !newField.key.trim() || !newField.label.trim()) return;
    setEditingCustom({
      ...editingCustom,
      fields: [...editingCustom.fields, { ...newField, key: newField.key.trim(), label: newField.label.trim() }],
    });
    setNewField({ ...DEFAULT_CUSTOM_FIELD });
  };

  const handleRemoveField = (index: number) => {
    if (!editingCustom) return;
    setEditingCustom({
      ...editingCustom,
      fields: editingCustom.fields.filter((_, i) => i !== index),
    });
  };

  if (editingCustom) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center space-x-4">
          <button onClick={() => setEditingCustom(null)} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Editor de modo personalizado</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del modo</label>
            <input
              type="text"
              value={editingCustom.label}
              onChange={e => setEditingCustom({ ...editingCustom, label: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Inmobiliaria, Restaurante, Moda..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt base (instrucción para la IA)</label>
            <textarea
              value={editingCustom.defaultPrompt}
              onChange={e => setEditingCustom({ ...editingCustom, defaultPrompt: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Ej: Analiza esta imagen de una propiedad inmobiliaria y genera..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Campos a generar</label>
            <div className="space-y-2 mb-4">
              {editingCustom.fields.length === 0 && (
                <p className="text-sm text-gray-400 italic">No hay campos definidos aún.</p>
              )}
              {editingCustom.fields.map((field, i) => (
                <div key={i} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{field.key}</span>
                  <span className="text-sm text-gray-700 flex-1">{field.label}</span>
                  {field.maxLength && <span className="text-xs text-gray-400">máx. {field.maxLength}</span>}
                  <button onClick={() => handleRemoveField(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Añadir campo</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newField.key}
                  onChange={e => setNewField({ ...newField, key: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                  placeholder="clave (ej: precio)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newField.label}
                  onChange={e => setNewField({ ...newField, label: e.target.value })}
                  placeholder="etiqueta visible (ej: Precio)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={newField.maxLength ?? ''}
                  onChange={e => setNewField({ ...newField, maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="máx."
                  className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddField}
                  disabled={!newField.key.trim() || !newField.label.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveCustomMode}
            disabled={!editingCustom.label.trim() || editingCustom.fields.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
          >
            Guardar modo y activar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center space-x-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Modo de uso</h1>
          <p className="text-sm text-gray-500">Selecciona el contexto para que la IA genere los campos adecuados</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allModes.map(mode => {
            const isActive = activeMode.id === mode.id && (mode.id !== 'custom' || customModes.includes(mode) || activeMode === mode);
            const isCustomPlaceholder = mode.id === 'custom' && !customModes.find(m => m === mode);

            return (
              <div
                key={`${mode.id}-${mode.label}`}
                onClick={() => handleSelectMode(mode)}
                className={`relative bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                  isActive ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isActive && (
                  <span className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                )}

                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <ModeIcon name={mode.icon} className="w-5 h-5" />
                </div>

                <h3 className="text-sm font-semibold text-gray-900 mb-2">{mode.label}</h3>

                {isCustomPlaceholder ? (
                  <p className="text-xs text-gray-400 italic">Clic para crear tu propio modo con campos y prompt personalizados</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {mode.fields.filter(f => f.enabled).map(field => (
                      <span
                        key={field.key}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {field.label}
                      </span>
                    ))}
                  </div>
                )}

                {customModes.includes(mode) && (
                  <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={e => { e.stopPropagation(); setEditingCustom({ ...mode }); }}
                      className="text-xs text-gray-500 hover:text-blue-600 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteCustomMode(mode); }}
                      className="text-xs text-red-400 hover:text-red-600 font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
