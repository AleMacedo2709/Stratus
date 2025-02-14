export const colors = {
  primary: {
    main: '#2563eb', // Azul institucional
    light: '#60a5fa',
    dark: '#1e40af',
  },
  secondary: {
    main: '#7c3aed', // Roxo complementar
    light: '#a78bfa',
    dark: '#5b21b6',
  },
  neutral: {
    white: '#ffffff',
    lighter: '#f8fafc',
    light: '#e2e8f0',
    main: '#64748b',
    dark: '#1f2937',
    darker: '#111827',
    text: '#1e293b',
    textLight: '#64748b',
    background: '#f8fafc',
  },
  status: {
    success: '#22c55e', // Verde para "on_track"
    warning: '#f59e0b', // Amarelo para "at_risk"
    danger: '#ef4444',  // Vermelho para "behind"
    completed: '#0d9488', // Verde-azulado para "completed"
  },
  info: {
    main: '#0ea5e9',
    light: '#7dd3fc',
    dark: '#0369a1',
  },
  strategic: {
    perspective: '#8b5cf6', // Roxo para Perspectivas
    program: '#06b6d4',    // Azul-claro para Programas
    objective: '#2563eb',  // Azul para Objetivos
    initiative: '#059669', // Verde para Iniciativas
    indicator: '#ea580c',  // Laranja para Indicadores
    risk: '#dc2626',       // Vermelho para Riscos
  },
} as const;

export const statusColors = {
  on_track: colors.status.success,
  at_risk: colors.status.warning,
  behind: colors.status.danger,
  completed: colors.status.completed,
} as const;

export const progressColors = {
  low: colors.status.danger,
  medium: colors.status.warning,
  high: colors.status.success,
} as const;

export const elementColors = {
  perspective: colors.strategic.perspective,
  program: colors.strategic.program,
  objective: colors.strategic.objective,
  initiative: colors.strategic.initiative,
  indicator: colors.strategic.indicator,
  risk: colors.strategic.risk,
} as const;

// Variantes de cores para estados e interações
export const colorVariants = {
  hover: {
    primary: '#1A4378',
    secondary: '#218838',
  },
  active: {
    primary: '#153661',
    secondary: '#1E7E34',
  },
  disabled: {
    primary: '#8BA5C9',
    secondary: '#94D3A2',
    background: '#E9ECEF',
    text: '#6C757D',
  },
  transparent: {
    primary: 'rgba(30, 77, 140, 0.1)',
    secondary: 'rgba(40, 167, 69, 0.1)',
    warning: 'rgba(255, 193, 7, 0.1)',
    danger: 'rgba(220, 53, 69, 0.1)',
    info: 'rgba(23, 162, 184, 0.1)',
  }
};

// Cores específicas para modo escuro
export const darkModeColors = {
  background: {
    default: '#111827',
    paper: '#1F2937',
    elevated: '#374151',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    disabled: '#6B7280',
  },
  border: 'rgba(255, 255, 255, 0.12)',
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    focus: 'rgba(255, 255, 255, 0.12)',
  }
}; 