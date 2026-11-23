# MODELO FÍSICO DE BASE DE DATOS - SedaTech v1.0.0

## 1. Motor y Características
- **Motor:** PostgreSQL 15 (Supabase Cloud o instancia local).
- **Esquema:** 11 Tablas principales con claves foráneas, restricciones `UNIQUE`, `CHECK` e índices de rendimiento.
- **Identificadores:** UUID para usuarios integrados con `auth.users`, y `BIGINT GENERATED AS IDENTITY` para entidades operativas.

## 2. Diccionario de Tablas

1. `roles`: Catálogo de roles del sistema (`administrador`, `tecnico`, `usuario`).
2. `usuarios`: Perfiles autorizados con rol, correo, nombres, avatar y estado activo.
3. `categorias`: Categorías de incidencia (`Hardware`, `Software`, `Red y conectividad`, `Impresoras`, `Acceso y cuentas`, `Otros`).
4. `prioridades`: Niveles de atención (`Alta`, `Media`, `Baja`) con ordenamiento numérico y colores de interfaz.
5. `estados_ticket`: Etapas del ciclo de vida (`Pendiente`, `En atención`, `Resuelto`, `Cancelado`).
6. `tickets`: Tabla principal de incidencias con código único secuencial, equipo, asunto, descripción y fechas atómicas.
7. `asignaciones`: Registro histórico y vigente de asignaciones de técnicos con índice único parcial para garantizar una sola asignación activa por ticket.
8. `soluciones`: Solución técnica obligatoria y tiempo de resolución registrado por el técnico que resuelve.
9. `historial_ticket`: Auditoría inalterable (append-only) que registra responsable, acción, `old_value`, `new_value` y cambios JSONB.
10. `notificaciones`: Avisos dirigidos al usuario creador o técnico, con contador de no leídos.
11. `reportes_exportados`: Auditoría de exportaciones CSV generadas por administradores con filtros aplicados.

## 3. Scripts de Base de Datos
- **Migración inicial:** `/supabase/migrations/20261029000000_core_schema.sql`
- **Semilla de datos demo:** `/supabase/seed.sql`
