'use client';

import React from 'react';
import { User, TaskPriority } from '@/types/kanban';
import { formatDatePretty, getTodayString } from '@/lib/dateUtils';
import { Search, Calendar, Filter, AlertTriangle, X } from 'lucide-react';

interface FilterBarProps {
  selectedDate: string;
  today: string;
  totalTasks: number;
  rolledOverCount: number;
  users: User[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedAssignee: string;
  onAssigneeChange: (val: string) => void;
  selectedPriority: string;
  onPriorityChange: (val: string) => void;
  onResetFilters: () => void;
}

export function FilterBar({
  selectedDate,
  today,
  totalTasks,
  rolledOverCount,
  users,
  searchQuery,
  onSearchChange,
  selectedAssignee,
  onAssigneeChange,
  selectedPriority,
  onPriorityChange,
  onResetFilters,
}: FilterBarProps) {
  const isToday = selectedDate === today;
  const hasActiveFilters = searchQuery !== '' || selectedAssignee !== 'all' || selectedPriority !== 'all';

  return (
    <div className="view-bar">
      {/* Date focus and Carry-over callout */}
      <div className="date-focus-indicator">
        <div className="date-badge">
          <Calendar size={18} color="var(--primary)" />
          <span>{formatDatePretty(selectedDate)}</span>
          {isToday && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(6, 182, 212, 0.2)',
              color: 'var(--cyan)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
            }}>
              HOY
            </span>
          )}
        </div>

        {/* Rollover badge highlight */}
        {rolledOverCount > 0 && (
          <div 
            className="rollover-info-pill" 
            title="Tareas que no fueron finalizadas en sus fechas anteriores y se acumulan automáticamente en este día."
          >
            <AlertTriangle size={13} />
            <span>{rolledOverCount} acumulada{rolledOverCount > 1 ? 's' : ''} de días previos</span>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="filters-group">
        {/* Search */}
        <div className="search-input-wrap">
          <Search size={14} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter by Assignee */}
        <select
          aria-label="Filtrar por usuario asignado"
          className="filter-select"
          value={selectedAssignee}
          onChange={(e) => onAssigneeChange(e.target.value)}
        >
          <option value="all">Todos los usuarios</option>
          {users.map((u) => (
            <option key={u.id} value={u.name}>
              Asignado: {u.name}
            </option>
          ))}
        </select>

        {/* Filter by Priority */}
        <select
          aria-label="Filtrar por prioridad"
          className="filter-select"
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="all">Todas las prioridades</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.65rem' }}
            onClick={onResetFilters}
            title="Limpiar filtros"
          >
            <X size={13} />
            <span>Limpiar</span>
          </button>
        )}
      </div>
    </div>
  );
}
