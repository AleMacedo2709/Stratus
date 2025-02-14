import { DatabaseService } from '../database/DatabaseService';
import { environment } from '@/config/environment';
import { logger } from '../monitoring/logger';
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
  private static tableName = 'Tasks';

  static async getTasks(): Promise<Task[]> {
    if (environment.useMockData) {
      return [];
    }

    try {
      const query = `SELECT * FROM ${this.tableName} WHERE deletedAt IS NULL`;
      return await DatabaseService.query<Task>(query);
    } catch (error) {
      logger.error('Error fetching tasks', { error });
      throw error;
    }
  }

  static async getTaskById(id: string): Promise<Task | null> {
    if (environment.useMockData) {
      return null;
    }

    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = @param0 AND deletedAt IS NULL`;
      const results = await DatabaseService.query<Task>(query, [id]);
      return results[0] || null;
    } catch (error) {
      logger.error('Error fetching task by id', { error });
      throw error;
    }
  }

  static async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    if (environment.useMockData) {
      return {} as Task;
    }

    try {
      const query = `
        INSERT INTO ${this.tableName} (
          title, description, status, priority, dueDate, 
          assignedTo, relatedObjective, progress
        )
        VALUES (
          @param0, @param1, @param2, @param3, @param4, 
          @param5, @param6, @param7
        )
        RETURNING *;
      `;

      const params = [
        task.title,
        task.description,
        task.status,
        task.priority,
        task.dueDate,
        task.assignedTo,
        task.relatedObjective,
        task.progress
      ];

      const results = await DatabaseService.query<Task>(query, params);
      return results[0];
    } catch (error) {
      logger.error('Error creating task', { error });
      throw error;
    }
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    if (environment.useMockData) {
      return {} as Task;
    }

    try {
      const setStatements = Object.keys(updates)
        .map((key, index) => `${key} = @param${index}`)
        .join(', ');

      const query = `
        UPDATE ${this.tableName}
        SET ${setStatements}, updatedAt = CURRENT_TIMESTAMP
        WHERE id = @param${Object.keys(updates).length}
        RETURNING *;
      `;

      const params = [...Object.values(updates), id];
      const results = await DatabaseService.query<Task>(query, params);
      return results[0];
    } catch (error) {
      logger.error('Error updating task', { error });
      throw error;
    }
  }

  static async deleteTask(id: string): Promise<void> {
    if (environment.useMockData) {
      return;
    }

    try {
      const query = `
        UPDATE ${this.tableName}
        SET deletedAt = CURRENT_TIMESTAMP
        WHERE id = @param0;
      `;
      await DatabaseService.query(query, [id]);
    } catch (error) {
      logger.error('Error deleting task', { error });
      throw error;
    }
  }

  static async getTasksByObjective(objectiveId: string): Promise<Task[]> {
    if (environment.useMockData) {
      return [];
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE relatedObjective = @param0
        AND deletedAt IS NULL;
      `;
      return await DatabaseService.query<Task>(query, [objectiveId]);
    } catch (error) {
      logger.error('Error fetching tasks by objective', { error });
      throw error;
    }
  }

  static async getTasksByAssignee(userId: string): Promise<Task[]> {
    if (environment.useMockData) {
      return [];
    }

    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE assignedTo = @param0
        AND deletedAt IS NULL;
      `;
      return await DatabaseService.query<Task>(query, [userId]);
    } catch (error) {
      logger.error('Error fetching tasks by assignee', { error });
      throw error;
    }
  }

  static async updateTaskStatus(id: string, newStatus: Status): Promise<void> {
    const validStatus: Status[] = [
      'Aguardando aprovação',
      'Não iniciado',
      'Em andamento',
      'Concluído',
      'Suspenso',
      'Descontinuada'
    ];

    if (!validStatus.includes(newStatus)) {
      throw new Error('Status inválido');
    }

    if (environment.useMockData) {
      return;
    }

    try {
      const query = `
        UPDATE ${this.tableName}
        SET status = @param0
        WHERE id = @param1;
      `;
      await DatabaseService.query(query, [newStatus, id]);
    } catch (error) {
      logger.error('Error updating task status', { error });
      throw error;
    }
  }
} 