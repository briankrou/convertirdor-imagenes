import React from 'react';
import {
  Download, Trash2, Sliders, Tag, Hash, Brain, FileText,
  Maximize2, Minimize2, Package, ShoppingBag, Briefcase,
  Image, Share2, Archive, Settings, Users, Globe, Building2,
  Layers, AtSign, Barcode, Plus, ChevronsRight
} from 'lucide-react';
import { ConversionSettings, ContentModeConfig, Brand } from '../types';

interface SidebarProps {
  settings: ConversionSettings;
  activeMode: ContentModeConfig;
  modeContext: Record<string, string>;
  brands?: Brand[];
  onSettingsChange: (settings: ConversionSettings) => void;
  onModeContextChange: (ctx: Record<string, string>) => void;
  onManageBrands?: () => void;
  onApplyBrandToAllModes?: (brandId: string) => void;
  onConvert: () => void;
  onConvertOnly: () => void;
  onDownloadConverted?: () => void;
  onClearAll: () => void;
  onGenerateDescriptions?: () => void;
  onExportDescriptions?: () => void;
  isConverting: boolean;
  isGeneratingDescriptions?: boolean;
  imageCount: number;
  convertedCount?: number;
  descriptionsCount?: number;
  chatGPTEnabled?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div>
    <label className="flex items-center text-sm text-gray-700 font-medium mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';
const selectCls = inputCls;
const textareaCls = `${inputCls} resize-none`;

const BrandDot: React.FC<{ ctx: Record<string, string>; field: string }> = ({ ctx, field }) =>
  (ctx['_brandFilledFields'] ?? '').split(',').includes(field)
    ? <span className="ml-1.5 px-1 py-0.5 rounded text-xs bg-indigo-50 text-indigo-400 font-normal">· marca</span>
    : null;

const WebsiteField: React.FC<{ ctx: Record<string, string>; onChange: (c: Record<string, string>) => void }> = ({ ctx, onChange }) => (
  <Field label={<><Globe className="w-3.5 h-3.5 mr-1.5" />Página web de la marca<BrandDot ctx={ctx} field="websiteUrl" /></>} hint="La IA la usará como referencia de la marca">
    <input
      type="url"
      value={ctx.websiteUrl ?? ''}
      onChange={e => onChange({ ...ctx, websiteUrl: e.target.value })}
      placeholder="https://www.mimarca.com"
      className={inputCls}
    />
  </Field>
);

const KeywordField: React.FC<{ ctx: Record<string, string>; onChange: (c: Record<string, string>) => void }> = ({ ctx, onChange }) => (
  <Field label={<><Hash className="w-3.5 h-3.5 mr-1.5" />Palabra clave principal<BrandDot ctx={ctx} field="keyword" /></>} hint="La IA la priorizará en títulos y descripciones">
    <input
      type="text"
      value={ctx.keyword ?? ''}
      onChange={e => onChange({ ...ctx, keyword: e.target.value })}
      placeholder="Ej: zapatillas running, diseño web, tour montaña…"
      className={inputCls}
    />
  </Field>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 mb-4">
    <span className="text-gray-500">{icon}</span>
    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
  </div>
);

// ─── Sección universal: Formato + Calidad ────────────────────────────────────

const FormatSection: React.FC<{
  settings: ConversionSettings;
  onChange: (s: ConversionSettings) => void;
}> = ({ settings, onChange }) => {
  const showQuality = settings.format === 'jpeg' || settings.format === 'webp';
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Formato">
        <select
          value={settings.format}
          onChange={e => onChange({ ...settings, format: e.target.value as ConversionSettings['format'] })}
          className={selectCls}
        >
          {(['jpeg', 'png', 'webp', 'gif', 'bmp'] as const).map(f => (
            <option key={f} value={f}>{f.toUpperCase()}</option>
          ))}
        </select>
      </Field>
      {showQuality && (
        <Field label="Calidad">
          <select
            value={settings.quality}
            onChange={e => onChange({ ...settings, quality: Number(e.target.value) })}
            className={selectCls}
          >
            <option value="10">10% — Muy baja</option>
            <option value="25">25% — Baja</option>
            <option value="50">50% — Media</option>
            <option value="75">75% — Buena</option>
            <option value="90">90% — Alta</option>
            <option value="95">95% — Muy alta</option>
            <option value="100">100% — Máxima</option>
          </select>
        </Field>
      )}
    </div>
  );
};

// ─── Sección universal: Nomenclatura ─────────────────────────────────────────

const NamingSection: React.FC<{
  settings: ConversionSettings;
  onChange: (s: ConversionSettings) => void;
}> = ({ settings, onChange }) => (
  <div className="grid grid-cols-2 gap-3">
    <Field label={<><Tag className="w-3.5 h-3.5 mr-1.5" />Prefijo</>} hint="Al inicio del nombre">
      <input
        type="text"
        value={settings.imageNamePrefix}
        onChange={e => onChange({ ...settings, imageNamePrefix: e.target.value })}
        placeholder="imagen, foto…"
        className={inputCls}
      />
    </Field>
    <Field label={<><Hash className="w-3.5 h-3.5 mr-1.5" />ID / SDK</>} hint="Al final del nombre">
      <input
        type="text"
        value={settings.sdkSuffix}
        onChange={e => onChange({ ...settings, sdkSuffix: e.target.value })}
        placeholder="A5455, ID001…"
        className={inputCls}
      />
    </Field>
  </div>
);

// ─── Sección universal: Redimensionamiento ───────────────────────────────────

const ResizeSection: React.FC<{
  settings: ConversionSettings;
  onChange: (s: ConversionSettings) => void;
}> = ({ settings, onChange }) => {
  const r = settings.resize ?? { enabled: false, width: 1920, height: 1080, maintainAspectRatio: true };
  const set = (patch: Partial<typeof r>) => onChange({ ...settings, resize: { ...r, ...patch } });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Redimensionamiento</span>
        <button
          onClick={() => set({ enabled: !r.enabled })}
          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${r.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${r.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>
      {r.enabled && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <Field label={<><Maximize2 className="w-3.5 h-3.5 mr-1" />Ancho (px)</>}>
              <input type="number" value={r.width} onChange={e => set({ width: parseInt(e.target.value) || 0 })} min="1" max="10000" className={inputCls} />
            </Field>
            <Field label={<><Minimize2 className="w-3.5 h-3.5 mr-1" />Alto (px)</>}>
              <input type="number" value={r.height} onChange={e => set({ height: parseInt(e.target.value) || 0 })} min="1" max="10000" className={inputCls} />
            </Field>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={r.maintainAspectRatio}
              onChange={e => set({ maintainAspectRatio: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Mantener proporción</span>
          </label>
        </div>
      )}
    </div>
  );
};

// ─── Brand Selector ───────────────────────────────────────────────────────────

const BRAND_FILLED_KEY = '_brandFilledFields';

const buildBrandContext = (brand: Brand, modeId: string, base: Record<string, string>): Record<string, string> => {
  const ctx = { ...base, selectedBrandId: brand.id };
  const filled: string[] = [];
  const set = (k: string, v: string) => { ctx[k] = v; filled.push(k); };

  if (brand.websiteUrl)       set('websiteUrl',        brand.websiteUrl);
  if (brand.keywords?.length) set('keyword',           brand.keywords[0]);
  if (brand.tone)             set('brandTone',         brand.tone);
  if (brand.description)      set('brandDescription',  brand.description);
  if (brand.industry)         set('brandIndustry',     brand.industry);
  if (brand.language)         set('brandLanguage',     brand.language);
  if (brand.hashtags?.length) set('brandHashtags',     brand.hashtags.join(' '));
  if (brand.socialHandle)     set('brandSocialHandle', brand.socialHandle);
  if (brand.name) {
    if (modeId === 'services')     set('companyName', brand.name);
    if (modeId === 'social_media') set('brand',       brand.name);
    if (modeId === 'catalog')      set('supplier',    brand.name);
  }
  ctx[BRAND_FILLED_KEY] = filled.join(',');
  return ctx;
};

const clearBrandContext = (ctx: Record<string, string>): Record<string, string> => {
  const updated = { ...ctx };
  const filled = (ctx[BRAND_FILLED_KEY] ?? '').split(',').filter(Boolean);
  for (const f of filled) delete updated[f];
  delete updated.selectedBrandId;
  delete updated[BRAND_FILLED_KEY];
  return updated;
};

const isBrandField = (ctx: Record<string, string>, field: string) =>
  (ctx[BRAND_FILLED_KEY] ?? '').split(',').includes(field);

interface BrandSelectorProps {
  brands: Brand[];
  ctx: Record<string, string>;
  onChange: (c: Record<string, string>) => void;
  modeId: string;
  onManage: () => void;
  onApplyToAll?: (brandId: string) => void;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({ brands, ctx, onChange, modeId, onManage, onApplyToAll }) => {
  const selectedBrand = brands.find(b => b.id === ctx.selectedBrandId);

  const applyBrand = (brandId: string) => {
    if (!brandId) { onChange(clearBrandContext(ctx)); return; }
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;
    onChange(buildBrandContext(brand, modeId, ctx));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-2.5 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
        {selectedBrand?.logoUrl ? (
          <img src={selectedBrand.logoUrl} alt={selectedBrand.name} className="w-5 h-5 rounded object-cover flex-shrink-0" />
        ) : (
          <Building2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        )}
        <select
          value={ctx.selectedBrandId ?? ''}
          onChange={e => applyBrand(e.target.value)}
          className="flex-1 text-sm bg-transparent border-0 focus:ring-0 text-gray-700 min-w-0"
        >
          <option value="">— Sin marca —</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button onClick={onManage} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors whitespace-nowrap" title="Gestionar marcas">
          Gestionar
        </button>
      </div>

      {/* Apply to all modes */}
      {selectedBrand && onApplyToAll && (
        <button
          onClick={() => onApplyToAll(selectedBrand.id)}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-100 rounded-lg transition-colors"
          title="Aplicar esta marca a todos los modos"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
          Aplicar a todos los modos
        </button>
      )}

      {/* Tone + industry summary */}
      {selectedBrand && (selectedBrand.tone || selectedBrand.industry || selectedBrand.language) && (
        <div className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg flex flex-wrap gap-x-3 gap-y-0.5">
          {selectedBrand.tone     && <span className="text-xs text-indigo-600"><span className="text-indigo-400">Tono:</span> {selectedBrand.tone}</span>}
          {selectedBrand.industry && <span className="text-xs text-indigo-600"><span className="text-indigo-400">Industria:</span> {selectedBrand.industry}</span>}
          {selectedBrand.language && <span className="text-xs text-indigo-600"><span className="text-indigo-400">Idioma:</span> {selectedBrand.language}</span>}
        </div>
      )}

      {/* Keyword picker */}
      {selectedBrand && (selectedBrand.keywords?.length ?? 0) > 0 && (
        <div className="px-2.5 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
          <p className="text-xs text-indigo-400 mb-1.5 font-medium">Palabra clave activa</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedBrand.keywords!.map(kw => (
              <button
                key={kw}
                onClick={() => onChange({ ...ctx, keyword: kw })}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  ctx.keyword === kw ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Contexto E-commerce ──────────────────────────────────────────────────────

const EcommerceContext: React.FC<{ ctx: Record<string, string>; onChange: (c: Record<string, string>) => void }> = ({ ctx, onChange }) => (
  <div className="space-y-3">
    <SectionTitle icon={<ShoppingBag className="w-4 h-4" />} title="Contexto del producto" />
    <Field label="Descripción del producto" hint="ChatGPT la usará para generar contenido más preciso">
      <textarea
        value={ctx.productDescription ?? ''}
        onChange={e => onChange({ ...ctx, productDescription: e.target.value })}
        placeholder="Describe el producto, sus características, materiales, uso, precio aproximado…"
        rows={4}
        className={textareaCls}
      />
    </Field>
    <KeywordField ctx={ctx} onChange={onChange} />
    <WebsiteField ctx={ctx} onChange={onChange} />
  </div>
);

// ─── Contexto Servicios ───────────────────────────────────────────────────────

const TONE_OPTIONS_SERVICES = ['Profesional', 'Amigable', 'Técnico', 'Formal', 'Inspirador', 'Directo'];

const ServicesContext: React.FC<{ ctx: Record<string, string>; onChange: (c: Record<string, string>) => void }> = ({ ctx, onChange }) => {
  const set = (key: string, val: string) => onChange({ ...ctx, [key]: val });
  return (
    <div className="space-y-3">
      <SectionTitle icon={<Briefcase className="w-4 h-4" />} title="Contexto del servicio" />
      <Field label={<><Building2 className="w-3.5 h-3.5 mr-1.5" />Empresa / Marca</>}>
        <input type="text" value={ctx.companyName ?? ''} onChange={e => set('companyName', e.target.value)} placeholder="Nombre de tu empresa" className={inputCls} />
      </Field>
      <Field label={<><Briefcase className="w-3.5 h-3.5 mr-1.5" />Tipo de servicio</>}>
        <input type="text" value={ctx.serviceType ?? ''} onChange={e => set('serviceType', e.target.value)} placeholder="Ej: consultoría, diseño, limpieza…" className={inputCls} />
      </Field>
      <Field label={<><Users className="w-3.5 h-3.5 mr-1.5" />Público objetivo</>}>
        <input type="text" value={ctx.targetAudience ?? ''} onChange={e => set('targetAudience', e.target.value)} placeholder="Ej: empresas medianas, jóvenes 18-35…" className={inputCls} />
      </Field>
      <Field label="Tono de comunicación">
        <select value={ctx.tone ?? ''} onChange={e => set('tone', e.target.value)} className={selectCls}>
          <option value="">— Sin especificar —</option>
          {TONE_OPTIONS_SERVICES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <WebsiteField ctx={ctx} onChange={onChange} />
    </div>
  );
};

// ─── Contexto Blog / General ──────────────────────────────────────────────────

const GeneralContext: React.FC<{ ctx: Record<string, string>; onChange: (c: Record<string, string>) => void }> = ({ ctx, onChange }) => {
  const set = (key: string, val: string) => onChange({ ...ctx, [key]: val });
  return (
    <div className="space-y-3">
      <SectionTitle icon={<Image className="w-4 h-4" />} title="Contexto del contenido" />
      <Field label={<><Layers className="w-3.5 h-3.5 mr-1.5" />Tema / Categoría</>}>
        <input type="text" value={ctx.theme ?? ''} onChange={e => set('theme', e.target.value)} placeholder="Ej: viajes, tecnología, gastronomía…" className={inputCls} />
      </Field>
      <Field label={<><Globe className="w-3.5 h-3.5 mr-1.5" />Palabras clave SEO</>} hint="Separadas por coma">
        <input type="text" value={ctx.seoKeywords ?? ''} onChange={e => set('seoKeywords', e.target.value)} placeholder="keyword1, keyword2, keyword3" className={inputCls} />
      </Field>
      <Field label={<><Users className="w-3.5 h-3.5 mr-1.5" />Audiencia objetivo</>}>
        <input type="text" value={ctx.audience ?? ''} onChange={e => set('audience', e.target.value)} placeholder="Ej: lectores de tecnología, millennials…" className={inputCls} />
      </Field>
      <WebsiteField ctx={ctx} onChange={onChange} />
    </div>
  );
};

// ─── Contexto Redes Sociales ──────────────────────────────────────────────────

const PLATFORMS = ['Instagram', 'TikTok', 'Twitter / X', 'LinkedIn', 'Facebook', 'Pinterest', 'General'];
const TONE_OPTIONS_SOCIAL = ['Casual', 'Inspirador', 'Informativo', 'Humorístico', 'Profesional', 'Emotivo'];
const HASHTAG_LANGS = ['Español', 'Inglés', 'Ambos'];

const SocialMediaContext: React.FC<{ ctx: Record<string, string>; onChange: (c: Record<string, string>) => void }> = ({ ctx, onChange }) => {
  const set = (key: string, val: string) => onChange({ ...ctx, [key]: val });
  return (
    <div className="space-y-3">
      <SectionTitle icon={<Share2 className="w-4 h-4" />} title="Contexto de redes sociales" />
      <Field label="Plataforma objetivo">
        <select value={ctx.platform ?? ''} onChange={e => set('platform', e.target.value)} className={selectCls}>
          <option value="">— Sin especificar —</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="Tono del caption">
        <select value={ctx.tone ?? ''} onChange={e => set('tone', e.target.value)} className={selectCls}>
          <option value="">— Sin especificar —</option>
          {TONE_OPTIONS_SOCIAL.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label={<><AtSign className="w-3.5 h-3.5 mr-1.5" />Idioma de hashtags</>}>
        <select value={ctx.hashtagLanguage ?? ''} onChange={e => set('hashtagLanguage', e.target.value)} className={selectCls}>
          <option value="">— Sin especificar —</option>
          {HASHTAG_LANGS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </Field>
      <Field label={<><Building2 className="w-3.5 h-3.5 mr-1.5" />Marca / Perfil</>} hint="Para personalizar el estilo">
        <input type="text" value={ctx.brand ?? ''} onChange={e => set('brand', e.target.value)} placeholder="Ej: @mimarca, Nike, Zara…" className={inputCls} />
      </Field>
      <WebsiteField ctx={ctx} onChange={onChange} />
    </div>
  );
};

// ─── Contexto Catálogo / Inventario ───────────────────────────────────────────

const CatalogContext: React.FC<{ ctx: Record<string, string>; onChange: (c: Record<string, string>) => void }> = ({ ctx, onChange }) => {
  const set = (key: string, val: string) => onChange({ ...ctx, [key]: val });
  return (
    <div className="space-y-3">
      <SectionTitle icon={<Archive className="w-4 h-4" />} title="Contexto del catálogo" />
      <Field label={<><Layers className="w-3.5 h-3.5 mr-1.5" />Categoría principal</>}>
        <input type="text" value={ctx.catalogCategory ?? ''} onChange={e => set('catalogCategory', e.target.value)} placeholder="Ej: Electrónica, Ropa, Herramientas…" className={inputCls} />
      </Field>
      <Field label={<><Barcode className="w-3.5 h-3.5 mr-1.5" />Prefijo de SKU</>} hint="Se sugerirá como base para el código">
        <input type="text" value={ctx.skuPrefix ?? ''} onChange={e => set('skuPrefix', e.target.value)} placeholder="Ej: ELEC-, ROPA-, TOOL-" className={inputCls} />
      </Field>
      <Field label={<><Building2 className="w-3.5 h-3.5 mr-1.5" />Proveedor / Marca</>}>
        <input type="text" value={ctx.supplier ?? ''} onChange={e => set('supplier', e.target.value)} placeholder="Ej: Samsung, Levi's…" className={inputCls} />
      </Field>
      <Field label="Unidad de medida">
        <input type="text" value={ctx.unit ?? ''} onChange={e => set('unit', e.target.value)} placeholder="Ej: unidad, kg, m², caja…" className={inputCls} />
      </Field>
      <WebsiteField ctx={ctx} onChange={onChange} />
    </div>
  );
};

// ─── Contexto Personalizado ───────────────────────────────────────────────────

const CustomContext: React.FC<{ ctx: Record<string, string>; onChange: (c: Record<string, string>) => void }> = ({ ctx, onChange }) => (
  <div className="space-y-3">
    <SectionTitle icon={<Settings className="w-4 h-4" />} title="Contexto personalizado" />
    <Field label="Información adicional para la IA" hint="Describe el contexto, tono, audiencia o cualquier dato relevante">
      <textarea
        value={ctx.freeText ?? ''}
        onChange={e => onChange({ ...ctx, freeText: e.target.value })}
        placeholder="Escribe cualquier contexto que ayude a la IA a generar mejor contenido para este modo…"
        rows={5}
        className={textareaCls}
      />
    </Field>
    <KeywordField ctx={ctx} onChange={onChange} />
    <WebsiteField ctx={ctx} onChange={onChange} />
  </div>
);

// ─── Sidebar principal ────────────────────────────────────────────────────────

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  activeMode,
  modeContext,
  brands = [],
  onSettingsChange,
  onModeContextChange,
  onManageBrands,
  onApplyBrandToAllModes,
  onConvert,
  onConvertOnly,
  onDownloadConverted,
  onClearAll,
  onGenerateDescriptions,
  onExportDescriptions,
  isConverting,
  isGeneratingDescriptions = false,
  imageCount,
  convertedCount = 0,
  descriptionsCount = 0,
  chatGPTEnabled = false,
}) => {
  const busy = isConverting || isGeneratingDescriptions;

  const renderModeContext = () => {
    switch (activeMode.id) {
      case 'ecommerce':    return <EcommerceContext  ctx={modeContext} onChange={onModeContextChange} />;
      case 'services':     return <ServicesContext   ctx={modeContext} onChange={onModeContextChange} />;
      case 'general':      return <GeneralContext    ctx={modeContext} onChange={onModeContextChange} />;
      case 'social_media': return <SocialMediaContext ctx={modeContext} onChange={onModeContextChange} />;
      case 'catalog':      return <CatalogContext    ctx={modeContext} onChange={onModeContextChange} />;
      default:             return <CustomContext     ctx={modeContext} onChange={onModeContextChange} />;
    }
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Scrollable settings area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Configuración</h2>
        </div>

        {/* Formato + Calidad */}
        <FormatSection settings={settings} onChange={onSettingsChange} />

        {/* Nomenclatura */}
        <NamingSection settings={settings} onChange={onSettingsChange} />

        {/* Contexto por modo */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          {/* Selector de marca — compartido por todos los modos */}
          {brands.length > 0 ? (
            <BrandSelector
              brands={brands}
              ctx={modeContext}
              onChange={onModeContextChange}
              modeId={activeMode.id}
              onManage={onManageBrands ?? (() => {})}
              onApplyToAll={onApplyBrandToAllModes}
            />
          ) : (
            onManageBrands && (
              <button
                onClick={onManageBrands}
                className="w-full flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors px-1"
              >
                <Plus className="w-3 h-3" />
                Crear marcas
              </button>
            )
          )}
          {renderModeContext()}
        </div>

        {/* Redimensionamiento */}
        <div className="border-t border-gray-100 pt-4">
          <ResizeSection settings={settings} onChange={onSettingsChange} />
        </div>
      </div>

      {/* Acciones (fijas abajo) */}
      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 space-y-2">
        {/* Convertir */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onConvertOnly}
            disabled={imageCount === 0 || busy}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm"
          >
            <Package className="w-4 h-4" />
            <span>{isConverting ? 'Convirtiendo…' : 'Convertir'}</span>
          </button>
          <button
            onClick={onConvert}
            disabled={imageCount === 0 || busy}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm"
          >
            <Brain className="w-4 h-4" />
            <span>{isConverting ? 'Procesando…' : 'Convertir + IA'}</span>
          </button>
        </div>

        {/* Solo IA + Exportar */}
        {chatGPTEnabled && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onGenerateDescriptions}
              disabled={imageCount === 0 || busy}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm"
            >
              <Brain className="w-4 h-4" />
              <span>{isGeneratingDescriptions ? 'Generando…' : 'Solo IA'}</span>
            </button>
            {descriptionsCount > 0 && (
              <button
                onClick={onExportDescriptions}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Exportar ({descriptionsCount})</span>
              </button>
            )}
          </div>
        )}

        {/* Descargar + Limpiar */}
        <div className="grid grid-cols-2 gap-2">
          {convertedCount > 0 && (
            <button
              onClick={onDownloadConverted}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>{convertedCount > 1 ? `ZIP (${convertedCount})` : 'Descargar'}</span>
            </button>
          )}
          <button
            onClick={onClearAll}
            disabled={imageCount === 0 || busy}
            className={`bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-colors text-sm ${convertedCount === 0 ? 'col-span-2' : ''}`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpiar todo</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
