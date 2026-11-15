import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdminUser, User } from '../types';
import { authApi, userAuthApi } from '../services/api';

export type AnyUser = (User | AdminUser) & {
  credits?: number;
  deviceLimit?: number;
  phone?: string | null;
};

interface AuthContextType {
  user: AnyUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isLoading: boolean;
  loginAdmin: (email: string, pass: string) => Promise<void>;
  loginUser: (email: string, pass: string) => Promise<void>;
  registerUser: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AnyUser | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('auth_token') || localStorage.getItem('admin_token')
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const storedToken = localStorage.getItem('auth_token') || localStorage.getItem('admin_token');
    const storedType = localStorage.getItem('auth_type'); // 'admin' | 'user'

    if (storedToken) {
      try {
        if (storedType === 'admin') {
          const profile = await authApi.getProfile();
          setUser({ ...profile, credits: 9999, deviceLimit: 10 });
          setIsAdmin(true);
        } else {
          const profile = await userAuthApi.getProfile();
          setUser(profile);
          setIsAdmin(profile.role === 'ADMIN' || profile.role === 'SUPERADMIN');
        }
        setToken(storedToken);
      } catch (err) {
        console.warn('Failed to verify session token:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('auth_type');
        setToken(null);
        setUser(null);
        setIsAdmin(false);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const loginAdmin = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    localStorage.setItem('admin_token', res.token);
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('auth_type', 'admin');
    setToken(res.token);
    setUser({ ...res.user, credits: 9999, deviceLimit: 10 });
    setIsAdmin(true);
  };

  const loginUser = async (email: string, pass: string) => {
    const res = await userAuthApi.login(email, pass);
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('auth_type', 'user');
    setToken(res.token);
    setUser(res.user);
    setIsAdmin(res.user.role === 'ADMIN' || res.user.role === 'SUPERADMIN');
  };

  const registerUser = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await userAuthApi.register(data);
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('auth_type', 'user');
    setToken(res.token);
    setUser(res.user);
    setIsAdmin(false);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    userAuthApi.logout().catch(() => {});
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('auth_type');
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  const refetchUser = async () => {
    const storedType = localStorage.getItem('auth_type');
    if (storedType === 'admin') {
      const p = await authApi.getProfile();
      setUser({ ...p, credits: 9999, deviceLimit: 10 });
    } else {
      const p = await userAuthApi.getProfile();
      setUser(p);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isAdmin,
        isUser: Boolean(user && !isAdmin),
        isLoading,
        loginAdmin,
        loginUser,
        registerUser,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
