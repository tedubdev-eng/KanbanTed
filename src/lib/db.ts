import { Task, TaskPriority, TaskStatus, User } from '@/types/kanban';
import { getSupabase } from './supabase';
import { getTodayString, addDays } from './dateUtils';

const STORAGE_USERS_KEY = 'kanban_users_v3';
const STORAGE_TASKS_KEY = 'kanban_tasks_v3';

const DEFAULT_USERS: User[] = [
  { id: 'u1', username: 'Ted', name: 'Teddy Machicado', avatar_color: '#6366f1', password: 'ted123', role: 'admin' },
  { id: 'u2', username: 'Quique', name: 'Enrique Rojas', avatar_color: '#ec4899', password: 'quique123', role: 'user' },
  { id: 'u3', username: 'Sergio', name: 'Sergio Ayala', avatar_color: '#06b6d4', password: 'sayala123', role: 'user' },
  { id: 'u4', username: 'Franklin', name: 'Franklin Luque', avatar_color: '#10b981', password: 'frank123', role: 'user' },
  { id: 'u5', username: 'Gabriela', name: 'Gabriela Salazar', avatar_color: '#d946ef', password: 'gabriela123', role: 'user' },
];

function getDefaultTasks(): Task[] {
  const today = getTodayString();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  return [
    {
      id: 'task-1',
      title: 'Revisión de requerimientos y arquitectura',
      description: 'Verificar diseño de base de datos relacional y flujo de tareas acumuladas.',
      status: 'asignada',
      priority: 'alta',
      scheduled_date: yesterday, // Acumulada de ayer!
      assigned_to: 'Teddy Machicado',
      created_by: 'Teddy Machicado',
      completed_at: null,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Implementar tablero Kanban interactivo',
      description: 'Columnas de asignada, en curso y finalizada con capacidad de arrastrar y posponer.',
      status: 'en_curso',
      priority: 'urgente',
      scheduled_date: today,
      assigned_to: 'Teddy Machicado',
      created_by: 'Enrique Rojas',
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Configurar conexión con Supabase PostgreSQL',
      description: 'Tablas de usuarios y tareas con claves foráneas e índices optimizados.',
      status: 'asignada',
      priority: 'alta',
      scheduled_date: today,
      assigned_to: 'Sergio Ayala',
      created_by: 'Teddy Machicado',
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Definir paleta de colores y componentes visuales',
      description: 'Diseño responsive de alto impacto con glassmorphism y microinteracciones.',
      status: 'finalizada',
      priority: 'media',
      scheduled_date: today,
      assigned_to: 'Gabriela Salazar',
      created_by: 'Franklin Luque',
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Preparar despliegue en Netlify',
      description: 'Verificar build de Next.js, netlify.toml y variables de entorno.',
      status: 'asignada',
      priority: 'media',
      scheduled_date: tomorrow,
      assigned_to: 'Franklin Luque',
      created_by: 'Sergio Ayala',
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

// Local storage helpers
function getLocalUsers(): User[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

function saveLocalUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function getLocalTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_TASKS_KEY);
    if (!raw) {
      const defaults = getDefaultTasks();
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
}

// Unified Database API

export async function fetchUsers(): Promise<User[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('kanban_users')
        .select('id, username, name, role, avatar_color, created_at')
        .order('name');
      if (error) {
        console.error('Error fetching users from Supabase:', error.message);
        return getLocalUsers();
      }
      if (data && data.length > 0) {
        return data as User[];
      }
    } catch (err) {
      console.error('Supabase fetchUsers failed:', err);
      return getLocalUsers();
    }
  }
  return getLocalUsers();
}

export async function loginUser(username: string, password: string): Promise<User | null> {
  const normalizedUser = username.trim().toLowerCase();
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client
        .from('kanban_users')
        .select('id, username, name, role, avatar_color, created_at')
        .ilike('username', normalizedUser)
        .eq('password', password)
        .maybeSingle();

      if (error) {
        console.error('Supabase login error:', error.message);
      } else if (data) {
        return data as User;
      }
    } catch (err) {
      console.error('Supabase loginUser failed:', err);
    }
  }

  // Fallback / Local mode
  const users = getLocalUsers();
  const found = users.find((u) => u.username.toLowerCase() === normalizedUser);
  if (found) {
    if (found.password && found.password !== password) {
      return null;
    }
    return found;
  }

  return null;
}

export async function registerUser(username: string, name: string, password: string): Promise<User> {
  const normalizedUser = username.trim().toLowerCase();
  const colors = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client
        .from('kanban_users')
        .insert({
          username: normalizedUser,
          name: name.trim(),
          password: password,
          role: 'user',
          avatar_color: randomColor,
        })
        .select('id, username, name, role, avatar_color, created_at')
        .single();

      if (error) throw error;
      return data as User;
    } catch (err) {
      console.error('Supabase register error:', err);
    }
  }

  // Fallback / Local mode
  const users = getLocalUsers();
  const existing = users.find((u) => u.username.toLowerCase() === normalizedUser);
  if (existing) {
    return existing;
  }

  const newUser: User = {
    id: 'u_' + Date.now(),
    username: normalizedUser,
    name: name.trim(),
    role: 'user',
    avatar_color: randomColor,
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  saveLocalUsers(users);
  return newUser;
}

export async function fetchTasks(): Promise<Task[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('kanban_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks from Supabase:', error.message);
        return getLocalTasks();
      }
      if (data) {
        return data as Task[];
      }
    } catch (err) {
      console.error('Supabase fetchTasks failed:', err);
      return getLocalTasks();
    }
  }
  return getLocalTasks();
}

export async function createTask(
  taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<Task> {
  const now = new Date().toISOString();
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client
        .from('kanban_tasks')
        .insert({
          title: taskData.title.trim(),
          description: taskData.description || '',
          status: taskData.status,
          priority: taskData.priority,
          scheduled_date: taskData.scheduled_date,
          assigned_to: taskData.assigned_to,
          created_by: taskData.created_by,
          completed_at: taskData.status === 'finalizada' ? now : null,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase createTask error:', error.message);
      } else if (data) {
        return data as Task;
      }
    } catch (err) {
      console.error('Supabase createTask exception:', err);
    }
  }

  // Local fallback
  const tasks = getLocalTasks();
  const newTask: Task = {
    ...taskData,
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    completed_at: taskData.status === 'finalizada' ? now : null,
    created_at: now,
    updated_at: now,
  };
  tasks.unshift(newTask);
  saveLocalTasks(tasks);
  return newTask;
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus
): Promise<Task> {
  const now = new Date().toISOString();
  const completed_at = newStatus === 'finalizada' ? now : null;
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client
        .from('kanban_tasks')
        .update({
          status: newStatus,
          completed_at: completed_at,
          updated_at: now,
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Supabase updateTaskStatus error:', error.message);
      } else if (data) {
        return data as Task;
      }
    } catch (err) {
      console.error('Supabase updateTaskStatus exception:', err);
    }
  }

  // Local fallback
  const tasks = getLocalTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) throw new Error('Tarea no encontrada');

  tasks[idx] = {
    ...tasks[idx],
    status: newStatus,
    completed_at: completed_at,
    updated_at: now,
  };
  saveLocalTasks(tasks);
  return tasks[idx];
}

export async function postponeTask(
  taskId: string,
  newDate: string
): Promise<Task> {
  const now = new Date().toISOString();
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client
        .from('kanban_tasks')
        .update({
          scheduled_date: newDate,
          updated_at: now,
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Supabase postponeTask error:', error.message);
      } else if (data) {
        return data as Task;
      }
    } catch (err) {
      console.error('Supabase postponeTask exception:', err);
    }
  }

  // Local fallback
  const tasks = getLocalTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) throw new Error('Tarea no encontrada');

  tasks[idx] = {
    ...tasks[idx],
    scheduled_date: newDate,
    updated_at: now,
  };
  saveLocalTasks(tasks);
  return tasks[idx];
}

export async function updateTask(
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'created_at'>>
): Promise<Task> {
  const now = new Date().toISOString();
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client
        .from('kanban_tasks')
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Supabase updateTask error:', error.message);
      } else if (data) {
        return data as Task;
      }
    } catch (err) {
      console.error('Supabase updateTask exception:', err);
    }
  }

  // Local fallback
  const tasks = getLocalTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) throw new Error('Tarea no encontrada');

  tasks[idx] = {
    ...tasks[idx],
    ...updates,
    updated_at: now,
  };
  saveLocalTasks(tasks);
  return tasks[idx];
}

export async function deleteTask(taskId: string): Promise<void> {
  const client = getSupabase();

  if (client) {
    try {
      const { error } = await client
        .from('kanban_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Supabase deleteTask error:', error.message);
      }
    } catch (err) {
      console.error('Supabase deleteTask exception:', err);
    }
  }

  // Local fallback
  const tasks = getLocalTasks();
  const filtered = tasks.filter((t) => t.id !== taskId);
  saveLocalTasks(filtered);
}
