'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/services/auth/MicrosoftGraphService';
import { environment } from '@/config/environment';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Development mode mock user
const mockUser: UserProfile = {
  id: 'dev-user',
  displayName: 'Development User',
  mail: 'dev@example.com',
  jobTitle: 'Developer',
  department: 'IT',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  // In development mode, provide mock auth context
  if (!environment.isProduction || !environment.features.enableAzureAD) {
    const mockAuth: AuthContextType = {
      isAuthenticated: true,
      user: mockUser,
      isLoading: false,
      error: null,
      login: async () => {
        window.location.href = '/';
      },
      logout: async () => {
        window.location.href = '/auth/signin';
      },
    };

    return (
      <AuthContext.Provider value={mockAuth}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 