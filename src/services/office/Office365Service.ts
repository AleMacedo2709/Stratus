import { Client } from '@microsoft/microsoft-graph-client';
import { azureAuthService } from '../auth/AzureAuthService';

export interface EmailMessage {
  subject: string;
  body: string;
  toRecipients: string[];
  attachments?: File[];
}

export interface CalendarEvent {
  subject: string;
  start: Date;
  end: Date;
  attendees: string[];
  location?: string;
  description?: string;
}

export interface SharePointDocument {
  name: string;
  url: string;
  size: number;
  createdDateTime: string;
  lastModifiedDateTime: string;
}

export class Office365Service {
  private graphClient: Client | null = null;

  private async getGraphClient(): Promise<Client> {
    if (!this.graphClient) {
      this.graphClient = await azureAuthService.getGraphClient();
    }
    return this.graphClient;
  }

  // Email
  async sendEmail(message: EmailMessage): Promise<void> {
    const graphClient = await this.getGraphClient();
    
    const emailMessage = {
      message: {
        subject: message.subject,
        body: {
          contentType: 'HTML',
          content: message.body
        },
        toRecipients: message.toRecipients.map(email => ({
          emailAddress: { address: email }
        }))
      }
    };

    if (message.attachments?.length) {
      emailMessage.message['attachments'] = await Promise.all(
        message.attachments.map(async file => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: file.name,
          contentType: file.type,
          contentBytes: await this.fileToBase64(file)
        }))
      );
    }

    await graphClient.api('/me/sendMail').post(emailMessage);
  }

  // Calendário
  async createCalendarEvent(event: CalendarEvent): Promise<void> {
    const graphClient = await this.getGraphClient();
    
    const calendarEvent = {
      subject: event.subject,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: event.attendees.map(email => ({
        emailAddress: { address: email },
        type: 'required'
      })),
      location: event.location ? {
        displayName: event.location
      } : undefined,
      body: event.description ? {
        contentType: 'HTML',
        content: event.description
      } : undefined
    };

    await graphClient.api('/me/events').post(calendarEvent);
  }

  async getCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const graphClient = await this.getGraphClient();
    
    const response = await graphClient.api('/me/calendarView')
      .query({
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString()
      })
      .select('subject,start,end,attendees,location,bodyPreview')
      .get();

    return response.value.map((event: any) => ({
      subject: event.subject,
      start: new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
      attendees: event.attendees.map((a: any) => a.emailAddress.address),
      location: event.location?.displayName,
      description: event.bodyPreview
    }));
  }

  // SharePoint
  async uploadToSharePoint(siteId: string, libraryName: string, file: File): Promise<SharePointDocument> {
    const graphClient = await this.getGraphClient();
    
    const response = await graphClient.api(`/sites/${siteId}/drives`)
      .get();
    
    const libraryId = response.value.find((d: any) => d.name === libraryName)?.id;
    if (!libraryId) {
      throw new Error(`Biblioteca '${libraryName}' não encontrada`);
    }

    const content = await file.arrayBuffer();
    const uploadResponse = await graphClient.api(`/sites/${siteId}/drives/${libraryId}/root:/${file.name}:/content`)
      .put(content);

    return {
      name: uploadResponse.name,
      url: uploadResponse.webUrl,
      size: uploadResponse.size,
      createdDateTime: uploadResponse.createdDateTime,
      lastModifiedDateTime: uploadResponse.lastModifiedDateTime
    };
  }

  async getSharePointDocuments(siteId: string, libraryName: string): Promise<SharePointDocument[]> {
    const graphClient = await this.getGraphClient();
    
    const response = await graphClient.api(`/sites/${siteId}/drives`)
      .get();
    
    const libraryId = response.value.find((d: any) => d.name === libraryName)?.id;
    if (!libraryId) {
      throw new Error(`Biblioteca '${libraryName}' não encontrada`);
    }

    const documents = await graphClient.api(`/sites/${siteId}/drives/${libraryId}/root/children`)
      .select('name,webUrl,size,createdDateTime,lastModifiedDateTime')
      .get();

    return documents.value.map((doc: any) => ({
      name: doc.name,
      url: doc.webUrl,
      size: doc.size,
      createdDateTime: doc.createdDateTime,
      lastModifiedDateTime: doc.lastModifiedDateTime
    }));
  }

  // Utilitários
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('Falha ao converter arquivo para Base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }
}

export const office365Service = new Office365Service(); 