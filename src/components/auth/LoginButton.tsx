'use client';

import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/config/auth';
import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { environment } from '@/config/environment';

interface LoginButtonProps {
  className?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ className }) => {
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!environment.isProduction || !environment.features.enableAzureAD) {
        // In development, simulate login
        window.location.href = '/';
        return;
      }

      await instance.loginPopup(loginRequest);
    } catch (e) {
      console.error('Error during login:', e);
      setError(e instanceof Error ? e.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = environment.isProduction && environment.features.enableAzureAD
    ? 'Sign in with Microsoft'
    : 'Sign in (Development Mode)';

  return (
    <div>
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className={`inline-flex items-center justify-center rounded-md bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70 lg:px-8 xl:px-10 ${className}`}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          buttonText
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 