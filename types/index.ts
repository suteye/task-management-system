// ========================
// App Types
// ========================

export type UserRole = 
  | 'dev' 
  | 'tl' 
  | 'tester' 
  | 'section' 
  | 'dept_head' 
  | 'ba' 
  | 'user'
  | 'admin';

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export type TaskStatus = 
  | 'todo' 
  | 'create_bcd' 
  | 'in_progress' 
  | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  priority: 'low' | 'medium' | 'high';
  // Timeline fields
  dev_start?: string;
  dev_end?: string;
  sit_start?: string;
  sit_end?: string;
  uat_start?: string;
  uat_end?: string;
  // Go Live fields
  go_live_move_day_date?: string; // ISO date string (YYYY-MM-DD) for move day
  go_live_date?: string; // ISO date string (YYYY-MM-DD) for calculated go live date (next morning)
  // Team roles assignment
  bcd_owner?: string; // ผู้รับผิดชอบสร้าง BCD
  dev_owner?: string; // ผู้รับผิดชอบ Dev
  sit_support?: string; // Support SIT
  uat_support?: string; // Support UAT
  // New features
  due_date?: string; // ISO date string (YYYY-MM-DD)
  labels?: string[]; // Array of label names
  time_tracked?: number; // Hours tracked
  time_estimated?: number; // Hours estimated
  estimated_completion?: number; // Percentage (0-100)
  user?: DatabaseUser;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
  created_by: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  mentions?: string[]; // Array of mentioned user IDs
  created_at: string;
  updated_at: string;
  user?: DatabaseUser;
}

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'completed';
  details: Record<string, any>;
  created_at: string;
  user?: DatabaseUser;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  steps: Partial<TaskStep>[];
  created_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  task_id: string;
  type: 'assigned' | 'commented' | 'status_changed' | 'due_soon' | 'overdue';
  message: string;
  read: boolean;
  created_at: string;
}

export interface TaskStep {
  id: string;
  task_id: string;
  step_no: number;
  step_name: string;
  who_create: UserRole[];
  who_approve: UserRole[];
  who_complete: UserRole[];
  output: string;
  is_done: boolean;
  done_by?: string;
  done_at?: string;
  done_by_user?: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
  task?: Task;
}

export interface TaskStore {
  tasks: Task[];
  taskSteps: TaskStep[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  setTaskSteps: (taskSteps: TaskStep[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStep: (id: string, updates: Partial<TaskStep>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  searchTasks: (query: string) => Task[];
  filterTasks: (filters: {
    status?: string;
    priority?: string;
    due_date?: string;
  }) => Task[];
}

// ========================
// Auth Types
// ========================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// ========================
// NextAuth Module Augmentation
// ========================

declare module 'next-auth' {

  interface Session {
    user: AuthUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    email?: string;
    name?: string;
    role?: UserRole;
  }
}
