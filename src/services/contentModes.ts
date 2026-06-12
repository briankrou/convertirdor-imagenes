import { ContentModeConfig, ContentMode, ModePromptConfig, PerModeContext } from '../types';

export const CONTENT_MODES: ContentModeConfig[] = [
  {
    id: 'ecommerce',
    label: 'E-commerce / Productos',
    icon: 'ShoppingBag',
    fields: [
      { key: 'title', label: 'Título del producto', enabled: true, maxLength: 60 },
      { key: 'description', label: 'Descripción', enabled: true, maxLength: 300 },
      { key: 'alt_text', label: 'Texto alternativo', enabled: true, maxLength: 125 },
      { key: 'caption', label: 'Caption', enabled: true },
    ],
    defaultPrompt: 'Analiza esta imagen de producto y genera un título atractivo, descripción comercial, texto alt para SEO y un caption breve.',
  },
  {
    id: 'services',
    label: 'Servicios',
    icon: 'Briefcase',
    fields: [
      { key: 'title', label: 'Nombre del servicio', enabled: true },
      { key: 'description', label: 'Descripción de beneficios', enabled: true },
      { key: 'cta', label: 'Llamada a la acción', enabled: true },
      { key: 'alt_text', label: 'Texto alternativo', enabled: true, maxLength: 125 },
    ],
    defaultPrompt: 'Analiza esta imagen relacionada con un servicio profesional y genera un nombre, descripción de beneficios para el cliente, una llamada a la acción y texto alt.',
  },
  {
    id: 'general',
    label: 'Imágenes generales / Blog',
    icon: 'Image',
    fields: [
      { key: 'caption', label: 'Caption', enabled: true },
      { key: 'description', label: 'Descripción', enabled: true },
      { key: 'alt_text', label: 'Texto alternativo', enabled: true, maxLength: 125 },
      { key: 'tags', label: 'Tags/Keywords', enabled: true },
    ],
    defaultPrompt: 'Describe esta imagen de forma general, genera un caption, descripción breve, texto alt y palabras clave relevantes.',
  },
  {
    id: 'social_media',
    label: 'Redes Sociales',
    icon: 'Share2',
    fields: [
      { key: 'headline', label: 'Headline del anuncio', enabled: true, maxLength: 80, applicableTypes: ['Feed', 'Anuncio (Ad)', 'Carousel'] },
      { key: 'caption', label: 'Caption con hashtags', enabled: true, applicableTypes: ['Feed', 'Anuncio (Ad)', 'Carousel'] },
      { key: 'hook_text', label: 'Texto corto (Gancho / Diapositiva 1 / Story)', enabled: true, maxLength: 150 },
      { key: 'cta', label: 'Llamada a la acción (CTA)', enabled: true },
      { key: 'alt_text', label: 'Texto alternativo', enabled: true, maxLength: 125 },
      { key: 'hashtags', label: 'Hashtags sugeridos', enabled: true, applicableTypes: ['Feed', 'Carousel'] },
      { key: 'first_comment', label: 'Primer comentario', enabled: true, applicableTypes: ['Feed', 'Anuncio (Ad)', 'Carousel'] },
      { key: 'target_audience', label: 'Audiencia sugerida', enabled: true },
    ],
    defaultPrompt: 'Analiza esta imagen y actúa como un experto en Social Media Ads. Genera contenido publicitario de alto impacto siguiendo la estructura: GANCHO (Headline), DESARROLLO (Valor) y CTA (Acción). La Prueba Social es opcional pero recomendada. Asegúrate de adaptar el tono y longitud según el Tipo de Publicación especificado en el contexto.',
  },
  {
    id: 'catalog',
    label: 'Catálogo / Inventario',
    icon: 'Archive',
    fields: [
      { key: 'title', label: 'Nombre del artículo', enabled: true },
      { key: 'category', label: 'Categoría sugerida', enabled: true },
      { key: 'description', label: 'Descripción técnica', enabled: true },
      { key: 'alt_text', label: 'Texto alternativo', enabled: true, maxLength: 125 },
    ],
    defaultPrompt: 'Analiza esta imagen para un catálogo de inventario. Genera nombre del artículo, categoría sugerida, descripción técnica breve y texto alt.',
  },
  {
    id: 'custom',
    label: 'Personalizado',
    icon: 'Settings',
    fields: [],
    defaultPrompt: '',
  },
];

export function getContentModeById(
  id: ContentMode,
  customModes?: ContentModeConfig[]
): ContentModeConfig {
  if (customModes) {
    const found = customModes.find(m => m.id === id);
    if (found) return found;
  }
  return CONTENT_MODES.find(m => m.id === id) ?? CONTENT_MODES[0];
}

// Ensambla el contexto adicional de un modo a partir de su mapa de valores
export function buildContextString(modeId: ContentMode, ctx: Record<string, string>): string {
  const p: string[] = [];

  switch (modeId) {
    case 'ecommerce':
      if (ctx.productDescription) p.push(`Producto: ${ctx.productDescription}`);
      break;

    case 'services':
      if (ctx.companyName) p.push(`Empresa: ${ctx.companyName}`);
      if (ctx.serviceType) p.push(`Tipo de servicio: ${ctx.serviceType}`);
      if (ctx.targetAudience) p.push(`Público objetivo: ${ctx.targetAudience}`);
      if (ctx.tone) p.push(`Tono: ${ctx.tone}`);
      break;

    case 'general':
      if (ctx.theme) p.push(`Tema/Categoría: ${ctx.theme}`);
      if (ctx.seoKeywords) p.push(`Palabras clave SEO: ${ctx.seoKeywords}`);
      if (ctx.audience) p.push(`Audiencia: ${ctx.audience}`);
      break;

    case 'social_media':
      if (ctx.platform) p.push(`Plataforma: ${ctx.platform}`);

      if (ctx.publicationType) {
        p.push(`Tipo de publicación: ${ctx.publicationType}`);
        const typeRules: Record<string, string> = {
          'Feed': 'Regla: Estructura completa (Gancho, Valor, CTA). Longitud media. Mezcla de hashtags estratégica.',
          'Stories / Reels': 'Regla: Extrema brevedad. Enfócate en el campo "hook_text" (texto que iría sobre la imagen). Tono energético. CTA directo.',
          'Anuncio (Ad)': 'Regla: 100% orientado a conversión. Gancho muy fuerte. Omitir hashtags para evitar distracciones.',
          'Carousel': 'Regla: ESTRUCTURA POR DIAPOSITIVAS. En el campo "caption", genera una secuencia numerada: "Diapositiva 1:...", "Diapositiva 2:...", etc. Usa el campo "hook_text" como el título de la carátula.',
        };
        if (typeRules[ctx.publicationType]) p.push(typeRules[ctx.publicationType]);
      }

      if (ctx.adObjective) p.push(`Objetivo del anuncio: ${ctx.adObjective}`);
      if (ctx.tone) p.push(`Tono: ${ctx.tone}`);
      if (ctx.offer) p.push(`Oferta activa: ${ctx.offer}`);
      if (ctx.location) p.push(`Ubicación: ${ctx.location}`);
      if (ctx.contactInfo) p.push(`Contacto/Enlace: ${ctx.contactInfo}`);
      if (ctx.target_audience) p.push(`PERFIL DEL CLIENTE IDEAL (TARGET): ${ctx.target_audience}`);

      if (ctx.ctaPlacement) {
        const placements: Record<string, string> = {
          'in_caption': 'Instrucción de CTA: Incluir el enlace/acción directamente al final del caption.',
          'first_comment': 'Instrucción de CTA: NO incluyas el enlace en el caption. Ponlo exclusivamente en el campo "first_comment".',
          'none': 'Instrucción de CTA: No incluyas links ni CTAs específicos.',
        };
        p.push(placements[ctx.ctaPlacement] ?? `CTA: ${ctx.ctaPlacement}`);
      }

      if (ctx.publicationType === 'Anuncio (Ad)') {
        p.push('Hashtags: Omitir hashtags en el caption.');
      } else if (ctx.publicationType !== 'Stories / Reels') {
        p.push('Hashtags: ESTRATEGIA DE 3 NIVELES (Nicho 2-3, Comunidad 3-4, Marca 1-2).');
      }

      if (ctx.brand?.trim())             p.push(`Marca/Perfil: ${ctx.brand.trim()}`);
      if (ctx.hashtagLanguage?.trim())   p.push(`Idioma de los hashtags: ${ctx.hashtagLanguage.trim()}`);
      if (ctx.brandSocialHandle?.trim()) p.push(`Handle de la marca: ${ctx.brandSocialHandle.trim()}`);
      if (ctx.brandHashtags?.trim())     p.push(`Hashtags de la marca: ${ctx.brandHashtags.trim()}`);
      break;

    case 'catalog':
      if (ctx.catalogCategory) p.push(`Categoría: ${ctx.catalogCategory}`);
      if (ctx.skuPrefix) p.push(`Prefijo SKU: ${ctx.skuPrefix}`);
      if (ctx.supplier) p.push(`Proveedor/Marca: ${ctx.supplier}`);
      if (ctx.unit) p.push(`Unidad de medida: ${ctx.unit}`);
      break;

    case 'custom':
      if (ctx.freeText) return ctx.freeText;
      break;

    default:
      // Modo personalizado con label como key: serializar todo
      return Object.entries(ctx)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join('. ');
  }

  if (ctx.brandDescription?.trim()) p.push(`Descripción de la marca: ${ctx.brandDescription.trim()}`);
  if (ctx.brandIndustry?.trim()) p.push(`Industria: ${ctx.brandIndustry.trim()}`);
  if (ctx.brandTone?.trim()) p.push(`Tono de voz de la marca: ${ctx.brandTone.trim()}`);
  if (ctx.brandLanguage?.trim()) p.push(`Idioma del contenido: ${ctx.brandLanguage.trim()}`);
  if (ctx.keyword?.trim()) p.push(`Palabra clave principal: ${ctx.keyword.trim()}`);
  if (ctx.websiteUrl?.trim()) p.push(`Sitio web de la marca: ${ctx.websiteUrl.trim()}`);

  return p.join('. ');
}

// Devuelve el contexto del modo activo listo para pasar a la IA
export function getActiveContext(
  modeId: ContentMode,
  perModeContext: PerModeContext,
  fallbackProductDescription?: string
): string {
  const ctx = perModeContext[modeId] ?? {};

  if (modeId === 'ecommerce') {
    const parts: string[] = [];
    const desc = ctx.productDescription ?? fallbackProductDescription ?? '';
    if (desc) parts.push(desc);
    if (ctx.keyword?.trim()) parts.push(`Palabra clave principal: ${ctx.keyword.trim()}`);
    if (ctx.websiteUrl?.trim()) parts.push(`Sitio web de la marca: ${ctx.websiteUrl.trim()}`);
    return parts.join('. ');
  }

  return buildContextString(modeId, ctx);
}

export function buildPrompt(
  config: ContentModeConfig,
  imageName: string,
  context?: string,
  namePrefix?: string,
  customConfig?: ModePromptConfig,
  rawContext?: Record<string, string>
): string {
  const enabledFields = getEffectiveFields(config, rawContext);

  if (enabledFields.length === 0) {
    return `Describe detalladamente la siguiente imagen: ${imageName}`;
  }

  const useCustom = customConfig?.useCustom ?? false;

  const effectiveDefaultPrompt = useCustom && customConfig?.defaultPrompt?.trim()
    ? customConfig.defaultPrompt
    : config.defaultPrompt;

  const jsonShape = enabledFields
    .map(f => {
      const customInstruction = useCustom ? customConfig?.fieldPrompts?.[f.key] : undefined;
      let hint: string;
      if (customInstruction?.trim()) {
        hint = customInstruction;
      } else {
        hint = f.maxLength ? `${f.label} (máx. ${f.maxLength} caracteres)` : f.label;
      }
      return `  "${f.key}": "[${hint}]"`;
    })
    .join(',\n');

  let prompt = effectiveDefaultPrompt
    ? `${effectiveDefaultPrompt}\n\n`
    : 'Analiza esta imagen y genera el siguiente contenido.\n\n';

  prompt += `Archivo: ${imageName}\n\n`;
  prompt += `Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta (sin texto adicional, sin bloques de código markdown):\n{\n${jsonShape}\n}`;

  if (context?.trim()) {
    prompt += `\n\nCONTEXTO ADICIONAL: ${context}`;
  }
  if (namePrefix?.trim()) {
    prompt += `\n\nPREFIJO/NOMBRE BASE: ${namePrefix}`;
  }

  return prompt;
}

/**
 * Filtra los campos habilitados y aplicables según el contexto actual (especialmente publicationType)
 */
export function getEffectiveFields(config: ContentModeConfig, context?: Record<string, string>) {
  const pubType = context?.publicationType;
  return config.fields.filter(f => {
    if (!f.enabled) return false;
    if (pubType && f.applicableTypes && f.applicableTypes.length > 0) {
      return f.applicableTypes.includes(pubType);
    }
    return true;
  });
}
