import { create } from 'zustand';
import { User } from '@/types';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
  exp: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    let userFromToken: User | null = null;

    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        userFromToken = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || 'user'
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
        }
      } catch (e) {
        console.error('Invalid token', e);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
    }

    set({ token, user: userFromToken });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }
    set({ user: null, token: null });
  },
}));
