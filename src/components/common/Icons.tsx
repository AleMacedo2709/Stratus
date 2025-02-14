import React from 'react';
import {
  AccountTreeOutlined,
  TrackChangesOutlined,
  LaunchOutlined,
  AssessmentOutlined,
  TaskOutlined,
  FileDownloadOutlined,
  PictureAsPdfOutlined,
  TableChartOutlined,
  SlideshowOutlined,
  NavigateNextOutlined,
  MoreVertOutlined,
  EditOutlined,
  DeleteOutlined,
  VisibilityOutlined,
  AddOutlined,
  SearchOutlined,
  FilterListOutlined,
  SortOutlined,
  RefreshOutlined,
  CloseOutlined,
  CheckOutlined,
  WarningOutlined,
  ErrorOutlined,
  InfoOutlined,
  HelpOutlined,
  TimelineOutlined,
  TrendingUpOutlined,
  FlagOutlined,
  GroupOutlined,
  BarChartOutlined,
  CategoryOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  DonutLargeOutlined,
  EmojiObjectsOutlined,
  LayersOutlined,
  ListAltOutlined,
  NotificationsOutlined,
  SettingsOutlined,
  ShareOutlined,
  MenuOutlined,
  ExpandLessOutlined,
  ExpandMoreOutlined,
  SyncOutlined,
  RemoveOutlined,
  FileCopyOutlined,
  DeleteSweepOutlined,
  TrendingDownOutlined,
  DarkModeOutlined,
  LightModeOutlined,
  EmailOutlined,
  AccountCircleOutlined,
  ChevronRightOutlined,
  ChevronDownOutlined,
  CalendarTodayOutlined,
  AccessTimeOutlined,
  PriorityHighOutlined,
  SpeedOutlined,
  QueryStatsOutlined,
  ShowChartOutlined,
  PlaylistAddCheckOutlined,
  PendingActionsOutlined,
  CancelOutlined,
  CheckCircleOutlineOutlined,
  ErrorOutlineOutlined,
  WarningAmberOutlined,
  DragIndicatorOutlined,
  ArrowUpwardOutlined,
  ArrowDownwardOutlined,
  ArrowBackOutlined,
  EditNoteOutlined,
  CheckCircleOutlined,
  AccessTimeFilledOutlined,
  FormatListBulletedOutlined,
  ViewColumnOutlined,
  GradeOutlined
} from '@mui/icons-material';
import { colors } from '@/styles/colors';
import { SvgIconProps } from '@mui/material';

export type IconName = 
  // Elementos Estratégicos
  | 'perspective'
  | 'program'
  | 'action'
  | 'objective'
  | 'initiative'
  | 'indicator'
  | 'risk'
  | 'milestone'
  | 'task'
  // Documentos
  | 'download'
  | 'pdf'
  | 'excel'
  | 'powerpoint'
  | 'report'
  | 'document'
  | 'file-pdf'
  // Navegação
  | 'next'
  | 'more'
  | 'menu'
  | 'dashboard'
  | 'expand_less'
  | 'expand_more'
  | 'back'
  | 'pen'
  // Ações
  | 'edit'
  | 'delete'
  | 'view'
  | 'add'
  | 'search'
  | 'filter'
  | 'sort'
  | 'refresh'
  | 'close'
  | 'check'
  | 'share'
  | 'settings'
  | 'sync'
  | 'trash'
  | 'plus'
  | 'minus'
  | 'times'
  | 'eye'
  // Status
  | 'warning'
  | 'error'
  | 'info'
  | 'help'
  | 'success'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'delayed'
  | 'cancelled'
  | 'on_track'
  | 'at_risk'
  | 'behind'
  // Análise
  | 'chart'
  | 'timeline'
  | 'trend'
  | 'analytics'
  | 'performance'
  | 'goal'
  | 'trending-up'
  | 'trending-down'
  // Organizacional
  | 'team'
  | 'department'
  | 'organization'
  | 'notification'
  // Arquivos
  | 'file-alt'
  | 'file-excel'
  // Header
  | 'dark'
  | 'light'
  | 'message'
  | 'account'
  // Navegação Adicional
  | 'chevron-right'
  | 'chevron-down'
  | 'calendar'
  | 'calendar-check'
  | 'chart-line'
  | 'cycleGoal'
  | 'values'
  | 'mission'
  | 'vision'
  | 'priority'
  | 'drag'
  | 'arrow-up'
  | 'arrow-down'
  | 'clock'
  | 'progress'
  | 'list'
  | 'kanban';

export const iconMap: Record<IconName, React.ComponentType<SvgIconProps>> = {
  // Elementos Estratégicos
  perspective: AccountTreeOutlined,
  program: TrackChangesOutlined,
  action: LaunchOutlined,
  objective: AssessmentOutlined,
  initiative: EmojiObjectsOutlined,
  indicator: ShowChartOutlined,
  risk: WarningOutlined,
  milestone: FlagOutlined,
  task: TaskOutlined,
  // Documentos
  download: FileDownloadOutlined,
  pdf: PictureAsPdfOutlined,
  excel: TableChartOutlined,
  powerpoint: SlideshowOutlined,
  report: DescriptionOutlined,
  document: ListAltOutlined,
  'file-pdf': PictureAsPdfOutlined,
  // Navegação
  next: NavigateNextOutlined,
  more: MoreVertOutlined,
  menu: MenuOutlined,
  dashboard: DashboardOutlined,
  expand_less: ExpandLessOutlined,
  expand_more: ExpandMoreOutlined,
  back: ArrowBackOutlined,
  pen: EditNoteOutlined,
  // Ações
  edit: EditOutlined,
  delete: DeleteOutlined,
  view: VisibilityOutlined,
  add: AddOutlined,
  search: SearchOutlined,
  filter: FilterListOutlined,
  sort: SortOutlined,
  refresh: RefreshOutlined,
  close: CloseOutlined,
  check: CheckOutlined,
  share: ShareOutlined,
  settings: SettingsOutlined,
  sync: SyncOutlined,
  trash: DeleteSweepOutlined,
  plus: AddOutlined,
  minus: RemoveOutlined,
  times: CloseOutlined,
  eye: VisibilityOutlined,
  // Status
  warning: WarningOutlined,
  error: ErrorOutlined,
  info: InfoOutlined,
  help: HelpOutlined,
  success: CheckCircleOutlined,
  pending: PendingActionsOutlined,
  in_progress: SyncOutlined,
  completed: CheckCircleOutlineOutlined,
  delayed: ErrorOutlineOutlined,
  cancelled: CancelOutlined,
  on_track: CheckCircleOutlined,
  at_risk: WarningAmberOutlined,
  behind: ErrorOutlined,
  // Análise
  chart: BarChartOutlined,
  timeline: TimelineOutlined,
  trend: ShowChartOutlined,
  analytics: QueryStatsOutlined,
  performance: SpeedOutlined,
  goal: TrackChangesOutlined,
  'trending-up': TrendingUpOutlined,
  'trending-down': TrendingDownOutlined,
  // Organizacional
  team: GroupOutlined,
  department: AccountTreeOutlined,
  organization: LayersOutlined,
  notification: NotificationsOutlined,
  // Arquivos
  'file-alt': FileCopyOutlined,
  'file-excel': TableChartOutlined,
  // Header
  dark: DarkModeOutlined,
  light: LightModeOutlined,
  message: EmailOutlined,
  account: AccountCircleOutlined,
  // Navegação Adicional
  'chevron-right': ChevronRightOutlined,
  'chevron-down': ExpandMoreOutlined,
  'calendar': CalendarTodayOutlined,
  'calendar-check': PlaylistAddCheckOutlined,
  'chart-line': ShowChartOutlined,
  'cycleGoal': TrackChangesOutlined,
  'values': GradeOutlined,
  'mission': FlagOutlined,
  'vision': EmojiObjectsOutlined,
  'priority': PriorityHighOutlined,
  'drag': DragIndicatorOutlined,
  'arrow-up': ArrowUpwardOutlined,
  'arrow-down': ArrowDownwardOutlined,
  'clock': AccessTimeOutlined,
  'progress': SpeedOutlined,
  'list': FormatListBulletedOutlined,
  'kanban': ViewColumnOutlined,
};

// Definindo cores padrão para documentos
const documentColors = {
  pdf: colors.status.danger,
  excel: colors.status.success,
  powerpoint: colors.status.warning,
  document: colors.info.main
};

export const iconColors: Record<IconName, string> = {
  // Elementos Estratégicos
  perspective: colors.strategic.perspective,
  program: colors.strategic.program,
  action: colors.strategic.program,
  objective: colors.strategic.objective,
  initiative: colors.strategic.initiative,
  indicator: colors.strategic.indicator,
  risk: colors.strategic.risk,
  milestone: colors.strategic.program,
  task: colors.strategic.initiative,
  // Documentos
  download: colors.neutral.text,
  pdf: documentColors.pdf,
  excel: documentColors.excel,
  powerpoint: documentColors.powerpoint,
  report: documentColors.document,
  document: documentColors.document,
  'file-pdf': documentColors.pdf,
  // Navegação
  next: colors.neutral.text,
  more: colors.neutral.text,
  menu: colors.neutral.text,
  dashboard: colors.neutral.text,
  expand_less: colors.neutral.text,
  expand_more: colors.neutral.text,
  back: colors.neutral.text,
  pen: colors.info.main,
  // Ações
  edit: colors.info.main,
  delete: colors.status.danger,
  view: colors.status.success,
  add: colors.status.success,
  search: colors.neutral.text,
  filter: colors.neutral.text,
  sort: colors.neutral.text,
  refresh: colors.neutral.text,
  close: colors.neutral.text,
  check: colors.status.success,
  share: colors.info.main,
  settings: colors.neutral.text,
  sync: colors.neutral.text,
  trash: colors.status.danger,
  plus: colors.status.success,
  minus: colors.status.danger,
  times: colors.status.danger,
  eye: colors.info.main,
  'file-alt': documentColors.document,
  'file-excel': documentColors.excel,
  // Status
  warning: colors.status.warning,
  error: colors.status.danger,
  info: colors.info.main,
  help: colors.info.main,
  success: colors.status.success,
  pending: colors.status.warning,
  in_progress: colors.info.main,
  completed: colors.status.success,
  delayed: colors.status.warning,
  cancelled: colors.status.danger,
  on_track: colors.status.success,
  at_risk: colors.status.warning,
  behind: colors.status.danger,
  // Análise
  chart: colors.info.main,
  timeline: colors.strategic.perspective,
  trend: colors.status.success,
  analytics: colors.status.warning,
  performance: colors.strategic.objective,
  goal: colors.status.danger,
  'trending-up': colors.status.success,
  'trending-down': colors.status.danger,
  // Organizacional
  team: colors.info.main,
  department: colors.status.success,
  organization: colors.strategic.perspective,
  notification: colors.neutral.text,
  // Header
  dark: colors.neutral.text,
  light: colors.neutral.text,
  message: colors.neutral.text,
  account: colors.neutral.text,
  // Navegação Adicional
  'chevron-right': colors.neutral.text,
  'chevron-down': colors.neutral.text,
  calendar: colors.neutral.text,
  'calendar-check': colors.neutral.text,
  'chart-line': colors.neutral.text,
  cycleGoal: colors.neutral.text,
  values: colors.neutral.text,
  mission: colors.neutral.text,
  vision: colors.neutral.text,
  priority: colors.neutral.text,
  drag: colors.neutral.text,
  'arrow-up': colors.neutral.text,
  'arrow-down': colors.neutral.text,
  // Novos mapeamentos de cores
  'back': colors.neutral.text,
  'pen': colors.info.main,
  'file-pdf': documentColors.pdf,
  'on_track': colors.status.success,
  'at_risk': colors.status.warning,
  'behind': colors.status.danger,
  clock: colors.neutral.text,
  progress: colors.neutral.text,
  list: colors.neutral.text,
  kanban: colors.neutral.text,
  // Status
  warning: colors.status.warning,
  error: colors.status.danger,
  info: colors.info.main,
  help: colors.info.main,
  success: colors.status.success,
  pending: colors.status.warning,
  in_progress: colors.info.main,
  completed: colors.status.success,
  delayed: colors.status.warning,
  cancelled: colors.status.danger,
  on_track: colors.status.success,
  at_risk: colors.status.warning,
  behind: colors.status.danger,
};

interface IconProps {
  name: IconName;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'medium',
  color,
  className
}) => {
  const IconComponent = iconMap[name] || QuestionMarkOutlined;
  const defaultColor = iconColors[name];

  const sizeMap = {
    small: '1rem',
    medium: '1.5rem',
    large: '2rem'
  };

  return (
    <IconComponent
      sx={{
        width: sizeMap[size],
        height: sizeMap[size],
        color: color || defaultColor
      }}
      className={className}
    />
  );
}; 