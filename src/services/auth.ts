import { PublicClientApplication, Configuration, AuthenticationResult } from '@azure/msal-browser';
import { DatabaseService } from './database';

interface UserInfo {
  id: string;
  displayName: string;
  mail: string;
}

interface UserProfile {
  ProfileName: string;
}

interface UserPermission {
  Action: string;
}

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

class AuthService {
  private msalInstance: PublicClientApplication;
  
  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async initialize(): Promise<void> {
    await this.msalInstance.initialize();
    await this.msalInstance.handleRedirectPromise();
  }

  async login(): Promise<UserInfo | null> {
    try {
      const loginResponse = await this.msalInstance.loginPopup({
        scopes: ['User.Read', 'profile', 'email']
      });
      
      if (loginResponse) {
        const userInfo = await this.getUserInfo(loginResponse.accessToken);
        await this.syncUserWithDatabase(userInfo);
        return userInfo;
      }
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.msalInstance.logout();
  }

  private async getUserInfo(accessToken: string): Promise<UserInfo> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();
    return {
      id: data.id,
      displayName: data.displayName,
      mail: data.mail,
    };
  }

  private async syncUserWithDatabase(userInfo: UserInfo): Promise<void> {
    try {
      const db = new DatabaseService();
      await db.connect();
      await db.query(
        'INSERT INTO users (id, name, email) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = $2, email = $3',
        [userInfo.id, userInfo.displayName, userInfo.mail]
      );
    } catch (error) {
      console.error('Failed to sync user with database:', error);
      throw error;
    }
  }

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    try {
      const db = new DatabaseService();
      await db.connect();
      const result = await db.query('SELECT action FROM user_permissions WHERE user_id = $1', [userId]);
      return result.rows.map(row => ({ Action: row.action }));
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return [];
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const db = new DatabaseService();
      await db.connect();
      const result = await db.query('SELECT profile_name FROM user_profiles WHERE user_id = $1', [userId]);
      return { ProfileName: result.rows[0]?.profile_name || 'Default Profile' };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return { ProfileName: 'Default Profile' };
    }
  }
}

export const authService = new AuthService(); 