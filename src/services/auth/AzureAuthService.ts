import { User } from '@/types/common';
import { PublicClientApplication, Configuration, AuthenticationResult } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';

export class AzureAuthService {
  private msalInstance: PublicClientApplication;
  private graphClient: Client | null = null;

  constructor() {
    const msalConfig: Configuration = {
      auth: {
        clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID!,
        authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`,
        redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: true
      }
    };

    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async initialize(): Promise<void> {
    await this.msalInstance.initialize();
    await this.msalInstance.handleRedirectPromise();
  }

  async login(): Promise<User | null> {
    try {
      const loginRequest = {
        scopes: [
          'User.Read',
          'User.ReadBasic.All',
          'Directory.Read.All',
          'Calendar.ReadWrite',
          'Mail.ReadWrite',
          'Files.ReadWrite'
        ]
      };

      const response = await this.msalInstance.loginPopup(loginRequest);
      if (response) {
        const graphClient = await this.getGraphClient(response);
        const userProfile = await graphClient.api('/me').get();
        
        // Mapear perfil do Azure AD para nosso modelo de usuário
        return {
          id: userProfile.id,
          name: userProfile.displayName,
          email: userProfile.mail || userProfile.userPrincipalName,
          profile: 'Usuário', // Definir perfil padrão, será atualizado pelo backend
          unit: {
            id: 0, // Será atualizado pelo backend
            name: userProfile.department || 'Não definido',
            code: '',
            description: ''
          },
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissions: []
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao realizar login:', error);
      throw new Error('Falha na autenticação com Azure AD');
    }
  }

  async logout(): Promise<void> {
    await this.msalInstance.logout();
  }

  async getGraphClient(authResult?: AuthenticationResult): Promise<Client> {
    if (this.graphClient) return this.graphClient;

    if (!authResult) {
      const account = this.msalInstance.getAllAccounts()[0];
      if (!account) {
        throw new Error('Usuário não autenticado');
      }

      authResult = await this.msalInstance.acquireTokenSilent({
        scopes: ['User.Read'],
        account
      });
    }

    this.graphClient = Client.init({
      authProvider: (done) => {
        done(null, authResult!.accessToken);
      }
    });

    return this.graphClient;
  }

  async syncUserCalendar(): Promise<void> {
    const graphClient = await this.getGraphClient();
    const events = await graphClient.api('/me/calendar/events')
      .select('subject,start,end,attendees')
      .get();
    
    // Implementar sincronização com nosso sistema
    console.log('Eventos sincronizados:', events);
  }

  async syncUserFiles(folderId: string): Promise<void> {
    const graphClient = await this.getGraphClient();
    const files = await graphClient.api(`/me/drive/items/${folderId}/children`)
      .select('name,webUrl,size')
      .get();
    
    // Implementar sincronização com nosso sistema
    console.log('Arquivos sincronizados:', files);
  }

  async getUserGroups(): Promise<string[]> {
    const graphClient = await this.getGraphClient();
    const groups = await graphClient.api('/me/memberOf')
      .select('displayName')
      .get();
    
    return groups.value.map((group: any) => group.displayName);
  }
}

export const azureAuthService = new AzureAuthService(); 