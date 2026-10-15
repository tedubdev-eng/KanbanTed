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
import { getTodayString, getTasksForDate } from '@/lib/dateUtils';
import { Navbar } from '@/components/Navbar';
import { WeeklyStrip } from '@/components/WeeklyStrip';
import { FilterBar } from '@/components/FilterBar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskModal } from '@/components/TaskModal';
import { PostponeModal } from '@/components/PostponeModal';
import { AuthModal } from '@/components/AuthModal';
import { SupabaseBanner, SupabaseInfoModal } from '@/components/SupabaseBanner';

const FALLBACK_DATE = '2026-10-15';

export default function KanbanPage() {
  const { currentUser, users } = useAuth();

  // State
  const [today, setToday] = useState<string>(FALLBACK_DATE);
  const [selectedDate, setSelectedDate] = useState<string>(FALLBACK_DATE);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

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
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Compute tasks for the selected date (including Carry-over / Rollover from previous days!)
  const dayAugmentedTasks = useMemo(() => {
    return getTasksForDate(tasks, selectedDate);
  }, [tasks, selectedDate]);

  // Apply search and dropdown filters
  const filteredTasks = useMemo(() => {
    return dayAugmentedTasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesAssignee = task.assigned_to.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAssignee) return false;
      }

      // Assignee
      if (selectedAssignee !== 'all' && task.assigned_to !== selectedAssignee) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [dayAugmentedTasks, searchQuery, selectedAssignee, selectedPriority]);

  const rolledOverCount = useMemo(() => {
    return dayAugmentedTasks.filter((t) => t.isRolledOver).length;
  }, [dayAugmentedTasks]);

  // Handlers
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
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
    } catch (err) {
      console.error('Error updating status:', err);
      setTasks(prevTasks); // Rollback
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
    } catch (err) {
      console.error('Error postponing task:', err);
      setTasks(prevTasks);
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
    } catch (err) {
      console.error('Error deleting task:', err);
      setTasks(prevTasks);
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
    if (editingTask) {
      // Update
      const updated = await updateTask(editingTask.id, taskData);
      setTasks((current) =>
        current.map((t) => (t.id === editingTask.id ? { ...t, ...updated } : t))
      );
    } else {
      // Create
      const created = await createTask({
        ...taskData,
        created_by: currentUser?.name || 'Usuario',
        completed_at: taskData.status === 'finalizada' ? new Date().toISOString() : null,
      });
      setTasks((current) => [created, ...current]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAssignee('all');
    setSelectedPriority('all');
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        onOpenNewTask={() => {
          setEditingTask(null);
          setDefaultNewStatus('asignada');
          setIsTaskModalOpen(true);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenInfo={() => setIsInfoModalOpen(true)}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Supabase status banner */}
        <SupabaseBanner onOpenInfo={() => setIsInfoModalOpen(true)} />

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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SupabaseInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
