'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, User } from '@/types/kanban';
import { useAuth } from '@/context/AuthContext';
import { X, Calendar, Flag, User as UserIcon } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    scheduled_date: string;
    assigned_to: string;
  }) => Promise<void>;
  initialTask?: Task | null;
  defaultDate: string;
  defaultStatus?: TaskStatus;
}

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultDate,
  defaultStatus = 'asignada',
}: TaskModalProps) {
  const { currentUser, users } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('asignada');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [scheduledDate, setScheduledDate] = useState(defaultDate);
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setStatus(initialTask.status);
      setPriority(initialTask.priority);
      setScheduledDate(initialTask.scheduled_date);
      setAssignedTo(initialTask.assigned_to);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('media');
      setScheduledDate(defaultDate);
      setAssignedTo(currentUser?.name || (users[0]?.name ?? ''));
    }
    setError('');
  }, [initialTask, defaultDate, defaultStatus, isOpen, currentUser, users]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor ingresa un título para la tarea');
      return;
    }
    if (!assignedTo) {
      setError('Por favor asigna la tarea a un usuario');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        scheduled_date: scheduledDate,
        assigned_to: assignedTo,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la tarea';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {initialTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}
          </h2>
          <button 
            type="button" 
            className="icon-btn" 
            onClick={onClose} 
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f87171',
                padding: '0.65rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
              }}>
                {error}
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">
                Título de la tarea *
              </label>
              <input
                id="task-title"
                className="form-input"
                type="text"
                placeholder="Ej. Revisar informe de ventas del cliente..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">
                Descripción (opcional)
              </label>
              <textarea
                id="task-desc"
                className="form-textarea"
                rows={3}
                placeholder="Detalles adicionales, enlaces o notas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Row 1: Priority & Status */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-prio">
                  <Flag size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Prioridad
                </label>
                <select
                  id="task-prio"
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-status">
                  Estado
                </label>
                <select
                  id="task-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                >
                  <option value="asignada">Asignada</option>
                  <option value="en_curso">En curso</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>
            </div>

            {/* Row 2: Scheduled Date & Assignee */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-date">
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Fecha programada
                </label>
                <input
                  id="task-date"
                  type="date"
                  className="form-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-assignee">
                  <UserIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Asignar a *
                </label>
                <select
                  id="task-assignee"
                  className="form-select"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (initialTask ? 'Guardar Cambios' : 'Crear Tarea')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
