-- ==============================================================================
-- Tablero Kanban Semanal / Diario - Esquema de Base de Datos Relacional (PostgreSQL)
-- Para Supabase
-- ==============================================================================

-- 1. Tabla de Usuarios (Autenticación sin roles restrictivos)
CREATE TABLE IF NOT EXISTS kanban_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Tareas Kanban
CREATE TABLE IF NOT EXISTS kanban_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'asignada' CHECK (status IN ('asignada', 'en_curso', 'finalizada')),
    priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assigned_to TEXT NOT NULL,
    created_by TEXT NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para optimizar consultas de acumulación y fechas
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_date ON kanban_tasks (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_status ON kanban_tasks (status);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_assigned_to ON kanban_tasks (assigned_to);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_date_status ON kanban_tasks (scheduled_date, status);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_kanban_tasks_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kanban_tasks_modtime ON kanban_tasks;
CREATE TRIGGER trg_kanban_tasks_modtime
BEFORE UPDATE ON kanban_tasks
FOR EACH ROW
EXECUTE FUNCTION update_kanban_tasks_modtime();

-- ==============================================================================
-- Políticas de Seguridad (RLS) - Acceso abierto sin roles
-- ==============================================================================
ALTER TABLE kanban_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura de usuarios" ON kanban_users;
CREATE POLICY "Permitir lectura de usuarios" ON kanban_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir registro de usuarios" ON kanban_users;
CREATE POLICY "Permitir registro de usuarios" ON kanban_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todas las operaciones en tareas" ON kanban_tasks;
CREATE POLICY "Permitir todas las operaciones en tareas" ON kanban_tasks FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- Datos de prueba iniciales (Semilla de usuarios y tareas)
-- ==============================================================================
INSERT INTO kanban_users (username, name, password, avatar_color)
VALUES 
    ('tomas', 'Tomás Machicado', '123456', '#6366f1'),
    ('ana', 'Ana Morales', '123456', '#ec4899'),
    ('carlos', 'Carlos Gómez', '123456', '#06b6d4'),
    ('sofia', 'Sofía Rojas', '123456', '#10b981')
ON CONFLICT (username) DO NOTHING;

-- Tareas de ejemplo con fechas relativas (ayer, hoy, mañana)
INSERT INTO kanban_tasks (title, description, status, priority, scheduled_date, assigned_to, created_by, completed_at)
VALUES
    -- Tarea acumulada (programada ayer pero sin finalizar, por lo que se acumula hoy)
    ('Revisión de requerimientos y arquitectura', 'Verificar diseño de base de datos relacional y flujo de tareas pendientes.', 'asignada', 'alta', CURRENT_DATE - INTERVAL '1 day', 'Tomás Machicado', 'Tomás Machicado', NULL),
    
    -- Tareas para hoy
    ('Implementar tablero Kanban interactivo', 'Columnas de asignada, en curso y finalizada con capacidad de posponer.', 'en_curso', 'urgente', CURRENT_DATE, 'Tomás Machicado', 'Ana Morales', NULL),
    ('Configurar conexión con Supabase PostgreSQL', 'Crear tablas e integrar cliente para persistencia de datos relacionales.', 'asignada', 'alta', CURRENT_DATE, 'Carlos Gómez', 'Tomás Machicado', NULL),
    ('Definir paleta de colores y componentes visuales', 'Estilos modernos con tema oscuro/claro y glassmorphism.', 'finalizada', 'media', CURRENT_DATE, 'Sofía Rojas', 'Tomás Machicado', CURRENT_TIMESTAMP),

    -- Tarea agendada para mañana
    ('Preparar despliegue en Netlify', 'Validar variables de entorno y archivo netlify.toml.', 'asignada', 'media', CURRENT_DATE + INTERVAL '1 day', 'Ana Morales', 'Carlos Gómez', NULL);
