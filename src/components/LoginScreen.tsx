'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Kanban, Lock, User as UserIcon, LogIn, AlertCircle, Key } from 'lucide-react';
import { setSupabaseAnonKey, isSupabaseConfigured } from '@/lib/supabase';

export function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [anonKeyInput, setAnonKeyInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(username.trim(), password);
      if (!res.success) {
        setError(res.error || 'Usuario o contraseña incorrectos. Solo usuarios registrados pueden ingresar.');
      }
    } catch {
      setError('Error al conectar. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnonKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (anonKeyInput.trim()) {
      setSupabaseAnonKey(anonKeyInput.trim());
      setShowKeyConfig(false);
      window.location.reload();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), #080b11',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: 'rgba(17, 24, 39, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2)',
        position: 'relative',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 1rem auto',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(99, 102, 241, 0.45)',
          }}>
            <Kanban size={32} color="#ffffff" />
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 40%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.4rem',
          }}>
            KanDay
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', lineHeight: 1.4 }}>
            Inicia sesión con tu cuenta de usuario registrada.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.8125rem',
            color: '#fb7185',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Usuario
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <UserIcon size={16} style={{ position: 'absolute', left: '12px', color: '#6b7280' }} />
              <input
                id="login-username"
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Contraseña
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', color: '#6b7280' }} />
              <input
                id="login-password"
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.75rem',
              fontSize: '0.95rem',
              marginTop: '0.5rem',
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Verificando...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        {/* Optional Supabase Key connection toggle */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            style={{
              fontSize: '0.72rem',
              color: '#6b7280',
              textDecoration: 'underline',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Key size={11} />
            <span>{isSupabaseConfigured() ? 'Supabase conectado' : 'Configurar conexión de Supabase'}</span>
          </button>

          {showKeyConfig && (
            <form onSubmit={handleSaveAnonKey} style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="password"
                className="form-input"
                style={{ fontSize: '0.75rem', padding: '0.45rem' }}
                placeholder="Pega aquí tu anon public key de Supabase"
                value={anonKeyInput}
                onChange={(e) => setAnonKeyInput(e.target.value)}
              />
              <button type="submit" className="btn-secondary" style={{ fontSize: '0.72rem', justifyContent: 'center' }}>
                Guardar y Conectar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
