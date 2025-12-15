import { create } from 'zustand';
import { TaskStore, Task, TaskStep, Notification } from '@/types';

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  taskSteps: [],
  notifications: [],
  loading: false,
  error: null,

  setTasks: (tasks: Task[]) => set({ tasks }),

  setTaskSteps: (taskSteps: TaskStep[]) => set({ taskSteps }),

  addTask: (task: Task) => 
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id: string, updates: Partial<Task>) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),

  updateTaskStep: (id: string, updates: Partial<TaskStep>) =>
    set((state) => ({
      taskSteps: state.taskSteps.map((step) =>
        step.id === id ? { ...step, ...updates } : step
      ),
    })),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),

  // New notification methods
  setNotifications: (notifications: Notification[]) => set({ notifications }),

  addNotification: (notification: Notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),

  markNotificationAsRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    })),

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),

  // Search and filter
  searchTasks: (query: string) => {
    const { tasks } = get();
    if (!query.trim()) return tasks;
    
    const lowerQuery = query.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery)
    );
  },

  filterTasks: (filters: {
    status?: string;
    priority?: string;
    due_date?: string;
  }) => {
    const { tasks } = get();
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.due_date && task.due_date !== filters.due_date) return false;
      return true;
    });
  },
}));