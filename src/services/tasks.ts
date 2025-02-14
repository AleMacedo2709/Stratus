import { Status, Priority, Unit, BaseUser, Weight, ProgressCalculation } from '@/types/common';

export interface Task {
  id: number;
  name: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  status: 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Atrasado' | 'Suspenso' | 'Descontinuado';
  startDate: string;
  endDate: string;
  progress: number;
  assignee: BaseUser;
  unit: Unit;
  tags: string[];
  weight: Weight;
  dependencies: number[];
  attachments?: string[];
  progressCalculation?: ProgressCalculation;
}

export class TaskService {
  private baseUrl = '/api/tasks';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Falha ao ${options?.method || 'GET'} ${endpoint}`);
    }

    return response.json();
  }

  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('');
  }

  async getTasksByInitiative(initiativeId: number): Promise<Task[]> {
    return this.request<Task[]>(`/initiative/${initiativeId}`);
  }

  async getTasksByUnit(unitId: number): Promise<Task[]> {
    return this.request<Task[]>(`/unit/${unitId}`);
  }

  async getTasksByAssignee(userId: string): Promise<Task[]> {
    return this.request<Task[]>(`/assignee/${userId}`);
  }

  async createTask(task: Omit<Task, 'id' | 'progress' | 'progressCalculation'>): Promise<Task> {
    return this.request<Task>('', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTaskStatus(taskId: number, newStatus: Status, userId: string): Promise<void> {
    await this.request(`/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, userId }),
    });
  }

  async updateTaskProgress(taskId: number, progress: number, userId: string): Promise<void> {
    await this.request(`/${taskId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress, userId }),
    });
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<Task> {
    return this.request<Task>(`/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async addTaskDependency(taskId: number, dependencyId: number): Promise<void> {
    await this.request(`/${taskId}/dependencies`, {
      method: 'POST',
      body: JSON.stringify({ dependencyId }),
    });
  }

  async removeTaskDependency(taskId: number, dependencyId: number): Promise<void> {
    await this.request(`/${taskId}/dependencies/${dependencyId}`, {
      method: 'DELETE',
    });
  }

  async addTaskAttachment(taskId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    await fetch(`${this.baseUrl}/${taskId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  }

  async removeTaskAttachment(taskId: number, attachmentId: string): Promise<void> {
    await this.request(`/${taskId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  async calculateTaskProgress(taskId: number): Promise<ProgressCalculation> {
    return this.request<ProgressCalculation>(`/${taskId}/calculate-progress`);
  }

  async deleteTask(taskId: number, userId: string): Promise<void> {
    await this.request(`/${taskId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }
}

export const taskService = new TaskService(); 