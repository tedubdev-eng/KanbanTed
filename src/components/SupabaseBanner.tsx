'use client';

import React, { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Database, CheckCircle, AlertTriangle, ExternalLink, X, Code, Copy, Check } from 'lucide-react';

interface SupabaseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseInfoModal({ isOpen, onClose }: SupabaseInfoModalProps) {
  const [copied, setCopied] = useState(false);
  const isConnected = isSupabaseConfigured();

  if (!isOpen) return null;

  const envSnippet = `NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={20} color={isConnected ? '#34d399' : '#fbbf24'} />
            <h2 className="modal-title">Configuración de Base de Datos Relacional</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Status Alert */}
          <div style={{
            background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            {isConnected ? (
              <CheckCircle size={22} color="#34d399" />
            ) : (
              <AlertTriangle size={22} color="#fbbf24" />
            )}
            <div>
              <strong style={{ color: isConnected ? '#34d399' : '#fbbf24', display: 'block', fontSize: '0.9rem' }}>
                {isConnected ? 'PostgreSQL en Supabase Conectado' : 'Modo Local / Persistencia Activa'}
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                {isConnected 
                  ? 'Todas las tareas y usuarios se están sincronizando directamente con tu base de datos relacional PostgreSQL.'
                  : 'La aplicación está funcionando en modo local sin interrupciones. Para sincronizar con tu base de datos en la nube y Netlify, sigue estos sencillos pasos:'}
              </span>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.25rem' }}>
                1. Crear las tablas en Supabase
              </h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Abre tu proyecto en <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)', textDecoration: 'underline' }}>supabase.com</a>, ve a la sección <strong>SQL Editor</strong> y ejecuta el script que generamos en el archivo:
              </p>
              <div style={{
                background: '#0d1117',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#67e8f9',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                supabase/schema.sql
              </div>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.25rem' }}>
                2. Configurar variables de entorno
              </h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Copia las claves de tu proyecto desde <em>Project Settings → API</em> y agrégalas a tu archivo <code>.env.local</code>:
              </p>
              <div style={{ position: 'relative' }}>
                <pre style={{
                  background: '#0d1117',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  color: '#e5e7eb',
                  fontFamily: 'monospace',
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflowX: 'auto',
                }}>
                  {envSnippet}
                </pre>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ position: 'absolute', top: '8px', right: '8px' }}
                  onClick={copyToClipboard}
                  title="Copiar variables"
                >
                  {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.25rem' }}>
                3. Despliegue en Netlify
              </h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                El archivo <code>netlify.toml</code> ya está listo en el proyecto. Al conectar tu repositorio a Netlify, ve a <em>Site Configuration → Environment variables</em> y añade <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. ¡El build se desplegará automáticamente!
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export function SupabaseBanner({ onOpenInfo }: { onOpenInfo: () => void }) {
  const isConnected = isSupabaseConfigured();

  if (isConnected) return null;

  return (
    <div className="supabase-banner offline">
      <div className="banner-content">
        <span className="banner-badge local">Modo Local Activo</span>
        <span>
          Funcionando con almacenamiento local. Para conectar tu base de datos relacional <strong>PostgreSQL (Supabase)</strong> y desplegar en Netlify, haz clic en configurar.
        </span>
      </div>
      <button 
        type="button" 
        className="btn-secondary" 
        style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', whiteSpace: 'nowrap' }}
        onClick={onOpenInfo}
      >
        Ver Guía de Conexión
      </button>
    </div>
  );
}
