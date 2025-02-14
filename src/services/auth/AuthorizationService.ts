import { User } from '@/types/common';

export interface Permission {
  action: 'criar' | 'ler' | 'atualizar' | 'excluir' | 'aprovar';
  resource: string;
  scope?: 'todos' | 'unidade' | 'proprio';
  requiredProfiles?: string[];
  requireUnitMatch?: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export class AuthorizationService {
  private static instance: AuthorizationService;
  private roles: Map<string, Role> = new Map();

  private constructor() {
    this.initializeRoles();
  }

  static getInstance(): AuthorizationService {
    if (!AuthorizationService.instance) {
      AuthorizationService.instance = new AuthorizationService();
    }
    return AuthorizationService.instance;
  }

  private initializeRoles() {
    // Administrador do Sistema
    this.roles.set('administrador', {
      id: 'administrador',
      name: 'Administrador do Sistema',
      permissions: [
        { action: 'criar', resource: '*', scope: 'todos' },
        { action: 'ler', resource: '*', scope: 'todos' },
        { action: 'atualizar', resource: '*', scope: 'todos' },
        { action: 'excluir', resource: '*', scope: 'todos' },
        { action: 'aprovar', resource: '*', scope: 'todos' }
      ]
    });

    // Gestor de Planejamento
    this.roles.set('planejamento', {
      id: 'planejamento',
      name: 'Gestor de Planejamento',
      permissions: [
        { action: 'criar', resource: 'planejamento_estrategico', scope: 'todos' },
        { action: 'ler', resource: 'planejamento_estrategico', scope: 'todos' },
        { action: 'atualizar', resource: 'planejamento_estrategico', scope: 'todos' },
        { action: 'aprovar', resource: 'planejamento_estrategico', scope: 'todos' },
        { action: 'criar', resource: 'indicador', scope: 'todos' },
        { action: 'atualizar', resource: 'indicador', scope: 'todos' },
        { action: 'ler', resource: '*', scope: 'todos' }
      ]
    });

    // Gestor PAA
    this.roles.set('paa', {
      id: 'paa',
      name: 'Gestor PAA',
      permissions: [
        { action: 'criar', resource: 'iniciativa', scope: 'unidade', requireUnitMatch: true },
        { action: 'atualizar', resource: 'iniciativa', scope: 'unidade', requireUnitMatch: true },
        { action: 'aprovar', resource: 'tarefa', scope: 'unidade', requireUnitMatch: true },
        { action: 'ler', resource: '*', scope: 'unidade' }
      ]
    });

    // Usuário Padrão
    this.roles.set('usuario', {
      id: 'usuario',
      name: 'Usuário',
      permissions: [
        { action: 'criar', resource: 'tarefa', scope: 'proprio' },
        { action: 'atualizar', resource: 'tarefa', scope: 'proprio' },
        { action: 'ler', resource: '*', scope: 'unidade' }
      ]
    });
  }

  hasPermission(user: User, action: string, resource: string, unitId?: number): boolean {
    const role = this.roles.get(user.profile.toLowerCase());
    if (!role) return false;

    return role.permissions.some(permission => {
      const actionMatch = permission.action === action || permission.resource === '*';
      const resourceMatch = permission.resource === resource || permission.resource === '*';
      const scopeMatch = this.checkScopeMatch(permission.scope, user, unitId);
      const unitMatch = !permission.requireUnitMatch || (unitId && user.unit.id === unitId);
      
      return actionMatch && resourceMatch && scopeMatch && unitMatch;
    });
  }

  private checkScopeMatch(scope: string | undefined, user: User, unitId?: number): boolean {
    if (!scope) return true;
    
    switch (scope) {
      case 'todos':
        return true;
      case 'unidade':
        return unitId ? user.unit.id === unitId : true;
      case 'proprio':
        return true; // Verificação específica deve ser feita no contexto da operação
      default:
        return false;
    }
  }

  getScope(user: User, resource: string): 'todos' | 'unidade' | 'proprio' | null {
    const role = this.roles.get(user.profile.toLowerCase());
    if (!role) return null;

    const permission = role.permissions.find(p => 
      (p.resource === resource || p.resource === '*') &&
      (p.action === '*' || p.action === 'ler')
    );

    return permission?.scope || null;
  }

  canApprove(user: User, resource: string, unitId?: number): boolean {
    return this.hasPermission(user, 'aprovar', resource, unitId);
  }

  canCreate(user: User, resource: string, unitId?: number): boolean {
    return this.hasPermission(user, 'criar', resource, unitId);
  }

  canUpdate(user: User, resource: string, unitId?: number, isOwner?: boolean): boolean {
    const permission = this.roles.get(user.profile.toLowerCase())?.permissions.find(p =>
      (p.resource === resource || p.resource === '*') &&
      (p.action === 'atualizar' || p.action === '*')
    );

    if (!permission) return false;

    if (permission.scope === 'todos') return true;
    if (permission.scope === 'unidade') return !permission.requireUnitMatch || (unitId && user.unit.id === unitId);
    if (permission.scope === 'proprio') return isOwner;

    return false;
  }
} 