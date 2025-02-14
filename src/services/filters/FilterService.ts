import { DatabaseService } from '../database/DatabaseService';
import { AuthorizationService } from '../auth/AuthorizationService';
import { logger } from '../monitoring/logger';

export interface FilterOptions {
  userId?: number;
  unitId?: number;
  status?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class FilterService {
  private static instance: FilterService;
  private authService: AuthorizationService;

  private constructor() {
    this.authService = AuthorizationService.getInstance();
  }

  static getInstance(): FilterService {
    if (!FilterService.instance) {
      FilterService.instance = new FilterService();
    }
    return FilterService.instance;
  }

  async getStrategicObjectives(userId: number, options: FilterOptions = {}) {
    try {
      const scope = this.authService.getScope({ id: userId }, 'strategic_planning');
      let query = `
        SELECT 
          o.*,
          u.Name as UnitName,
          r.Name as ResponsibleName
        FROM StrategicObjectives o
        LEFT JOIN Units u ON o.UnitID = u.UnitID
        LEFT JOIN Users r ON o.ResponsibleID = r.UserID
        WHERE 1=1
      `;

      const params: any = {};

      // Aplicar filtro por escopo
      if (scope === 'unit') {
        const userUnit = await this.getUserUnit(userId);
        query += ` AND o.UnitID = @unitId`;
        params.unitId = userUnit;
      } else if (scope === 'own') {
        query += ` AND o.ResponsibleID = @userId`;
        params.userId = userId;
      }

      // Aplicar filtros adicionais
      if (options.status) {
        query += ` AND o.Status = @status`;
        params.status = options.status;
      }

      if (options.type) {
        query += ` AND o.Type = @type`;
        params.type = options.type;
      }

      if (options.startDate) {
        query += ` AND o.StartDate >= @startDate`;
        params.startDate = options.startDate;
      }

      if (options.endDate) {
        query += ` AND o.EndDate <= @endDate`;
        params.endDate = options.endDate;
      }

      if (options.search) {
        query += ` AND (o.Name LIKE @search OR o.Description LIKE @search)`;
        params.search = `%${options.search}%`;
      }

      // Ordenação
      query += ` ORDER BY ${options.sortBy || 'o.CreatedAt'} ${options.sortOrder || 'desc'}`;

      // Paginação
      if (options.page !== undefined && options.limit !== undefined) {
        const offset = (options.page - 1) * options.limit;
        query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
        params.offset = offset;
        params.limit = options.limit;
      }

      const objectives = await DatabaseService.query(query, params);

      return objectives;
    } catch (error) {
      logger.error('Failed to get strategic objectives', error as Error);
      throw error;
    }
  }

  async getAnnualInitiatives(userId: number, options: FilterOptions = {}) {
    try {
      const scope = this.authService.getScope({ id: userId }, 'paa');
      let query = `
        SELECT 
          i.*,
          u.Name as UnitName,
          r.Name as ResponsibleName,
          o.Name as ObjectiveName
        FROM Initiatives i
        LEFT JOIN Units u ON i.UnitID = u.UnitID
        LEFT JOIN Users r ON i.ResponsibleID = r.UserID
        LEFT JOIN StrategicObjectives o ON i.ObjectiveID = o.ObjectiveID
        WHERE 1=1
      `;

      const params: any = {};

      // Aplicar filtro por escopo
      if (scope === 'unit') {
        const userUnit = await this.getUserUnit(userId);
        query += ` AND i.UnitID = @unitId`;
        params.unitId = userUnit;
      } else if (scope === 'own') {
        query += ` AND i.ResponsibleID = @userId`;
        params.userId = userId;
      }

      // Aplicar filtros adicionais
      if (options.status) {
        query += ` AND i.Status = @status`;
        params.status = options.status;
      }

      if (options.startDate) {
        query += ` AND i.StartDate >= @startDate`;
        params.startDate = options.startDate;
      }

      if (options.endDate) {
        query += ` AND i.EndDate <= @endDate`;
        params.endDate = options.endDate;
      }

      if (options.search) {
        query += ` AND (i.Name LIKE @search OR i.Description LIKE @search)`;
        params.search = `%${options.search}%`;
      }

      // Ordenação
      query += ` ORDER BY ${options.sortBy || 'i.CreatedAt'} ${options.sortOrder || 'desc'}`;

      // Paginação
      if (options.page !== undefined && options.limit !== undefined) {
        const offset = (options.page - 1) * options.limit;
        query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
        params.offset = offset;
        params.limit = options.limit;
      }

      const initiatives = await DatabaseService.query(query, params);

      return initiatives;
    } catch (error) {
      logger.error('Failed to get annual initiatives', error as Error);
      throw error;
    }
  }

  async getTasks(userId: number, options: FilterOptions = {}) {
    try {
      const scope = this.authService.getScope({ id: userId }, 'task');
      let query = `
        SELECT 
          t.*,
          i.Name as InitiativeName,
          u.Name as UnitName,
          r.Name as ResponsibleName
        FROM Tasks t
        LEFT JOIN Initiatives i ON t.InitiativeID = i.InitiativeID
        LEFT JOIN Units u ON t.UnitID = u.UnitID
        LEFT JOIN Users r ON t.ResponsibleID = r.UserID
        WHERE 1=1
      `;

      const params: any = {};

      // Aplicar filtro por escopo
      if (scope === 'unit') {
        const userUnit = await this.getUserUnit(userId);
        query += ` AND t.UnitID = @unitId`;
        params.unitId = userUnit;
      } else if (scope === 'own') {
        query += ` AND t.ResponsibleID = @userId`;
        params.userId = userId;
      }

      // Aplicar filtros adicionais
      if (options.status) {
        query += ` AND t.Status = @status`;
        params.status = options.status;
      }

      if (options.startDate) {
        query += ` AND t.StartDate >= @startDate`;
        params.startDate = options.startDate;
      }

      if (options.endDate) {
        query += ` AND t.EndDate <= @endDate`;
        params.endDate = options.endDate;
      }

      if (options.search) {
        query += ` AND (t.Name LIKE @search OR t.Description LIKE @search)`;
        params.search = `%${options.search}%`;
      }

      // Ordenação
      query += ` ORDER BY ${options.sortBy || 't.CreatedAt'} ${options.sortOrder || 'desc'}`;

      // Paginação
      if (options.page !== undefined && options.limit !== undefined) {
        const offset = (options.page - 1) * options.limit;
        query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
        params.offset = offset;
        params.limit = options.limit;
      }

      const tasks = await DatabaseService.query(query, params);

      return tasks;
    } catch (error) {
      logger.error('Failed to get tasks', error as Error);
      throw error;
    }
  }

  async getMyArea(userId: number, options: FilterOptions = {}) {
    try {
      const userUnit = await this.getUserUnit(userId);
      
      // Buscar objetivos da unidade
      const objectives = await this.getStrategicObjectives(userId, {
        ...options,
        unitId: userUnit
      });

      // Buscar iniciativas da unidade
      const initiatives = await this.getAnnualInitiatives(userId, {
        ...options,
        unitId: userUnit
      });

      // Buscar tarefas da unidade
      const tasks = await this.getTasks(userId, {
        ...options,
        unitId: userUnit
      });

      return {
        objectives,
        initiatives,
        tasks,
        unitInfo: await this.getUnitInfo(userUnit)
      };
    } catch (error) {
      logger.error('Failed to get my area data', error as Error);
      throw error;
    }
  }

  private async getUserUnit(userId: number): Promise<number> {
    try {
      const result = await DatabaseService.query(
        `SELECT UnitID FROM Users WHERE UserID = @userId`,
        { userId }
      );

      return result[0]?.UnitID;
    } catch (error) {
      logger.error('Failed to get user unit', error as Error);
      throw error;
    }
  }

  private async getUnitInfo(unitId: number) {
    try {
      const result = await DatabaseService.query(
        `SELECT * FROM Units WHERE UnitID = @unitId`,
        { unitId }
      );

      return result[0];
    } catch (error) {
      logger.error('Failed to get unit info', error as Error);
      throw error;
    }
  }
} 