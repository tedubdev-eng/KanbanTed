export type TaskStatus = 'asignada' | 'en_curso' | 'finalizada';

export type TaskPriority = 'baja' | 'media' | 'alta' | 'urgente';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  name: string;
  password?: string;
  role: UserRole;
  avatar_color?: string;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  scheduled_date: string; // YYYY-MM-DD
  assigned_to: string; // User's name or username
  created_by: string; // User's name or username
  completed_at?: string | null; // ISO timestamp
  created_at: string;
  updated_at: string;
  // Computed / UI properties
  isRolledOver?: boolean; // True if scheduled_date < selectedDate and status !== 'finalizada'
  originalDate?: string;
}

export interface DayOverview {
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. "Lun", "Mar"
  dayNumber: number; // e.g. 15
  isToday: boolean;
  isSelected: boolean;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  rolledOverTasks: number;
}
