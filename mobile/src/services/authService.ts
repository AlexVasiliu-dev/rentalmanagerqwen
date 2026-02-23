import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  email: string;
  nume: string;
  rol: 'ADMIN' | 'MANAGER' | 'CHIRIAS';
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    // Mock login - înlocuiește cu API call real
    const user: User = {
      id: '1',
      email,
      nume: 'Utilizator Test',
      rol: 'CHIRIAS',
    };
    
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    await SecureStore.setItemAsync('token', 'mock-token');
    
    return user;
  },

  async register(nume: string, email: string, password: string): Promise<void> {
    // Mock register - înlocuiește cu API call real
    console.log('Înregistrare:', { nume, email, password });
  },

  async getUser(): Promise<User | null> {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
  },

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null;
  },
};
