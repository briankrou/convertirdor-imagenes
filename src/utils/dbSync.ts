// Utilidad para sincronizar datos entre el archivo JSON y localStorage

export class DatabaseSync {
  private static readonly DB_PATH = './src/db/db.json';
  private static readonly LOCAL_STORAGE_KEY = 'image-converter-db';

  // Cargar datos desde el archivo JSON
  static async loadFromFile(): Promise<any> {
    try {
      const response = await fetch(this.DB_PATH);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('No se pudo cargar desde el archivo JSON:', error);
    }
    return null;
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

  // Sincronizar datos (priorizar archivo JSON si existe)
  static async syncData(): Promise<any> {
    const fileData = await this.loadFromFile();
    const localData = this.loadFromLocalStorage();

    if (fileData && localData) {
      // Comparar timestamps para determinar cuál es más reciente
      const fileTime = new Date(fileData.lastUpdated).getTime();
      const localTime = new Date(localData.lastUpdated).getTime();
      
      if (fileTime > localTime) {
        // El archivo es más reciente, actualizar localStorage
        this.saveToLocalStorage(fileData);
        return fileData;
      } else {
        // localStorage es más reciente, mantenerlo
        return localData;
      }
    } else if (fileData) {
      // Solo existe el archivo, sincronizar con localStorage
      this.saveToLocalStorage(fileData);
      return fileData;
    } else if (localData) {
      // Solo existe localStorage, mantenerlo
      return localData;
    } else {
      // No existe ninguno, crear estructura por defecto
      const defaultData = {
        userSettings: {},
        lastUpdated: new Date().toISOString()
      };
      this.saveToLocalStorage(defaultData);
      return defaultData;
    }
  }

  // Exportar datos actuales a un archivo (para desarrollo)
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
