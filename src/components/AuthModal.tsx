'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Lock, User as UserIcon, LogIn, UserPlus, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, users, switchUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(username, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Credenciales incorrectas');
        }
      } else {
        const res = await register(username, name, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Error al registrar');
        }
      }
    } catch {
      setError('Ocurrió un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (userObj: typeof users[0]) => {
    switchUser(userObj);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} color="#6366f1" />
            <h2 className="modal-title">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Mode switcher tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            type="button"
            style={{
              padding: '0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: mode === 'login' ? '#fff' : 'var(--text-muted)',
              borderBottom: mode === 'login' ? '2px solid var(--primary)' : '2px solid transparent',
              background: mode === 'login' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
            }}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            style={{
              padding: '0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: mode === 'register' ? '#fff' : 'var(--text-muted)',
              borderBottom: mode === 'register' ? '2px solid var(--primary)' : '2px solid transparent',
              background: mode === 'register' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
            }}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Registrarse
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

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-name">
                  Nombre completo *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="auth-name"
                    type="text"
                    className="form-input"
                    style={{ width: '100%' }}
                    placeholder="Ej. Sofía Martínez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-username">
                Usuario *
              </label>
              <input
                id="auth-username"
                type="text"
                className="form-input"
                placeholder="Ej. tomas, ana, carlos..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-pass">
                Contraseña *
              </label>
              <input
                id="auth-pass"
                type="password"
                className="form-input"
                placeholder="Tu contraseña..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Quick user selection pills for instant testing */}
            {mode === 'login' && users.length > 0 && (
              <div style={{ marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
                  Acceso rápido con 1 click (usuarios de prueba):
                </span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className="action-btn-pill"
                      style={{ fontSize: '0.72rem' }}
                      onClick={() => handleQuickLogin(u)}
                    >
                      <span 
                        style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: u.avatar_color || '#6366f1',
                          display: 'inline-block' 
                        }} 
                      />
                      {u.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {mode === 'login' ? (
                <>
                  <LogIn size={15} />
                  <span>{isSubmitting ? 'Iniciando...' : 'Entrar'}</span>
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  <span>{isSubmitting ? 'Registrando...' : 'Crear Cuenta'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
