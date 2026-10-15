'use client';

import React, { useState } from 'react';
import { Task, User } from '@/types/kanban';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Inbox, 
  AlertTriangle, 
  TrendingUp, 
  CalendarClock, 
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import { formatShortDate, getTodayString } from '@/lib/dateUtils';

interface SupervisorDashboardProps {
  tasks: Task[];
  users: User[];
  today: string;
}

export function SupervisorDashboard({ tasks, users, today }: SupervisorDashboardProps) {
  const [selectedUserFilter, setSelectedUserFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Global calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'finalizada').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'en_curso').length;
  const assignedTasks = tasks.filter((t) => t.status === 'asignada').length;
  
  // Pending tasks (not finished)
  const pendingTasks = tasks.filter((t) => t.status !== 'finalizada');

  // Rolled over tasks (scheduled before today and not finished)
  const overdueTasks = tasks.filter((t) => t.status !== 'finalizada' && t.scheduled_date < today);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Metrics per user
  const userMetrics = users.map((user) => {
    const userTasks = tasks.filter((t) => t.assigned_to === user.name || t.assigned_to === user.username);
    const userTotal = userTasks.length;
    const userCompleted = userTasks.filter((t) => t.status === 'finalizada').length;
    const userInProgress = userTasks.filter((t) => t.status === 'en_curso').length;
    const userAssigned = userTasks.filter((t) => t.status === 'asignada').length;
    const userOverdue = userTasks.filter((t) => t.status !== 'finalizada' && t.scheduled_date < today).length;
    const userRate = userTotal > 0 ? Math.round((userCompleted / userTotal) * 100) : 0;

    return {
      user,
      total: userTotal,
      completed: userCompleted,
      inProgress: userInProgress,
      assigned: userAssigned,
      overdue: userOverdue,
      rate: userRate,
    };
  });

  // Filter pending tasks table
  const filteredPendingTasks = pendingTasks.filter((task) => {
    if (selectedUserFilter !== 'all' && task.assigned_to !== selectedUserFilter) {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        task.assigned_to.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
          }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              Dashboard de Supervisión y Estados por Usuario
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.15rem' }}>
              Vista consolidada con seguimiento de pendientes de todos los miembros del equipo.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.25rem 0.65rem',
            background: 'rgba(245, 158, 11, 0.2)',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 'var(--radius-full)',
          }}>
            Rol Supervisor Activo
          </span>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        <div className="card-bg" style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Tareas</span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>{totalTasks}</span>
          <span style={{ fontSize: '0.72rem', color: '#a5b4fc' }}>En todo el sistema</span>
        </div>

        <div className="card-bg" style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Asignadas (Pendientes)</span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#818cf8' }}>{assignedTasks}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Por iniciar</span>
        </div>

        <div className="card-bg" style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>En Curso</span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fbbf24' }}>{inProgressTasks}</span>
          <span style={{ fontSize: '0.72rem', color: '#fcd34d' }}>Trabajándose activamente</span>
        </div>

        <div className="card-bg" style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Finalizadas</span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399' }}>{completedTasks}</span>
          <span style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>{completionRate}% de completitud</span>
        </div>

        <div className="card-bg" style={{
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#fb7185', fontWeight: 600 }}>Tareas Acumuladas</span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f43f5e' }}>{overdueTasks.length}</span>
          <span style={{ fontSize: '0.72rem', color: '#fda4af' }}>Atrasadas de días previos</span>
        </div>
      </div>

      {/* States by User (Cards Grid) */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.85rem' }}>
          Estados y Carga de Trabajo por Usuario
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {userMetrics.map(({ user, total, completed, inProgress, assigned, overdue, rate }) => (
            <div
              key={user.id}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* User Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-full)',
                    background: user.avatar_color || '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: '#fff',
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block' }}>
                      {user.name}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      @{user.username} {user.role === 'admin' && '• Admin'}
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: rate >= 70 ? '#34d399' : rate >= 40 ? '#fbbf24' : '#9ca3af',
                }}>
                  {rate}% éxito
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${rate}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1 0%, #34d399 100%)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.5s ease-in-out',
                }} />
              </div>

              {/* Metric Counts */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                textAlign: 'center',
                paddingTop: '0.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Asignadas</span>
                  <strong style={{ fontSize: '1rem', color: '#818cf8' }}>{assigned}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>En Curso</span>
                  <strong style={{ fontSize: '1rem', color: '#fbbf24' }}>{inProgress}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Finalizadas</span>
                  <strong style={{ fontSize: '1rem', color: '#34d399' }}>{completed}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Acumuladas</span>
                  <strong style={{ fontSize: '1rem', color: overdue > 0 ? '#f43f5e' : '#6b7280' }}>
                    {overdue}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Pending Tasks Table */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              Todos los Pendientes del Equipo ({filteredPendingTasks.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Tareas sin finalizar en estado Asignada o En Curso
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div className="search-input-wrap">
              <Search size={14} />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar pendiente..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>

            <select
              aria-label="Filtrar por usuario"
              className="filter-select"
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
            >
              <option value="all">Todos los miembros</option>
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Tarea</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Asignado a</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Prioridad</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Fecha Prog.</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Estado</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Condición</th>
              </tr>
            </thead>
            <tbody>
              {filteredPendingTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No se encontraron tareas pendientes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPendingTasks.map((t) => {
                  const isAccumulated = t.scheduled_date < today;
                  const assignedUser = users.find((u) => u.name === t.assigned_to || u.username === t.assigned_to);

                  return (
                    <tr
                      key={t.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        backgroundColor: isAccumulated ? 'rgba(244, 63, 94, 0.03)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#fff', maxWidth: '280px' }}>
                        {t.title}
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: assignedUser?.avatar_color || '#6366f1',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: '#fff',
                          }}>
                            {t.assigned_to.charAt(0).toUpperCase()}
                          </span>
                          <span style={{ color: '#d1d5db' }}>{t.assigned_to}</span>
                        </div>
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className={`priority-tag ${t.priority}`}>
                          {t.priority}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem', color: '#9ca3af' }}>
                        {formatShortDate(t.scheduled_date)}
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          background: t.status === 'en_curso' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                          color: t.status === 'en_curso' ? '#fbbf24' : '#a5b4fc',
                        }}>
                          {t.status === 'en_curso' ? 'En curso' : 'Asignada'}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {isAccumulated ? (
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#f87171',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}>
                            <AlertTriangle size={12} />
                            Acumulada
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#34d399' }}>Al día</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
