'use client';

import React from 'react';
import { Task } from '@/types/kanban';
import { 
  getWeekDates, 
  getDayNameShort, 
  getDayNumber, 
  addDays, 
  getTodayString, 
  getTasksForDate,
  formatDatePretty
} from '@/lib/dateUtils';
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';

interface WeeklyStripProps {
  selectedDate: string;
  today: string;
  onSelectDate: (date: string) => void;
  tasks: Task[];
}

export function WeeklyStrip({ selectedDate, today, onSelectDate, tasks }: WeeklyStripProps) {
  const weekDays = getWeekDates(selectedDate);

  const handlePrevWeek = () => {
    onSelectDate(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    onSelectDate(addDays(selectedDate, 7));
  };

  const handleGoToday = () => {
    onSelectDate(today);
  };

  return (
    <section className="weekly-container">
      {/* Header with week navigation */}
      <div className="weekly-header">
        <div className="weekly-title-group">
          <div className="weekly-title">Seguimiento Semanal</div>
          <div className="weekly-subtitle">
            Selecciona un día para visualizar su tablero Kanban y tareas acumuladas
          </div>
        </div>

        <div className="weekly-controls">
          <button 
            type="button" 
            className="icon-btn" 
            onClick={handlePrevWeek} 
            title="Semana anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <button 
            type="button" 
            className="btn-today" 
            onClick={handleGoToday}
          >
            <Sparkles size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
            Hoy ({getDayNumber(today)})
          </button>

          <button 
            type="button" 
            className="icon-btn" 
            onClick={handleNextWeek} 
            title="Semana siguiente"
          >
            <ChevronRight size={18} />
          </button>

          {/* Date Picker Input */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <input 
              type="date" 
              aria-label="Seleccionar fecha"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) onSelectDate(e.target.value);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-sm)',
                color: '#e5e7eb',
                padding: '0.35rem 0.5rem',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                colorScheme: 'dark',
              }}
            />
          </div>
        </div>
      </div>

      {/* 7 Days Badges Grid */}
      <div className="days-grid">
        {weekDays.map((dateStr) => {
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const dayName = getDayNameShort(dateStr);
          const dayNum = getDayNumber(dateStr);

          // Calculate tasks for this date (using the carry-over / rollover logic!)
          const dayTasks = getTasksForDate(tasks, dateStr);
          const total = dayTasks.length;
          const done = dayTasks.filter((t) => t.status === 'finalizada').length;
          const pending = total - done;
          const rolledOverCount = dayTasks.filter((t) => t.isRolledOver).length;

          return (
            <button
              key={dateStr}
              type="button"
              className={`day-card ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}`}
              onClick={() => onSelectDate(dateStr)}
              title={`${formatDatePretty(dateStr)} - ${total} tareas (${pending} pendientes, ${done} finalizadas)`}
            >
              <span className="day-name">{dayName}</span>
              <span className="day-number">{dayNum}</span>

              {/* Task Metrics Badges */}
              <div className="day-metrics">
                {total === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Sin tareas</span>
                ) : (
                  <>
                    <span 
                      className="pill-metric pill-pending" 
                      title={`${pending} tareas pendientes/activas`}
                    >
                      {pending}
                    </span>
                    {done > 0 && (
                      <span 
                        className="pill-metric pill-done" 
                        title={`${done} finalizadas`}
                      >
                        ✓{done}
                      </span>
                    )}
                    {rolledOverCount > 0 && (
                      <span 
                        className="pill-metric pill-rolled" 
                        title={`${rolledOverCount} tareas acumuladas de días anteriores`}
                      >
                        +{rolledOverCount}
                      </span>
                    )}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
