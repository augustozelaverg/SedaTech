-- ==============================================================================
-- SedaTech v1.0.0 - DATOS SEMILLA (CATÁLOGOS Y CUENTAS DEMO OFICIALES)
-- ==============================================================================

-- 1. Insertar Roles
INSERT INTO roles (id_rol, nombre_rol, descripcion) VALUES
(1, 'administrador', 'Supervisión general, asignación y reportes'),
(2, 'tecnico', 'Atención y solución técnica de incidencias asignadas'),
(3, 'usuario', 'Registro y seguimiento de incidencias propias')
ON CONFLICT (id_rol) DO NOTHING;

-- 2. Insertar Categorías
INSERT INTO categorias (id_categoria, nombre_categoria, descripcion, icono) VALUES
(1, 'Hardware', 'Fallas físicas en componentes, placas, pantallas, fuentes o periféricos', 'cpu'),
(2, 'Software', 'Errores de sistema operativo Windows, aplicaciones, licencias o virus', 'code'),
(3, 'Red y conectividad', 'Problemas con WiFi, Ethernet, VPN o configuración IP', 'wifi'),
(4, 'Impresoras', 'Atascos de papel, problemas de drivers o conectividad en red', 'printer'),
(5, 'Acceso y cuentas', 'Bloqueo de credenciales, permisos y autenticación', 'key'),
(6, 'Otros', 'Requerimientos especiales de cómputo y mantenimiento general', 'box')
ON CONFLICT (id_categoria) DO NOTHING;

-- 3. Insertar Prioridades
INSERT INTO prioridades (id_prioridad, nombre_prioridad, nivel_orden, descripcion, color_hex) VALUES
(1, 'Baja', 1, 'Puede programarse y permite continuar trabajando', '#377BF5'),
(2, 'Media', 2, 'Requiere atención durante la jornada con alternativa limitada', '#F5A623'),
(3, 'Alta', 3, 'Requiere atención inmediata; actividad crítica interrumpida', '#ED7298')
ON CONFLICT (id_prioridad) DO NOTHING;

-- 4. Insertar Estados de Ticket
INSERT INTO estados_ticket (id_estado, nombre_estado, descripcion, color_hex) VALUES
(1, 'Pendiente', 'Solicitud registrada en espera de asignación o inicio de atención', '#F5A623'),
(2, 'En atención', 'El técnico está trabajando activamente en el diagnóstico y solución', '#9B70E8'),
(3, 'Resuelto', 'Incidencia reparada con solución técnica documentada', '#21B6A8'),
(4, 'Cancelado', 'Cancelado por el creador mientras estaba en estado Pendiente', '#ED7298')
ON CONFLICT (id_estado) DO NOTHING;

-- 5. Insertar Usuarios Demo Oficiales (Sección 10 de la especificación)
INSERT INTO usuarios (id_usuario, nombres, apellidos, correo, id_rol, cargo, avatar_color, avatar_emoji) VALUES
('a0000001-0000-0000-0000-000000000001', 'Danae', 'Mendoza', 'danae@sedatech.com', 1, 'Supervisora General', '#377BF5', '👩‍💼'),
('b0000002-0000-0000-0000-000000000002', 'Tigre', 'Flores', 'tigre@sedatech.com', 2, 'Técnico Senior de Taller', '#21B6A8', '🐯'),
('c0000003-0000-0000-0000-000000000003', 'Augusto', 'Zela', 'augusto@sedatech.com', 3, 'Cliente VIP / Desarrollador', '#F5A623', '🧑‍💻'),
('d0000004-0000-0000-0000-000000000004', 'Valeria', 'Paredes', 'valeria@sedatech.com', 2, 'Técnica de Soporte Nivel 2', '#9B70E8', '👩‍🔧'),
('e0000005-0000-0000-0000-000000000005', 'Bruno', 'Alarcón', 'bruno@sedatech.com', 3, 'Usuario Corporativo', '#ED7298', '👨‍💼')
ON CONFLICT (id_usuario) DO NOTHING;
