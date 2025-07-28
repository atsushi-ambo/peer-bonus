'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  authAPI,
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  isAuthenticated,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isAuthenticated()) {
          // Try to get fresh user data from API
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          setStoredUser(userData);
        } else {
          // Check if we have stored user data (for offline scenarios)
          const storedUser = getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid tokens
        removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      
      // Get auth token
      const authTokens = await authAPI.login(credentials);
      setToken(authTokens.access_token);

      // Get user data
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setStoredUser(userData);
    } catch (error) {
      removeToken();
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      
      // Register user
      const userData = await authAPI.register(credentials);
      
      // Auto-login after registration
      await login({
        email: credentials.email,
        password: credentials.password,
      });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isLoggedIn: !!user && isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};