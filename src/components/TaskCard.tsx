'use client';

import React from 'react';
import { Task, TaskPriority, TaskStatus, User } from '@/types/kanban';
import { formatShortDate, getTodayString } from '@/lib/dateUtils';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  CalendarClock, 
  Sun, 
  Edit2, 
  Trash2,
  AlertCircle
} from 'lucide-react';

interface TaskCardProps {
  task: Task & { isRolledOver?: boolean; originalDate?: string };
  selectedDate: string;
  today: string;
  users: User[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onPostponeClick: (task: Task) => void;
  onTakeForToday: (taskId: string) => void;
  onEditClick: (task: Task) => void;
  onDeleteClick: (taskId: string) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export function TaskCard({
  task,
  selectedDate,
  today,
  users,
  onStatusChange,
  onPostponeClick,
  onTakeForToday,
  onEditClick,
  onDeleteClick,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const assignedUser = users.find((u) => u.name === task.assigned_to || u.username === task.assigned_to);
  const avatarColor = assignedUser?.avatar_color || '#6366f1';

  // Can take for today if scheduled date is not today, or if rolled over from a past date
  const canTakeForToday = task.scheduled_date !== today && task.status !== 'finalizada';

  return (
    <div
      className={`task-card ${isDragging ? 'is-dragging' : ''} ${task.isRolledOver ? 'rolled-over' : ''}`}
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      id={`task-card-${task.id}`}
    >
      {/* Header Row: Priority & Rollover badge */}
      <div className="card-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`priority-tag ${task.priority}`}>
            {task.priority === 'urgente' && <AlertCircle size={11} />}
            {task.priority}
          </span>

          {task.isRolledOver && task.originalDate && (
            <span 
              className="rolled-over-badge" 
              title={`Esta tarea quedó pendiente desde el ${task.originalDate} y se ha acumulado en el tablero de hoy.`}
            >
              <CalendarClock size={11} />
              Acumulada ({formatShortDate(task.originalDate)})
            </span>
          )}
        </div>

        {/* Quick Edit/Delete Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '24px', height: '24px' }}
            onClick={() => onEditClick(task)}
            title="Editar tarea"
          >
            <Edit2 size={12} />
          </button>
          <button
            type="button"
            className="icon-btn"
            style={{ width: '24px', height: '24px', color: '#f87171' }}
            onClick={() => onDeleteClick(task.id)}
            title="Eliminar tarea"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="card-title">{task.title}</h3>

      {/* Description if any */}
      {task.description && (
        <p className="card-description">{task.description}</p>
      )}

      {/* Card Footer: Assignee & Action Buttons */}
      <div className="card-footer">
        {/* Assignee */}
        <div className="assignee-info" title={`Asignada a: ${task.assigned_to}`}>
          <div className="assignee-avatar-sm" style={{ backgroundColor: avatarColor }}>
            {task.assigned_to ? task.assigned_to.charAt(0).toUpperCase() : '?'}
          </div>
          <span style={{ fontWeight: 600, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {task.assigned_to || 'Sin asignar'}
          </span>
        </div>

        {/* Actions */}
        <div className="card-actions">
          {/* Postpone button */}
          {task.status !== 'finalizada' && (
            <button
              type="button"
              className="action-btn-pill postpone"
              onClick={() => onPostponeClick(task)}
              title="Posponer para mañana o agendar para otra fecha"
            >
              <CalendarClock size={13} />
              <span>Posponer</span>
            </button>
          )}

          {/* Take for Today button */}
          {canTakeForToday && (
            <button
              type="button"
              className="action-btn-pill today"
              onClick={() => onTakeForToday(task.id)}
              title="Tomar y fijar como tarea de hoy"
            >
              <Sun size={13} />
              <span>Para hoy</span>
            </button>
          )}

          {/* Quick status transition */}
          {task.status === 'asignada' && (
            <button
              type="button"
              className="action-btn-pill"
              onClick={() => onStatusChange(task.id, 'en_curso')}
              title="Mover a En curso"
              style={{ color: '#fbbf24' }}
            >
              <span>Iniciar</span>
              <ArrowRight size={12} />
            </button>
          )}

          {task.status === 'en_curso' && (
            <button
              type="button"
              className="action-btn-pill"
              onClick={() => onStatusChange(task.id, 'finalizada')}
              title="Completar tarea"
              style={{ color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}
            >
              <CheckCircle2 size={12} />
              <span>Finalizar</span>
            </button>
          )}

          {task.status === 'finalizada' && (
            <button
              type="button"
              className="action-btn-pill"
              onClick={() => onStatusChange(task.id, 'en_curso')}
              title="Reabrir a En curso"
              style={{ color: '#9ca3af' }}
            >
              <RotateCcw size={11} />
              <span>Reabrir</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
