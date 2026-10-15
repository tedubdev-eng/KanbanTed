'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Kanban, Plus, LogOut, BarChart3, LayoutDashboard, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenNewTask: () => void;
  activeView: 'kanban' | 'dashboard';
  setActiveView: (view: 'kanban' | 'dashboard') => void;
}

export function Navbar({ onOpenNewTask, activeView, setActiveView }: NavbarProps) {
  const { currentUser, logout, users, switchUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="brand">
            <div className="brand-icon">
              <Kanban size={22} />
            </div>
            <div>
              <div className="brand-title">KanDay</div>
              <div className="brand-subtitle">Tablero Diario con Seguimiento Semanal</div>
            </div>
          </div>

          {/* Supervisor View Toggle (Only visible for admin role) */}
          {isAdmin && (
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
              gap: '2px',
            }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: activeView === 'kanban' ? '#fff' : 'var(--text-muted)',
                  background: activeView === 'kanban' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  border: activeView === 'kanban' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                }}
                onClick={() => setActiveView('kanban')}
              >
                <Kanban size={14} />
                <span>Tablero Kanban</span>
              </button>

              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: activeView === 'dashboard' ? '#fff' : 'var(--text-muted)',
                  background: activeView === 'dashboard' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                  border: activeView === 'dashboard' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                }}
                onClick={() => setActiveView('dashboard')}
              >
                <BarChart3 size={14} />
                <span>Dashboard Supervisor</span>
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {/* New Task Button */}
          <button 
            type="button" 
            className="btn-primary" 
            onClick={onOpenNewTask}
            id="btn-new-task"
          >
            <Plus size={18} />
            <span>Nueva Tarea</span>
          </button>

          {/* User Profile */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                className="user-badge" 
                title={`Sesión activa: ${currentUser.name} (@${currentUser.username})`}
              >
                <div 
                  className="user-avatar" 
                  style={{ backgroundColor: currentUser.avatar_color || '#6366f1' }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontWeight: 600, color: '#e5e7eb' }}>{currentUser.name}</span>
                  {currentUser.role === 'admin' && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}>
                      <ShieldCheck size={10} />
                      Admin
                    </span>
                  )}
                </div>
              </div>

              <button 
                type="button" 
                className="icon-btn" 
                onClick={logout} 
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
