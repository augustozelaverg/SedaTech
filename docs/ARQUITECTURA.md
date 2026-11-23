# ARQUITECTURA TÉCNICA - SedaTech v1.0.0

## 1. Visión General del Sistema
**SedaTech** es una aplicación de escritorio moderna e intuitiva para Windows 10 y Windows 11, diseñada para la gestión, asignación priorizada y resolución de incidencias y soporte técnico de computadoras. 

Combina la simplicidad visual y táctil de los controles móviles del iPhone (botones redondeados `rounded-2xl`, pictogramas claros, tamaños mínimos de interacción de 44×44 px y colores vivos) con la productividad y robustez de una aplicación de escritorio nativa para Windows mediante **Tauri 2** y el motor **Microsoft Edge WebView2**.

## 2. Diagrama de Capas

```
┌────────────────────────────────────────────────────────┐
│               SedaTech (Windows Desktop)              │
├────────────────────────────────────────────────────────┤
│  Capa de Presentación (Frontend React 19 + TypeScript) │
│  - Tailwind CSS + Paleta Vibrante                      │
│  - Componentes táctiles >= 44x44px                    │
│  - Barra adaptable Windows + Menú de acceso rápido     │
├────────────────────────────────────────────────────────┤
│  Capa Nativa de Escritorio (Tauri 2 + Rust)            │
│  - Microsoft Edge WebView2                             │
│  - Empaquetador NSIS (Setup.exe)                       │
│  - Diálogos de archivos y notificaciones nativas       │
├────────────────────────────────────────────────────────┤
│  Capa de Datos y Seguridad (PostgreSQL 15 / Supabase)  │
│  - 11 Tablas relacionales con integridad referencial   │
│  - Row Level Security (RLS) en todas las tablas        │
│  - Procedimientos almacenados transaccionales          │
└────────────────────────────────────────────────────────┘
```

## 3. Breakpoints Adaptables para Windows

| Breakpoint | Resolución | Comportamiento de la Interfaz |
|---|---|---|
| **Amplio** | $\ge 1280\text{ px}$ | Barra lateral completa con pictogramas y texto, área de trabajo amplia de 3-4 columnas, tabla completa y panel de detalle contextual. |
| **Mediano** | $900\text{ a }1279\text{ px}$ | Barra lateral compacta con pictogramas, 2 columnas de tarjetas, tabla con columnas prioritarias. |
| **Compacto** | $< 900\text{ px}$ | Barra compacta con botones esenciales, tarjetas individuales en lugar de tabla ancha y panel superpuesto. |

## 4. Roles y Control de Acceso (RBAC)
- **Administrador (Danae)**: Supervisión de todos los tickets, matriz de impacto/urgencia, asignación de técnicos, reportes con exportación CSV segura, gestión de usuarios.
- **Técnico (Tigre)**: Visualización exclusiva de tickets asignados, cambio a «En atención» (con notificación sonora en tiempo real al creador), resolución obligatoria con descripción técnica.
- **Usuario (Augusto)**: Registro de tickets con código secuencial único `TK-YYYY-XXXXX`, seguimiento de avance, avisos en cuenta y cancelación permitida únicamente mientras el ticket esté «Pendiente».
