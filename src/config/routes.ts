// Configuración de rutas de la aplicación

export const ROUTES = {
  // Rutas principales
  MAIN: '/',
  CHATGPT_CONFIG: '/chatgpt-config',
  PROMPT_CONFIG: '/prompt-config',
  GMAIL_API_CONFIG: '/gmail-api-config',
  CURRENCY_API_CONFIG: '/currency-api-config',
  USAGE_HISTORY: '/usage-history',
  USER_MANAGEMENT: '/user-management',
  PROFILE_CONFIG: '/profile-config',
  
  // Rutas de autenticación
  GMAIL_CALLBACK: '/auth/callback',
  LOGIN: '/login',
  
  // Rutas de API (si es necesario)
  API: {
    HEALTH: '/api/health',
    CONFIG: '/api/config'
  }
} as const;

// Función para verificar si una ruta es válida
export const isValidRoute = (path: string): boolean => {
  return Object.values(ROUTES).includes(path as any) || 
         Object.values(ROUTES.API).includes(path as any);
};

// Función para obtener la ruta actual
export const getCurrentRoute = (): string => {
  return window.location.pathname;
};

// Función para verificar si estamos en una ruta específica
export const isCurrentRoute = (route: string): boolean => {
  return getCurrentRoute() === route;
};

// Función para verificar si estamos en la página de callback de Gmail
export const isGmailCallbackPage = (): boolean => {
  const currentPath = getCurrentRoute();
  const currentSearch = window.location.search;
  
  return currentPath === ROUTES.GMAIL_CALLBACK || 
         currentSearch.includes('code=') || 
         currentSearch.includes('error=');
};
