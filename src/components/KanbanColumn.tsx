'use client';

import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus, User } from '@/types/kanban';
import { TaskCard } from './TaskCard';
import { Plus, CheckCircle, Clock, Inbox } from 'lucide-react';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
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
  onDropTaskToColumn: (targetStatus: TaskStatus) => void;
  draggingTaskId: string | null;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export function KanbanColumn({
  status,
  title,
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
  onDropTaskToColumn,
  draggingTaskId,
  onDragStart,
  onDragEnd,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDropTaskToColumn(status);
  };

  return (
    <div
      className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      id={`column-${status}`}
    >
      {/* Column Header */}
      <div className="column-header">
        <div className="column-title-wrap">
          <span className={`column-dot ${status}`} />
          <h2 className="column-title">{title}</h2>
          <span className="column-count">{tasks.length}</span>
        </div>

        <button
          type="button"
          className="icon-btn"
          style={{ width: '28px', height: '28px' }}
          onClick={() => onQuickAdd(status)}
          title={`Agregar tarea a ${title}`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Column Body with Cards */}
      <div className="column-body">
        {tasks.length === 0 ? (
          <div className="empty-state">
            {status === 'asignada' && <Inbox size={28} strokeWidth={1.5} />}
            {status === 'en_curso' && <Clock size={28} strokeWidth={1.5} />}
            {status === 'finalizada' && <CheckCircle size={28} strokeWidth={1.5} />}
            <span>No hay tareas en {title.toLowerCase()}</span>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', marginTop: '0.25rem' }}
              onClick={() => onQuickAdd(status)}
            >
              + Agregar tarea
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              selectedDate={selectedDate}
              today={today}
              users={users}
              onStatusChange={onStatusChange}
              onPostponeClick={onPostponeClick}
              onTakeForToday={onTakeForToday}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
              isDragging={draggingTaskId === task.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}
