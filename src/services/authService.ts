import { User, AuthState } from '../types';

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private users: User[] = [];

  private constructor() {
    this.initializeDefaultUsers();
    this.loadUsers();
    this.loadCurrentUser();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private initializeDefaultUsers(): void {
    const defaultUsers: User[] = [
      {
        id: 'root-user',
        username: 'root',
        password: '12345',
        isRoot: true,
        createdAt: new Date().toISOString()
      }
    ];

    const stored = localStorage.getItem('app-users');
    if (!stored) {
      localStorage.setItem('app-users', JSON.stringify(defaultUsers));
    }
  }

  private loadUsers(): void {
    try {
      const stored = localStorage.getItem('app-users');
      if (stored) {
        this.users = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.users = [];
    }
  }

  private saveUsers(): void {
    try {
      localStorage.setItem('app-users', JSON.stringify(this.users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  private loadCurrentUser(): void {
    try {
      const stored = localStorage.getItem('current-user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      this.currentUser = null;
    }
  }

  private saveCurrentUser(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem('current-user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('current-user');
      }
    } catch (error) {
      console.error('Error saving current user:', error);
    }
  }

  public async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = this.users.find(u => u.username === username && u.password === password);
      
      if (!user) {
        return { success: false, error: 'Usuario o contraseña incorrectos' };
      }

      // Actualizar último login
      user.lastLogin = new Date().toISOString();
      this.saveUsers();

      this.currentUser = user;
      this.saveCurrentUser();

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error interno del sistema' };
    }
  }

  public logout(): void {
    this.currentUser = null;
    this.saveCurrentUser();
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public isRoot(): boolean {
    return this.currentUser?.isRoot === true;
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public async createUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isRoot()) {
      return { success: false, error: 'Solo el usuario root puede crear nuevos usuarios' };
    }

    if (this.users.some(u => u.username === username)) {
      return { success: false, error: 'El nombre de usuario ya existe' };
    }

    if (username.length < 3) {
      return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres' };
    }

    if (password.length < 4) {
      return { success: false, error: 'La contraseña debe tener al menos 4 caracteres' };
    }

    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        password,
        isRoot: false,
        createdAt: new Date().toISOString()
      };

      this.users.push(newUser);
      this.saveUsers();

      return { success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Error interno del sistema' };
    }
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    if (this.currentUser.password !== currentPassword) {
      return { success: false, error: 'La contraseña actual es incorrecta' };
    }

    if (newPassword.length < 4) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres' };
    }

    try {
      this.currentUser.password = newPassword;
      const userIndex = this.users.findIndex(u => u.id === this.currentUser!.id);
      if (userIndex !== -1) {
        this.users[userIndex].password = newPassword;
      }
      
      this.saveUsers();
      this.saveCurrentUser();

      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: 'Error interno del sistema' };
    }
  }

  public async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isRoot()) {
      return { success: false, error: 'Solo el usuario root puede eliminar usuarios' };
    }

    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (user.isRoot) {
      return { success: false, error: 'No se puede eliminar el usuario root' };
    }

    if (this.currentUser?.id === userId) {
      return { success: false, error: 'No puedes eliminar tu propio usuario' };
    }

    try {
      this.users = this.users.filter(u => u.id !== userId);
      this.saveUsers();

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: 'Error interno del sistema' };
    }
  }

  public getAuthState(): AuthState {
    return {
      isAuthenticated: this.isAuthenticated(),
      currentUser: this.currentUser,
      isLoading: false
    };
  }
}

export const authService = AuthService.getInstance();
