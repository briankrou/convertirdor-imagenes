import { AIProvider } from '../types';

export interface ProviderModel {
  id: string;
  label: string;
  description: string;
  price: string;
}

export interface ProviderInfo {
  id: AIProvider;
  label: string;
  shortLabel: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  activeTabClass: string;
  models: ProviderModel[];
  pricing: Record<string, { input: number; output: number }>;
}

export const AI_PROVIDERS: AIProvider[] = ['openai', 'anthropic', 'google', 'openrouter'];

export const AI_PROVIDER_INFO: Record<AIProvider, ProviderInfo> = {
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    shortLabel: 'OpenRouter',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-300',
    activeTabClass: 'border-violet-500 text-violet-700 bg-violet-50',
    models: [
      { id: 'openai/gpt-4.1',                             label: 'GPT-4.1 (via OR)',            description: 'OpenAI GPT-4.1 enrutado por OpenRouter',             price: '~$2.00 / 1M'  },
      { id: 'openai/gpt-4o',                              label: 'GPT-4o (via OR)',             description: 'OpenAI GPT-4o con visión',                          price: '~$2.50 / 1M'  },
      { id: 'openai/gpt-4o-mini',                         label: 'GPT-4o Mini (via OR)',        description: 'OpenAI GPT-4o Mini económico',                       price: '~$0.15 / 1M'  },
      { id: 'anthropic/claude-sonnet-4-6',                label: 'Claude Sonnet 4.6 (via OR)',  description: 'Anthropic Claude Sonnet enrutado por OpenRouter',     price: '~$3 / 1M'     },
      { id: 'anthropic/claude-haiku-4-5',                 label: 'Claude Haiku 4.5 (via OR)',   description: 'Anthropic Claude Haiku, rápido y barato',            price: '~$0.80 / 1M'  },
      { id: 'google/gemini-2.5-flash',                    label: 'Gemini 2.5 Flash (via OR)',   description: 'Google Gemini Flash enrutado por OpenRouter',        price: '~$0.15 / 1M'  },
      { id: 'google/gemini-2.5-pro',                      label: 'Gemini 2.5 Pro (via OR)',     description: 'Google Gemini Pro con visión avanzada',              price: '~$1.25 / 1M'  },
      { id: 'meta-llama/llama-3.2-90b-vision-instruct',   label: 'Llama 3.2 90B Vision',       description: 'Meta Llama con capacidad de visión, open source',    price: '~$0.90 / 1M'  },
      { id: 'mistralai/mistral-medium-3',                 label: 'Mistral Medium 3',            description: 'Mistral con visión, buena relación calidad/precio',  price: '~$0.40 / 1M'  },
      { id: 'qwen/qwen2.5-vl-72b-instruct',               label: 'Qwen 2.5 VL 72B',            description: 'Alibaba Qwen Vision Language, excelente para imágenes', price: '~$0.40 / 1M' },
    ],
    pricing: {
      'openai/gpt-4.1':                           { input: 0.002,    output: 0.008    },
      'openai/gpt-4o':                            { input: 0.0025,   output: 0.010    },
      'openai/gpt-4o-mini':                       { input: 0.000150, output: 0.000600 },
      'anthropic/claude-sonnet-4-6':              { input: 0.003,    output: 0.015    },
      'anthropic/claude-haiku-4-5':               { input: 0.0008,   output: 0.004    },
      'google/gemini-2.5-flash':                  { input: 0.000150, output: 0.000600 },
      'google/gemini-2.5-pro':                    { input: 0.00125,  output: 0.010    },
      'meta-llama/llama-3.2-90b-vision-instruct': { input: 0.0009,   output: 0.0009   },
      'mistralai/mistral-medium-3':               { input: 0.0004,   output: 0.002    },
      'qwen/qwen2.5-vl-72b-instruct':             { input: 0.0004,   output: 0.0004   },
    },
  },
  openai: {
    id: 'openai',
    label: 'OpenAI (GPT)',
    shortLabel: 'OpenAI',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    activeTabClass: 'border-emerald-500 text-emerald-700 bg-emerald-50',
    models: [
      { id: 'gpt-4.1',       label: 'GPT-4.1',        description: 'Flagship más reciente con visión (abr 2025)', price: '$2.00 / 1M' },
      { id: 'gpt-4o',        label: 'GPT-4o',          description: 'Multimodal estable, excelente para imágenes', price: '$2.50 / 1M' },
      { id: 'gpt-4.1-mini',  label: 'GPT-4.1 Mini',   description: 'Ligero, rápido y eficiente con visión',       price: '$0.40 / 1M' },
      { id: 'gpt-4.1-nano',  label: 'GPT-4.1 Nano',   description: 'Más barato con visión, ideal para volumen',   price: '$0.10 / 1M' },
      { id: 'gpt-4o-mini',   label: 'GPT-4o Mini',    description: 'Versión económica de GPT-4o',                 price: '$0.15 / 1M' },
      { id: 'o4-mini',       label: 'o4-mini',         description: 'Razonamiento eficiente con visión',            price: '$1.10 / 1M' },
      { id: 'o3',            label: 'o3',              description: 'Razonamiento profundo, análisis visual (lento)', price: '$2.00 / 1M' },
    ],
    pricing: {
      'gpt-4o':        { input: 0.0025,   output: 0.010    },
      'gpt-4o-mini':   { input: 0.000150, output: 0.000600 },
      'gpt-4.1':       { input: 0.002,    output: 0.008    },
      'gpt-4.1-mini':  { input: 0.0004,   output: 0.0016   },
      'gpt-4.1-nano':  { input: 0.0001,   output: 0.0004   },
      'o3':            { input: 0.002,    output: 0.008    },
      'o4-mini':       { input: 0.0011,   output: 0.0044   },
    },
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    shortLabel: 'Anthropic',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    activeTabClass: 'border-orange-500 text-orange-700 bg-orange-50',
    models: [
      { id: 'claude-opus-4-8',           label: 'Claude Opus 4.8',   description: 'Más capaz de Claude, análisis visual profundo', price: '$15 / 1M'   },
      { id: 'claude-sonnet-4-6',         label: 'Claude Sonnet 4.6', description: 'Balance ideal entre calidad y velocidad',       price: '$3 / 1M'    },
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5',  description: 'Rápido y económico con visión',                 price: '$0.80 / 1M' },
    ],
    pricing: {
      'claude-opus-4-8':           { input: 0.015,  output: 0.075 },
      'claude-sonnet-4-6':         { input: 0.003,  output: 0.015 },
      'claude-haiku-4-5-20251001': { input: 0.0008, output: 0.004 },
    },
  },
  google: {
    id: 'google',
    label: 'Google (Gemini)',
    shortLabel: 'Google',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    activeTabClass: 'border-blue-500 text-blue-700 bg-blue-50',
    models: [
      { id: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro',        description: 'Más capaz de Gemini, visión avanzada',   price: '$1.25 / 1M' },
      { id: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash',      description: 'Rápido y eficiente, buen equilibrio',    price: '$0.15 / 1M' },
      { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', description: 'El más económico de Gemini con visión',  price: '$0.06 / 1M' },
    ],
    pricing: {
      'gemini-2.5-pro':        { input: 0.00125,  output: 0.010    },
      'gemini-2.5-flash':      { input: 0.000150, output: 0.000600 },
      'gemini-2.5-flash-lite': { input: 0.000060, output: 0.000250 },
    },
  },
};

export function getPricing(
  provider: AIProvider,
  model: string
): { input: number; output: number } | null {
  return AI_PROVIDER_INFO[provider]?.pricing[model] ?? null;
}

export function getDefaultModel(provider: AIProvider): string {
  return AI_PROVIDER_INFO[provider]?.models[0]?.id ?? '';
}

export function getProviderLabel(provider: AIProvider): string {
  return AI_PROVIDER_INFO[provider]?.shortLabel ?? provider;
}

export function getModelLabel(provider: AIProvider, modelId: string): string {
  return AI_PROVIDER_INFO[provider]?.models.find(m => m.id === modelId)?.label ?? modelId;
}
