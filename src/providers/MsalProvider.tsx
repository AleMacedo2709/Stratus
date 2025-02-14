'use client';

import { MsalProvider as DefaultMsalProvider } from '@azure/msal-react';
import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig } from '@/config/auth';
import { environment } from '@/config/environment';
import { useEffect } from 'react';

// Only initialize MSAL in production mode
const msalInstance = environment.isProduction && environment.features.enableAzureAD
  ? new PublicClientApplication(msalConfig)
  : null;

if (msalInstance) {
  // Default to using the first account if no account is active on page load
  if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
  }

  msalInstance.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      const account = payload.account;
      msalInstance.setActiveAccount(account);
    }
  });
}

export const MsalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (msalInstance) {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
      }
    }
  }, []);

  // Only wrap with MSAL provider in production mode
  if (!environment.isProduction || !environment.features.enableAzureAD) {
    return <>{children}</>;
  }

  return (
    <DefaultMsalProvider instance={msalInstance!}>
      {children}
    </DefaultMsalProvider>
  );
}; 