'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Kanban, Plus, UserCheck, LogOut, Database, LogIn } from 'lucide-react';

interface NavbarProps {
  onOpenNewTask: () => void;
  onOpenAuth: () => void;
  onOpenInfo: () => void;
}

export function Navbar({ onOpenNewTask, onOpenAuth, onOpenInfo }: NavbarProps) {
  const { currentUser, logout, users, switchUser } = useAuth();
  const isConnected = isSupabaseConfigured();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <Kanban size={22} />
          </div>
          <div>
            <div className="brand-title">KanDay</div>
            <div className="brand-subtitle">Tablero Diario con Seguimiento Semanal</div>
          </div>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {/* DB Indicator */}
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onOpenInfo}
            title={isConnected ? 'Conectado a PostgreSQL en Supabase' : 'Modo local activo. Click para ver configuración de Supabase'}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
          >
            <Database size={15} color={isConnected ? '#34d399' : '#fbbf24'} />
            <span style={{ color: isConnected ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
              {isConnected ? 'PostgreSQL Supabase' : 'Modo Local / Demo'}
            </span>
          </button>

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

          {/* User Profile / Auth */}
          {currentUser ? (
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
                <span style={{ fontWeight: 600, color: '#e5e7eb' }}>{currentUser.name}</span>
                
                {/* Switcher dropdown */}
                {users.length > 1 && (
                  <select 
                    aria-label="Cambiar usuario"
                    value={currentUser.id}
                    onChange={(e) => {
                      const selected = users.find((u) => u.id === e.target.value);
                      if (selected) switchUser(selected);
                    }}
                    style={{
                      background: 'transparent',
                      color: '#9ca3af',
                      border: 'none',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      marginLeft: '0.25rem',
                    }}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id} style={{ background: '#111827', color: '#fff' }}>
                        Cambiar a: {u.name}
                      </option>
                    ))}
                  </select>
                )}
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
          ) : (
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onOpenAuth}
            >
              <LogIn size={16} />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
