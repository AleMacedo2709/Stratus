import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client/authProvider';
import { environment } from '@/config/environment';

interface UserProfile {
  id: string;
  displayName: string;
  mail: string;
  jobTitle?: string;
  department?: string;
  photoUrl?: string;
}

class MicrosoftGraphService {
  private static instance: MicrosoftGraphService;
  private graphClient: Client | null = null;
  private photoCache: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): MicrosoftGraphService {
    if (!MicrosoftGraphService.instance) {
      MicrosoftGraphService.instance = new MicrosoftGraphService();
    }
    return MicrosoftGraphService.instance;
  }

  async initialize(accessToken: string): Promise<void> {
    const authProvider: AuthenticationProvider = (callback) => {
      callback(null, accessToken);
    };

    this.graphClient = Client.init({
      authProvider,
      defaultVersion: 'v1.0'
    });
  }

  async getUserProfile(): Promise<UserProfile> {
    if (!this.graphClient) {
      throw new Error('Graph client not initialized');
    }

    try {
      const user = await this.graphClient
        .api('/me')
        .select('id,displayName,mail,jobTitle,department')
        .get();

      const photoUrl = await this.getUserPhotoUrl(user.id);

      return {
        id: user.id,
        displayName: user.displayName,
        mail: user.mail,
        jobTitle: user.jobTitle,
        department: user.department,
        photoUrl
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async getUserPhotoUrl(userId: string): Promise<string | undefined> {
    if (!this.graphClient) {
      throw new Error('Graph client not initialized');
    }

    // Verifica se já temos a URL em cache
    if (this.photoCache.has(userId)) {
      return this.photoCache.get(userId);
    }

    try {
      const photo = await this.graphClient
        .api(`/users/${userId}/photo/$value`)
        .get();

      if (photo) {
        const blob = new Blob([photo], { type: 'image/jpeg' });
        const photoUrl = URL.createObjectURL(blob);
        this.photoCache.set(userId, photoUrl);
        return photoUrl;
      }
    } catch (error) {
      console.warn('User photo not available:', error);
    }

    return undefined;
  }

  async getUserPhotoByEmail(email: string): Promise<string | undefined> {
    if (!this.graphClient) {
      throw new Error('Graph client not initialized');
    }

    try {
      const user = await this.graphClient
        .api('/users')
        .filter(`mail eq '${email}'`)
        .select('id')
        .get();

      if (user.value && user.value.length > 0) {
        return this.getUserPhotoUrl(user.value[0].id);
      }
    } catch (error) {
      console.warn('Error fetching user by email:', error);
    }

    return undefined;
  }

  clearPhotoCache(): void {
    this.photoCache.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.photoCache.clear();
  }
}

export const graphService = MicrosoftGraphService.getInstance(); 