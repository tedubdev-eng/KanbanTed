# KanDay - Tablero Kanban Semanal y Diario con Acumulación de Tareas

**KanDay** es una aplicación web responsive tipo Kanban diseñada para la gestión y seguimiento de tareas día a día con perspectiva semanal, acumulación automática de tareas pendientes, prioridades, asignación multiusuario y persistencia en base de datos relacional (PostgreSQL en Supabase) lista para desplegar en Netlify.

---

## 🚀 Características Principales

### 1. Tablero por Día con Seguimiento Semanal
- **Franja Semanal Interactiva**: Navegación entre semanas (`<- Anterior`, `Esta Semana`, `Siguiente ->`) y selector directo de fechas.
- **Tarjetas de Día con Métricas en Tiempo Real**: Muestra el total de tareas, tareas pendientes, finalizadas e insignia de acumuladas para cada día (Lunes a Domingo).
- **Acceso Rápido a Hoy**: Botón de un solo clic para volver a la fecha actual.

### 2. Estados del Kanban
- **Asignada**: Tareas programadas para la fecha seleccionada o acumuladas de días anteriores.
- **En curso**: Tareas que se están trabajando actualmente.
- **Finalizada**: Tareas completadas (se registran con fecha y hora de finalización).

### 3. Lógica de Acumulación Automática (Rollover / Carry-over)
> *"si hoy tengo asignadas 3 tareas, y mañana 4, de estas termino 2 el día de hoy, quiere decir que mi tablero el día de mañana debería tener 5 tareas."*

- Cualquier tarea que **no haya sido finalizada** y cuya fecha programada sea anterior a la fecha seleccionada, **se acumula automáticamente** en la columna **Asignada** del día actual o futuro con la insignia distintiva **`Acumulada (fecha prevista)`**.
- Las tareas finalizadas permanecen asociadas a su fecha de completado para no saturar los tableros futuros.

### 4. Opciones de Posponer y Tomar en el Día
- **Posponer**: Modal dedicado con opciones rápidas:
  - `+1 día (Mañana)`
  - `+2 días`
  - `Próximo Lunes`
  - Selector de fecha personalizada en el calendario.
- **Tomar para hoy**: Botón en cualquier tarea acumulada o agendada para otra fecha para reasignarla inmediatamente al día de hoy.

### 5. Atributos y Gestión de Tareas
- **Prioridades**: `Urgente` (rojo neón con pulso), `Alta` (naranja), `Media` (azul eléctrico) y `Baja` (verde esmeralda).
- **Asignación de Usuarios**: Asignar a cualquier miembro del equipo con avatares de color personalizados.
- **Drag & Drop**: Arrastra y suelta tareas entre columnas con retroalimentación visual inmediata.
- **Buscador y Filtros**: Filtrado instantáneo por texto, por usuario asignado y por nivel de prioridad.

### 6. Autenticación sin Roles Restrictivos
- Inicio de sesión con Usuario y Contraseña.
- Pestaña de Registro para nuevos usuarios.
- **Acceso rápido de prueba**: Botones de 1 clic para alternar entre usuarios predefinidos (*Teddy*, *Enrique*, *Sergio*, *Franklin*, *Gabriela*).
- Todos los usuarios tienen permisos completos: pueden crear tareas, editar, reasignar, posponer y mover estados.

---

## 🗄️ Base de Datos Relacional (Supabase PostgreSQL)

El proyecto incluye el esquema SQL relacional completo en:
👉 [`supabase/schema.sql`](file:///c:/Users/tmachicado/Documents/APLICACIONES%20OWN/kanban/supabase/schema.sql)

### Tablas:
1. `kanban_users`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `username TEXT UNIQUE NOT NULL`
   - `name TEXT NOT NULL`
   - `password TEXT NOT NULL`
   - `avatar_color TEXT`
   - `created_at TIMESTAMPTZ`

2. `kanban_tasks`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `title TEXT NOT NULL`
   - `description TEXT`
   - `status TEXT CHECK (status IN ('asignada', 'en_curso', 'finalizada'))`
   - `priority TEXT CHECK (priority IN ('baja', 'media', 'alta', 'urgente'))`
   - `scheduled_date DATE NOT NULL`
   - `assigned_to TEXT NOT NULL`
   - `created_by TEXT NOT NULL`
   - `completed_at TIMESTAMPTZ`
   - `created_at TIMESTAMPTZ`
   - `updated_at TIMESTAMPTZ`
   - *Índices en `(scheduled_date, status)` y `assigned_to` para consultas ultra rápidas.*

> **Nota:** La aplicación cuenta con un fallback local persistente (`localStorage`). Funciona inmediatamente al clonar el proyecto, y se conecta a Supabase tan pronto configures las variables de entorno.

---

## 🌐 Despliegue en Netlify

El archivo [`netlify.toml`](file:///c:/Users/tmachicado/Documents/APLICACIONES%20OWN/kanban/netlify.toml) ya está configurado con el plugin oficial de Next.js (`@netlify/plugin-nextjs`).

### Pasos para publicar en Netlify:
1. Sube tu código a GitHub / GitLab.
2. En Netlify, haz clic en **Add new site** → **Import an existing project**.
3. Selecciona tu repositorio. Netlify detectará automáticamente:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. En **Site configuration** → **Environment variables**, añade:
   - `NEXT_PUBLIC_SUPABASE_URL`: Tu URL del proyecto en Supabase (ej. `https://xxxx.supabase.co`).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu clave anónima pública de Supabase.
5. Haz clic en **Deploy** y tu tablero estará disponible globalmente con HTTPS.

---

## 💻 Ejecución en Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (opcional para modo local)
cp .env.example .env.local

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación funcionando.
