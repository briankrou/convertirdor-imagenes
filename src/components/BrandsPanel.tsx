import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Globe, Hash, Building2, FileText, X, Check, Search, Upload, Download, Sparkles, Mic, Tag, AtSign, Languages } from 'lucide-react';
import { Brand, CustomerProfile } from '../types';
import { Popup } from './Popup';
import { usePopup } from '../hooks/usePopup';

interface BrandsPanelProps {
  brands: Brand[];
  onBrandsChange: (brands: Brand[]) => void;
  onBack: () => void;
  onSuggestKeywords?: (name: string, description: string) => Promise<string[]>;
}

type FormData = {
  name: string;
  websiteUrl: string;
  keywords: string[];
  hashtags: string[];
  tone: string;
  industry: string;
  language: string;
  socialHandle: string;
  logoUrl: string;
  description: string;
  customerProfiles: import('../types').CustomerProfile[];
};

const TONES = [
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'técnico', label: 'Técnico' },
  { value: 'emocional', label: 'Emocional' },
  { value: 'persuasivo', label: 'Persuasivo' },
];

const LANGUAGES = ['Español', 'Inglés', 'Portugués', 'Francés', 'Alemán', 'Italiano'];

const emptyForm = (): FormData => ({
  name: '', websiteUrl: '', keywords: [], hashtags: [],
  tone: '', industry: '', language: '', socialHandle: '', logoUrl: '', description: '',
  customerProfiles: [],
});

const initials = (name: string) => name.trim().slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
];

const avatarColor = (id: string) => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

// ─── Keyword tag input ────────────────────────────────────────────────────────

const KeywordsInput: React.FC<{
  keywords: string[];
  onChange: (kws: string[]) => void;
}> = ({ keywords, onChange }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addKeyword = (raw: string) => {
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    const fresh = parts.filter(p => !keywords.includes(p));
    if (fresh.length) onChange([...keywords, ...fresh]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword(input);
    } else if (e.key === 'Backspace' && input === '' && keywords.length > 0) {
      onChange(keywords.slice(0, -1));
    }
  };

  const removeKeyword = (kw: string) => onChange(keywords.filter(k => k !== kw));

  return (
    <div
      className="flex flex-wrap gap-1.5 px-2.5 py-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text min-h-[40px]"
      onClick={() => inputRef.current?.focus()}
    >
      {keywords.map(kw => (
        <span key={kw} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
          <Hash className="w-3 h-3 opacity-60" />
          {kw}
          <button type="button" onClick={e => { e.stopPropagation(); removeKeyword(kw); }} className="ml-0.5 hover:text-red-500 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addKeyword(input); }}
        placeholder={keywords.length === 0 ? 'Escribe y presiona Enter…' : ''}
        className="flex-1 min-w-[120px] text-sm border-0 outline-none focus:ring-0 bg-transparent p-0"
      />
    </div>
  );
};

// ─── Customer Profile Editor ──────────────────────────────────────────────────

const CustomerProfileEditor: React.FC<{
  profiles: CustomerProfile[];
  onChange: (profiles: CustomerProfile[]) => void;
}> = ({ profiles, onChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<Omit<CustomerProfile, 'id'>>({
    name: '', description: '', painPoints: [], desires: []
  });

  const resetInternal = () => {
    setProfileForm({ name: '', description: '', painPoints: [], desires: [] });
    setIsAdding(false);
    setEditingId(null);
  };

  const saveProfile = () => {
    if (!profileForm.name.trim()) return;
    if (editingId) {
      onChange(profiles.map(p => p.id === editingId ? { ...profileForm, id: editingId } : p));
    } else {
      onChange([...profiles, { ...profileForm, id: `profile_${Date.now()}` }]);
    }
    resetInternal();
  };

  const removeProfile = (id: string) => onChange(profiles.filter(p => p.id !== id));

  const startEdit = (p: import('../types').CustomerProfile) => {
    setProfileForm({ name: p.name, description: p.description, painPoints: p.painPoints, desires: p.desires });
    setEditingId(p.id);
    setIsAdding(true);
  };

  return (
    <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <AtSign className="w-4 h-4 text-pink-500" /> Perfiles de Cliente (Buyer Personas)
        </h4>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Perfil
          </button>
        )}
      </div>

      {isAdding ? (
        <div className="bg-white border border-blue-100 rounded-lg p-3 space-y-3 shadow-sm">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre del Perfil</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Emprendedor Tecnológico"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Descripción / Dolores</label>
            <textarea
              value={profileForm.description}
              onChange={e => setProfileForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe a este cliente, sus problemas y lo que busca..."
              rows={2}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={resetInternal} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded">Cancelar</button>
            <button type="button" onClick={saveProfile} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700">
              {editingId ? 'Actualizar' : 'Confirmar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {profiles.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-2">No has definido perfiles específicos para esta marca.</p>
          ) : (
            profiles.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white px-3 py-2 border border-gray-200 rounded-lg group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{p.description}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => startEdit(p)} className="p-1 hover:bg-blue-50 text-blue-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => removeProfile(p.id)} className="p-1 hover:bg-red-50 text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Panel ────────────────────────────────────────────────────────────────────

export const BrandsPanel: React.FC<BrandsPanelProps> = ({ brands, onBrandsChange, onBack, onSuggestKeywords }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [search, setSearch] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const { popupState, hidePopup, showConfirm } = usePopup();

  const filtered = search.trim()
    ? brands.filter(b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.keywords?.some(k => k.toLowerCase().includes(search.toLowerCase()))
    )
    : brands;

  const openCreate = () => { setForm(emptyForm()); setEditingId(null); setShowForm(true); };

  const openEdit = (brand: Brand) => {
    setForm({
      name: brand.name,
      websiteUrl: brand.websiteUrl ?? '',
      keywords: brand.keywords ?? [],
      hashtags: brand.hashtags ?? [],
      tone: brand.tone ?? '',
      industry: brand.industry ?? '',
      language: brand.language ?? '',
      socialHandle: brand.socialHandle ?? '',
      logoUrl: brand.logoUrl ?? '',
      description: brand.description ?? '',
      customerProfiles: brand.customerProfiles ?? [],
    });
    setEditingId(brand.id);
    setShowForm(true);
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm()); };

  const saveForm = () => {
    if (!form.name.trim()) return;
    const cleaned: Brand = {
      id: editingId ?? `brand_${Date.now()}`,
      name: form.name.trim(),
      websiteUrl: form.websiteUrl.trim() || undefined,
      keywords: form.keywords.length > 0 ? form.keywords : undefined,
      hashtags: form.hashtags.length > 0 ? form.hashtags : undefined,
      tone: form.tone || undefined,
      industry: form.industry.trim() || undefined,
      language: form.language || undefined,
      socialHandle: form.socialHandle.trim() || undefined,
      logoUrl: form.logoUrl.trim() || undefined,
      description: form.description.trim() || undefined,
      customerProfiles: form.customerProfiles.length > 0 ? form.customerProfiles : undefined,
      createdAt: editingId
        ? (brands.find(b => b.id === editingId)?.createdAt ?? new Date().toISOString())
        : new Date().toISOString(),
    };
    if (editingId) {
      onBrandsChange(brands.map(b => b.id === editingId ? cleaned : b));
    } else {
      onBrandsChange([...brands, cleaned]);
    }
    cancelForm();
  };

  const deleteBrand = (id: string, name: string) => {
    showConfirm(
      'Eliminar marca',
      `¿Eliminar "${name}"? Esta acción no se puede deshacer.`,
      () => onBrandsChange(brands.filter(b => b.id !== id)),
      { confirmText: 'Eliminar', cancelText: 'Cancelar', type: 'error' }
    );
  };

  // Export brands as JSON
  const exportBrands = () => {
    const json = JSON.stringify(brands, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marcas_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import brands from JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed: Brand[] = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) return;
        // Merge: skip brands whose id already exists
        const existingIds = new Set(brands.map(b => b.id));
        const fresh = parsed.filter(b => b.id && b.name && !existingIds.has(b.id));
        if (fresh.length > 0) onBrandsChange([...brands, ...fresh]);
      } catch { /* invalid JSON — ignore */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Logo file → base64
  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, logoUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const suggestKeywords = async () => {
    if (!onSuggestKeywords || !form.name.trim()) return;
    setIsSuggesting(true);
    try {
      const suggestions = await onSuggestKeywords(form.name, form.description);
      if (suggestions.length > 0) {
        const fresh = suggestions.filter(k => !form.keywords.includes(k));
        setForm(f => ({ ...f, keywords: [...f.keywords, ...fresh] }));
      }
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <Building2 className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Gestión de Marcas</h1>
          <span className="text-sm text-gray-400 font-normal">({brands.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {brands.length > 0 && (
            <button
              onClick={exportBrands}
              className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm transition-colors"
              title="Exportar marcas a JSON"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          )}
          <button
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm transition-colors"
            title="Importar marcas desde JSON"
          >
            <Upload className="w-4 h-4" />
            Importar
          </button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva marca
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Create / Edit form */}
          {showForm && (
            <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  {editingId ? 'Editar marca' : 'Nueva marca'}
                </h2>
                <button onClick={cancelForm} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">

                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nike, Zara, Mi Empresa…"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Escape') cancelForm(); }}
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Página web
                  </label>
                  <input
                    type="url"
                    value={form.websiteUrl}
                    onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))}
                    placeholder="https://www.mimarca.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5" /> Tono de voz
                  </label>
                  <select
                    value={form.tone}
                    onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">— Sin definir —</option>
                    {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Industria / Categoría
                  </label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                    placeholder="Moda, Tecnología, Alimentos…"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5" /> Idioma del contenido
                  </label>
                  <select
                    value={form.language}
                    onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">— Sin definir —</option>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Social handle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <AtSign className="w-3.5 h-3.5" /> Handle / Perfil social
                  </label>
                  <input
                    type="text"
                    value={form.socialHandle}
                    onChange={e => setForm(f => ({ ...f, socialHandle: e.target.value }))}
                    placeholder="@mimarca"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Logo */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo de la marca</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={form.logoUrl.startsWith('data:') ? '' : form.logoUrl}
                      onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
                      placeholder="https://… o sube una imagen"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => logoFileRef.current?.click()}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-4 h-4" /> Subir
                    </button>
                    {form.logoUrl && (
                      <img src={form.logoUrl} alt="logo preview" className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                    )}
                    <input ref={logoFileRef} type="file" accept="image/*" onChange={handleLogoFile} className="hidden" />
                  </div>
                </div>

                {/* Keywords */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" /> Palabras clave
                      <span className="text-xs text-gray-400 font-normal ml-1">— Enter o coma para agregar</span>
                    </label>
                    {onSuggestKeywords && (
                      <button
                        type="button"
                        onClick={suggestKeywords}
                        disabled={isSuggesting || !form.name.trim()}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isSuggesting ? 'Generando…' : 'Sugerir con IA'}
                      </button>
                    )}
                  </div>
                  <KeywordsInput
                    keywords={form.keywords}
                    onChange={kws => setForm(f => ({ ...f, keywords: kws }))}
                  />
                </div>

                {/* Hashtags */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-gray-400" /> Hashtags por defecto
                    <span className="text-xs text-gray-400 font-normal ml-1">— Enter o coma para agregar</span>
                  </label>
                  <KeywordsInput
                    keywords={form.hashtags}
                    onChange={kws => setForm(f => ({ ...f, hashtags: kws }))}
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Descripción de la marca
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Breve descripción, identidad, valores o audiencia de la marca…"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Customer Profiles */}
                <div className="col-span-2">
                  <CustomerProfileEditor
                    profiles={form.customerProfiles}
                    onChange={profiles => setForm(f => ({ ...f, customerProfiles: profiles }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={cancelForm} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={saveForm}
                  disabled={!form.name.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg font-medium transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? 'Guardar cambios' : 'Crear marca'}
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          {brands.length > 4 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar marcas o palabras clave…"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Empty state */}
          {brands.length === 0 && !showForm && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-base font-medium text-gray-600 mb-1">Sin marcas guardadas</p>
              <p className="text-sm text-gray-400 mb-5">Crea marcas para reutilizar su URL, palabras clave, tono y logo en todos los modos de contenido.</p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear primera marca
              </button>
            </div>
          )}

          {/* No results */}
          {brands.length > 0 && filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">
              No se encontraron marcas con "<span className="font-medium">{search}</span>"
            </p>
          )}

          {/* Brand cards */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(brand => (
                <div
                  key={brand.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  {/* Avatar / Logo */}
                  {brand.logoUrl ? (
                    <img src={brand.logoUrl} alt={brand.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                  ) : (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor(brand.id)}`}>
                      {initials(brand.name)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm truncate">{brand.name}</p>
                      {brand.tone && (
                        <span className="px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded text-xs font-medium flex-shrink-0">{brand.tone}</span>
                      )}
                      {brand.industry && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-xs font-medium flex-shrink-0">{brand.industry}</span>
                      )}
                      {brand.language && (
                        <span className="px-1.5 py-0.5 bg-teal-50 text-teal-600 rounded text-xs font-medium flex-shrink-0">{brand.language}</span>
                      )}
                    </div>
                    {brand.websiteUrl && (
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3 flex-shrink-0 text-gray-400" />
                        {brand.websiteUrl.replace(/^https?:\/\//, '')}
                      </p>
                    )}
                    {brand.socialHandle && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <AtSign className="w-3 h-3 flex-shrink-0 text-gray-400" />{brand.socialHandle}
                      </p>
                    )}
                    {brand.keywords && brand.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {brand.keywords.map(kw => (
                          <span key={kw} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">
                            <Hash className="w-2.5 h-2.5 opacity-60" />{kw}
                          </span>
                        ))}
                      </div>
                    )}
                    {brand.description && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{brand.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(brand)} className="p-1.5 hover:bg-blue-50 text-gray-300 hover:text-blue-600 rounded-lg transition-colors" title="Editar">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteBrand(brand.id, brand.name)} className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
