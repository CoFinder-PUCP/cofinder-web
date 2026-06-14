import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  bio: string | null;
  faculty: string | null;
  yearJoined: number | null;
  skills: string[];
  lookingFor: string[];
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!get().token,
}));
