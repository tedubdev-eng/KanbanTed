'use client';

import React, { useState } from 'react';
import { Task } from '@/types/kanban';
import { addDays, getTodayString, getMondayOfWeek, formatDatePretty } from '@/lib/dateUtils';
import { CalendarClock, X, ArrowRight, Sun, Calendar } from 'lucide-react';

interface PostponeModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  today: string;
  onPostponeConfirm: (taskId: string, newDate: string) => Promise<void>;
}

export function PostponeModal({
  isOpen,
  onClose,
  task,
  today,
  onPostponeConfirm,
}: PostponeModalProps) {
  const [selectedDate, setSelectedDate] = useState(() => addDays(today || '2026-10-15', 1));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const tomorrow = addDays(today, 1);
  const inTwoDays = addDays(today, 2);
  // Next Monday
  const currentMonday = getMondayOfWeek(today);
  const nextMonday = addDays(currentMonday, 7);

  const handleQuickSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onPostponeConfirm(task.id, selectedDate);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarClock size={20} color="#fbbf24" />
            <h2 className="modal-title">Posponer Tarea</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tarea seleccionada:</span>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                {task.title}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                Actualmente programada para: <strong style={{ color: '#fbbf24' }}>{formatDatePretty(task.scheduled_date)}</strong>
              </p>
            </div>

            {/* Quick Presets */}
            <div className="form-group">
              <label className="form-label">Opciones rápidas</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn-secondary ${selectedDate === tomorrow ? 'btn-today' : ''}`}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.55rem 0.35rem',
                    flexDirection: 'column',
                    borderColor: selectedDate === tomorrow ? '#fbbf24' : undefined,
                    color: selectedDate === tomorrow ? '#fbbf24' : undefined,
                  }}
                  onClick={() => handleQuickSelect(tomorrow)}
                >
                  <Sun size={15} />
                  <span>Mañana</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+1 día</span>
                </button>

                <button
                  type="button"
                  className={`btn-secondary ${selectedDate === inTwoDays ? 'btn-today' : ''}`}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.55rem 0.35rem',
                    flexDirection: 'column',
                    borderColor: selectedDate === inTwoDays ? '#fbbf24' : undefined,
                    color: selectedDate === inTwoDays ? '#fbbf24' : undefined,
                  }}
                  onClick={() => handleQuickSelect(inTwoDays)}
                >
                  <CalendarClock size={15} />
                  <span>En 2 días</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+2 días</span>
                </button>

                <button
                  type="button"
                  className={`btn-secondary ${selectedDate === nextMonday ? 'btn-today' : ''}`}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.55rem 0.35rem',
                    flexDirection: 'column',
                    borderColor: selectedDate === nextMonday ? '#fbbf24' : undefined,
                    color: selectedDate === nextMonday ? '#fbbf24' : undefined,
                  }}
                  onClick={() => handleQuickSelect(nextMonday)}
                >
                  <Calendar size={15} />
                  <span>Próximo Lunes</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Semana prox.</span>
                </button>
              </div>
            </div>

            {/* Exact Date Picker */}
            <div className="form-group">
              <label className="form-label" htmlFor="postpone-exact-date">
                O selecciona una fecha específica
              </label>
              <input
                id="postpone-exact-date"
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                min={today}
              />
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.875rem',
              fontSize: '0.78rem',
              color: '#fcd34d',
            }}>
              La tarea se moverá al día <strong>{formatDatePretty(selectedDate)}</strong> y se mantendrá en estado &ldquo;{task.status}&rdquo;.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              disabled={isSubmitting}
            >
              <ArrowRight size={15} />
              <span>{isSubmitting ? 'Reprogramando...' : 'Confirmar y Posponer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
