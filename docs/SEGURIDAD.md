# POLÍTICAS DE SEGURIDAD Y AUDITORÍA - SedaTech v1.0.0

## 1. Row Level Security (RLS)
Todas las tablas operativas tienen RLS habilitado en PostgreSQL:
- **Administrador:** Consulta todos los registros y puede invocar asignaciones y matrices.
- **Técnico:** Únicamente consulta tickets donde figure una asignación activa a su `id_usuario`.
- **Usuario:** Únicamente consulta tickets donde figure como creador (`id_usuario_creador = auth.uid()`).
- **Auditoría:** La tabla `historial_ticket` no permite `UPDATE` ni `DELETE` directos desde el cliente. Solo se escribe a través de procedimientos almacenados `SECURITY DEFINER`.

## 2. Prevención de Inyección de Fórmulas en CSV (RF-09)
Al exportar reportes CSV para Excel o LibreOffice Calc, cualquier campo de texto que inicie con `=, +, -, @` o caracteres de control de fórmulas se neutraliza automáticamente anteponiendo un apóstrofe `'` y escapando las comillas con estándar RFC 4180.

## 3. Manejo de Credenciales y Secretos
- Ninguna clave privada ni `service_role` se almacena en el cliente frontend ni en el instalador compilado de Windows.
- Se utiliza `.env.example` para declarar variables públicas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
