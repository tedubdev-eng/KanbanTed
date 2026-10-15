-- ==============================================================================
-- Tablero Kanban Semanal / Diario - Esquema de Base de Datos Relacional (PostgreSQL)
-- Para Supabase
-- ==============================================================================

-- 1. Tabla de Usuarios (Autenticación con roles: admin y user)
CREATE TABLE IF NOT EXISTS kanban_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    avatar_color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Si la tabla ya existía, asegurar la columna role
ALTER TABLE kanban_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

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

-- Asegurar permisos completos tanto con RLS desactivado como activado
ALTER TABLE kanban_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks DISABLE ROW LEVEL SECURITY;

GRANT ALL ON kanban_users TO anon, authenticated, service_role;
GRANT ALL ON kanban_tasks TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Permiso total usuarios" ON kanban_users;
CREATE POLICY "Permiso total usuarios" ON kanban_users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permiso total tareas" ON kanban_tasks;
CREATE POLICY "Permiso total tareas" ON kanban_tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Habilitar replicación en tiempo real para sincronización instantánea entre dispositivos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'kanban_tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE kanban_tasks;
  END IF;
END $$;

-- ==============================================================================
-- Datos de prueba iniciales (Semilla de usuarios y tareas)
-- ==============================================================================
INSERT INTO kanban_users (username, name, password, role, avatar_color)
VALUES 
    ('Ted', 'Teddy Machicado', 'ted123', 'admin', '#6366f1'),
    ('Quique', 'Enrique Rojas', 'quique123', 'user', '#ec4899'),
    ('Sergio', 'Sergio Ayala', 'sayala123', 'user', '#06b6d4'),
    ('Franklin', 'Franklin Luque', 'frank123', 'user', '#10b981'),
    ('Gabriela', 'Gabriela Salazar', 'gabriela123', 'user', '#d946ef')
ON CONFLICT (username) DO UPDATE 
SET role = EXCLUDED.role, password = EXCLUDED.password, name = EXCLUDED.name;

-- Tareas de ejemplo con fechas relativas (ayer, hoy, mañana)
INSERT INTO kanban_tasks (title, description, status, priority, scheduled_date, assigned_to, created_by, completed_at)
VALUES
    -- Tarea acumulada (programada ayer pero sin finalizar, por lo que se acumula hoy)
    ('Revisión de requerimientos y arquitectura', 'Verificar diseño de base de datos relacional y flujo de tareas pendientes.', 'asignada', 'alta', CURRENT_DATE - INTERVAL '1 day', 'Teddy Machicado', 'Teddy Machicado', NULL),
    
    -- Tareas para hoy
    ('Implementar tablero Kanban interactivo', 'Columnas de asignada, en curso y finalizada con capacidad de posponer.', 'en_curso', 'urgente', CURRENT_DATE, 'Teddy Machicado', 'Enrique Rojas', NULL),
    ('Configurar conexión con Supabase PostgreSQL', 'Crear tablas e integrar cliente para persistencia de datos relacionales.', 'asignada', 'alta', CURRENT_DATE, 'Sergio Ayala', 'Teddy Machicado', NULL),
    ('Definir paleta de colores y componentes visuales', 'Estilos modernos con tema oscuro/claro y glassmorphism.', 'finalizada', 'media', CURRENT_DATE, 'Gabriela Salazar', 'Franklin Luque', CURRENT_TIMESTAMP),

    -- Tarea agendada para mañana
    ('Preparar despliegue en Netlify', 'Validar variables de entorno y archivo netlify.toml.', 'asignada', 'media', CURRENT_DATE + INTERVAL '1 day', 'Franklin Luque', 'Sergio Ayala', NULL);
