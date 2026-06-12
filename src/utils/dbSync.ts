export class DatabaseSync {
  private static readonly LOCAL_STORAGE_KEY = 'image-converter-db';
  private static readonly API_URL = '/api/db';

  // Cargar datos desde el servidor (API REST)
  static async loadFromServer(): Promise<any> {
    try {
      const response = await fetch(this.API_URL, { cache: 'no-store' });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Servidor no disponible (modo dev con Vite solo)
    }
    return null;
  }

  // Guardar datos en el servidor
  static async saveToServer(data: any): Promise<boolean> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch {
      // Servidor no disponible
      return false;
    }
  }

  // Cargar datos desde localStorage
  static loadFromLocalStorage(): any {
    try {
      const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('No se pudo cargar desde localStorage:', error);
      return null;
    }
  }

  // Guardar datos en localStorage
  static saveToLocalStorage(data: any): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  }

  // Sincronizar datos: prioriza servidor, usa localStorage como respaldo
  static async syncData(): Promise<any> {
    const serverData = await this.loadFromServer();
    const localData = this.loadFromLocalStorage();

    if (serverData && localData) {
      const serverTime = new Date(serverData.lastUpdated ?? 0).getTime();
      const localTime = new Date(localData.lastUpdated ?? 0).getTime();
      // Usar el más reciente
      const winner = serverTime >= localTime ? serverData : localData;
      // Mantener localStorage sincronizado con el ganador
      this.saveToLocalStorage(winner);
      return winner;
    }

    if (serverData) {
      this.saveToLocalStorage(serverData);
      return serverData;
    }

    if (localData) {
      return localData;
    }

    const defaultData = {
      userSettings: {},
      lastUpdated: new Date().toISOString(),
    };
    this.saveToLocalStorage(defaultData);
    return defaultData;
  }

  // Exportar datos actuales a un archivo (descarga en el navegador)
  static exportToFile(): void {
    const data = this.loadFromLocalStorage();
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'db-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
}
