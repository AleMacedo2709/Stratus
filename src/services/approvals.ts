import { Status, Priority, ApprovalType, Unit, BaseUser, ChangeHistory } from '@/types/common';

export interface ApprovalRequest {
  id: number;
  type: ApprovalType;
  title: string;
  description: string;
  requester: BaseUser;
  requestDate: string;
  priority: Priority;
  impact: string[];
  attachments?: string[];
  unitId: number;
  status: Status;
  history?: ChangeHistory[];
  comments?: string;
}

export interface ApprovalStep {
  id: number;
  role: string;
  approver?: BaseUser;
  order: number;
  requiredProfiles: string[];
  requireUnitMatch: boolean;
  timeLimit?: number;
  notifications: boolean;
  status: Status;
  comments?: string;
  approvalDate?: string;
}

export interface ApprovalFlow {
  id: number;
  name: string;
  description: string;
  type: ApprovalType;
  status: 'Ativo' | 'Inativo';
  requiredProfiles: string[];
  requireUnitMatch: boolean;
  steps: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export class ApprovalService {
  private baseUrl = '/api/approvals';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(error.message || `Falha ao ${options?.method || 'GET'} ${endpoint}`);
    }
    
    return response.json();
  }

  async getPendingApprovals(userId: string): Promise<ApprovalRequest[]> {
    return this.request<ApprovalRequest[]>(`/pending?userId=${userId}`);
  }

  async getApprovalsByUnit(unitId: number): Promise<ApprovalRequest[]> {
    return this.request<ApprovalRequest[]>(`/unit/${unitId}`);
  }

  async getApprovalFlows(): Promise<ApprovalFlow[]> {
    return this.request<ApprovalFlow[]>('/flows');
  }

  async getFlowsByType(type: ApprovalType): Promise<ApprovalFlow[]> {
    return this.request<ApprovalFlow[]>(`/flows/type/${type}`);
  }

  async createApprovalFlow(flow: Omit<ApprovalFlow, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApprovalFlow> {
    return this.request<ApprovalFlow>('/flows', {
      method: 'POST',
      body: JSON.stringify(flow),
    });
  }

  async updateApprovalFlow(flowId: number, updates: Partial<ApprovalFlow>): Promise<ApprovalFlow> {
    return this.request<ApprovalFlow>(`/flows/${flowId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteApprovalFlow(flowId: number): Promise<void> {
    await this.request(`/flows/${flowId}`, {
      method: 'DELETE',
    });
  }

  async createApprovalRequest(request: Omit<ApprovalRequest, 'id' | 'status' | 'history'>): Promise<ApprovalRequest> {
    return this.request<ApprovalRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async approveRequest(requestId: number, userId: string, comments?: string): Promise<void> {
    await this.request(`/requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ userId, comments }),
    });
  }

  async rejectRequest(requestId: number, userId: string, comments: string): Promise<void> {
    await this.request(`/requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ userId, comments }),
    });
  }

  async getRequestHistory(requestId: number): Promise<ChangeHistory[]> {
    return this.request<ChangeHistory[]>(`/requests/${requestId}/history`);
  }

  async addAttachment(requestId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    await fetch(`${this.baseUrl}/requests/${requestId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  }

  async removeAttachment(requestId: number, attachmentId: string): Promise<void> {
    await this.request(`/requests/${requestId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }
}

export const approvalService = new ApprovalService(); 