'use client';

import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus, User } from '@/types/kanban';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: (Task & { isRolledOver?: boolean; originalDate?: string })[];
  selectedDate: string;
  today: string;
  users: User[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onPostponeClick: (task: Task) => void;
  onTakeForToday: (taskId: string) => void;
  onEditClick: (task: Task) => void;
  onDeleteClick: (taskId: string) => void;
  onQuickAdd: (status: TaskStatus) => void;
}

export function KanbanBoard({
  tasks,
  selectedDate,
  today,
  users,
  onStatusChange,
  onPostponeClick,
  onTakeForToday,
  onEditClick,
  onDeleteClick,
  onQuickAdd,
}: KanbanBoardProps) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  const handleDropTaskToColumn = (targetStatus: TaskStatus) => {
    if (!draggingTaskId) return;
    onStatusChange(draggingTaskId, targetStatus);
    setDraggingTaskId(null);
  };

  // Divide tasks into columns
  const asignadas = tasks.filter((t) => t.status === 'asignada');
  const enCurso = tasks.filter((t) => t.status === 'en_curso');
  const finalizadas = tasks.filter((t) => t.status === 'finalizada');

  return (
    <main className="kanban-board">
      <KanbanColumn
        status="asignada"
        title="Asignada"
        tasks={asignadas}
        selectedDate={selectedDate}
        today={today}
        users={users}
        onStatusChange={onStatusChange}
        onPostponeClick={onPostponeClick}
        onTakeForToday={onTakeForToday}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onQuickAdd={onQuickAdd}
        onDropTaskToColumn={handleDropTaskToColumn}
        draggingTaskId={draggingTaskId}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />

      <KanbanColumn
        status="en_curso"
        title="En curso"
        tasks={enCurso}
        selectedDate={selectedDate}
        today={today}
        users={users}
        onStatusChange={onStatusChange}
        onPostponeClick={onPostponeClick}
        onTakeForToday={onTakeForToday}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onQuickAdd={onQuickAdd}
        onDropTaskToColumn={handleDropTaskToColumn}
        draggingTaskId={draggingTaskId}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />

      <KanbanColumn
        status="finalizada"
        title="Finalizada"
        tasks={finalizadas}
        selectedDate={selectedDate}
        today={today}
        users={users}
        onStatusChange={onStatusChange}
        onPostponeClick={onPostponeClick}
        onTakeForToday={onTakeForToday}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onQuickAdd={onQuickAdd}
        onDropTaskToColumn={handleDropTaskToColumn}
        draggingTaskId={draggingTaskId}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />
    </main>
  );
}
