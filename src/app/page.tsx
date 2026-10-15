'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Task, TaskPriority, TaskStatus } from '@/types/kanban';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchTasks, 
  createTask, 
  updateTaskStatus, 
  postponeTask, 
  updateTask, 
  deleteTask 
} from '@/lib/db';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { getTodayString, getTasksForDate } from '@/lib/dateUtils';
import { Navbar } from '@/components/Navbar';
import { WeeklyStrip } from '@/components/WeeklyStrip';
import { FilterBar } from '@/components/FilterBar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskModal } from '@/components/TaskModal';
import { PostponeModal } from '@/components/PostponeModal';
import { LoginScreen } from '@/components/LoginScreen';
import { SupervisorDashboard } from '@/components/SupervisorDashboard';
import { Cloud, CloudOff, AlertCircle } from 'lucide-react';

const FALLBACK_DATE = '2026-10-15';

export default function KanbanPage() {
  const { currentUser, users, isLoading: isAuthLoading } = useAuth();

  // State
  const [today, setToday] = useState<string>(FALLBACK_DATE);
  const [selectedDate, setSelectedDate] = useState<string>(FALLBACK_DATE);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'kanban' | 'dashboard'>('kanban');
  const [dbError, setDbError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultNewStatus, setDefaultNewStatus] = useState<TaskStatus>('asignada');

  const [isPostponeModalOpen, setIsPostponeModalOpen] = useState(false);
  const [postponingTask, setPostponingTask] = useState<Task | null>(null);

  // Set real client date upon mounting
  useEffect(() => {
    const currentToday = getTodayString();
    setToday(currentToday);
    setSelectedDate((prev) => (prev === FALLBACK_DATE ? currentToday : prev));
  }, []);

  // Fetch initial tasks
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTasks();
      setTasks(data);
      setDbError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con la base de datos';
      console.error('Failed to load tasks:', err);
      setDbError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser, loadTasks]);

  // Realtime subscription: update tasks across all devices automatically
  useEffect(() => {
    if (!currentUser) return;
    const client = getSupabase();
    if (!client) return;

    try {
      const channel = client
        .channel('realtime_kanban_tasks')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'kanban_tasks' },
          () => {
            loadTasks();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription not supported or failed:', err);
    }
  }, [currentUser, loadTasks]);

  // Compute tasks for the selected date (including Carry-over / Rollover from previous days!)
  const dayAugmentedTasks = useMemo(() => {
    return getTasksForDate(tasks, selectedDate);
  }, [tasks, selectedDate]);

  // Apply role permissions & search/dropdown filters
  const filteredTasks = useMemo(() => {
    if (!currentUser) return [];

    return dayAugmentedTasks.filter((task) => {
      // Role permission: Regular user ONLY sees their own tasks
      if (currentUser.role !== 'admin') {
        const isAssignedToMe =
          task.assigned_to === currentUser.name ||
          task.assigned_to === currentUser.username;
        if (!isAssignedToMe) return false;
      } else {
        // Admin / Supervisor can see all, or filter by specific user
        if (selectedAssignee !== 'all' && task.assigned_to !== selectedAssignee) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesAssignee = task.assigned_to.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAssignee) return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [dayAugmentedTasks, searchQuery, selectedAssignee, selectedPriority, currentUser]);

  const rolledOverCount = useMemo(() => {
    return filteredTasks.filter((t) => t.isRolledOver).length;
  }, [filteredTasks]);

  // Handlers
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const prevTasks = [...tasks];
    const now = new Date().toISOString();
    setTasks((current) =>
      current.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completed_at: newStatus === 'finalizada' ? now : null,
              updated_at: now,
            }
          : t
      )
    );

    try {
      await updateTaskStatus(taskId, newStatus);
      setDbError(null);
    } catch (err: unknown) {
      console.error('Error updating status:', err);
      setTasks(prevTasks); // Rollback
      setDbError(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  const handlePostponeClick = (task: Task) => {
    setPostponingTask(task);
    setIsPostponeModalOpen(true);
  };

  const handlePostponeConfirm = async (taskId: string, newDate: string) => {
    const prevTasks = [...tasks];
    setTasks((current) =>
      current.map((t) =>
        t.id === taskId
          ? { ...t, scheduled_date: newDate, updated_at: new Date().toISOString() }
          : t
      )
    );

    try {
      await postponeTask(taskId, newDate);
      setDbError(null);
    } catch (err: unknown) {
      console.error('Error postponing task:', err);
      setTasks(prevTasks);
      setDbError(err instanceof Error ? err.message : 'Error al posponer tarea');
    }
  };

  const handleTakeForToday = async (taskId: string) => {
    await handlePostponeConfirm(taskId, today);
    setSelectedDate(today);
  };

  const handleQuickAdd = (status: TaskStatus) => {
    setEditingTask(null);
    setDefaultNewStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteClick = async (taskId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

    const prevTasks = [...tasks];
    setTasks((current) => current.filter((t) => t.id !== taskId));

    try {
      await deleteTask(taskId);
      setDbError(null);
    } catch (err: unknown) {
      console.error('Error deleting task:', err);
      setTasks(prevTasks);
      setDbError(err instanceof Error ? err.message : 'Error al eliminar tarea');
    }
  };

  const handleSaveTask = async (taskData: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    scheduled_date: string;
    assigned_to: string;
  }) => {
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, taskData);
        setTasks((current) =>
          current.map((t) => (t.id === editingTask.id ? { ...t, ...updated } : t))
        );
      } else {
        const created = await createTask({
          ...taskData,
          created_by: currentUser?.name || 'Usuario',
          completed_at: taskData.status === 'finalizada' ? new Date().toISOString() : null,
        });
        setTasks((current) => [created, ...current]);
      }
      setDbError(null);
    } catch (err: unknown) {
      console.error('Error saving task:', err);
      const msg = err instanceof Error ? err.message : 'Error al guardar tarea';
      setDbError(msg);
      throw err;
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAssignee('all');
    setSelectedPriority('all');
  };

  // If not logged in, render the dedicated Login Screen Gatekeeper!
  if (isAuthLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
        fontSize: '0.95rem',
      }}>
        Cargando sesión...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  const isAdmin = currentUser.role === 'admin';
  const isCloudConnected = isSupabaseConfigured();

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        onOpenNewTask={() => {
          setEditingTask(null);
          setDefaultNewStatus('asignada');
          setIsTaskModalOpen(true);
        }}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Sync Status Callout if not connected to Cloud DB */}
        {!isCloudConnected && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            color: '#fbbf24',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CloudOff size={16} />
              <span>
                <strong>Atención:</strong> La sincronización en la nube no está activa en este dispositivo. Para que tus tareas aparezcan en todos tus dispositivos, asegúrate de haber configurado <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en Netlify.
              </span>
            </div>
          </div>
        )}

        {/* Global Database Error Notification */}
        {dbError && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            color: '#fb7185',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{dbError}</span>
            </div>
            <button
              type="button"
              onClick={() => setDbError(null)}
              style={{ color: '#fb7185', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Supervisor Dashboard View */}
        {isAdmin && activeView === 'dashboard' ? (
          <SupervisorDashboard tasks={tasks} users={users} today={today} />
        ) : (
          /* Kanban Board View */
          <>
            {/* Weekly strip navigation */}
            <WeeklyStrip
              selectedDate={selectedDate}
              today={today}
              onSelectDate={setSelectedDate}
              tasks={tasks}
            />

            {/* Filter & Date Focus Bar */}
            <FilterBar
              selectedDate={selectedDate}
              today={today}
              totalTasks={filteredTasks.length}
              rolledOverCount={rolledOverCount}
              users={users}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedAssignee={selectedAssignee}
              onAssigneeChange={setSelectedAssignee}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              onResetFilters={handleResetFilters}
              isAdmin={isAdmin}
            />

            {/* 3 Columns Kanban Board */}
            <KanbanBoard
              tasks={filteredTasks}
              selectedDate={selectedDate}
              today={today}
              users={users}
              onStatusChange={handleStatusChange}
              onPostponeClick={handlePostponeClick}
              onTakeForToday={handleTakeForToday}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onQuickAdd={handleQuickAdd}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultDate={selectedDate}
        defaultStatus={defaultNewStatus}
      />

      <PostponeModal
        isOpen={isPostponeModalOpen}
        onClose={() => {
          setIsPostponeModalOpen(false);
          setPostponingTask(null);
        }}
        task={postponingTask}
        today={today}
        onPostponeConfirm={handlePostponeConfirm}
      />
    </div>
  );
}
