'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/auth';

interface User {
  id: string;
  name: string;
  email: string;
  profile: {
    name: string;
    permissions: string[];
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

interface Props {
  children: ReactNode;
}

function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        await authService.initialize();
        const session = sessionStorage.getItem('user');
        if (session) {
          setUser(JSON.parse(session));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize auth');
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  async function login() {
    try {
      setLoading(true);
      setError(null);
      const userInfo = await authService.login();
      
      if (userInfo) {
        const userData: User = {
          id: userInfo.id,
          name: userInfo.displayName,
          email: userInfo.mail,
          profile: {
            name: 'Loading...',
            permissions: [],
          },
        };

        const profile = await authService.getUserProfile(userData.id);
        const permissions = await authService.getUserPermissions(userData.id);

        userData.profile = {
          name: profile.ProfileName,
          permissions: permissions.map(p => p.Action),
        };

        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      sessionStorage.removeItem('user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth }; 