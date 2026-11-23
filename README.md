# SedaTech v3.5.0
### Sistema Integral de Gestión, Asignación y Seguimiento de Tickets

Aplicación profesional de escritorio para Windows 10 y Windows 11 con arquitectura nativa de 64 bits (**Win32 + DWM + Microsoft Edge WebView2**), Splash Screen flotante real sin bordes al iniciar sesión, transición automática a la ventana principal de escritorio, control estricto por roles, auditoría inmutable y reportes ejecutivos A4 (PDF/CSV).

---

## Inicio Rápido (Desarrollo)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo en puerto 3000
npm run dev

# 3. Compilar aplicación web para producción
npm run build
```

---

## Distribución Oficial para Windows (`SEDATECH_INSTALL/`)

La carpeta `SEDATECH_INSTALL/` contiene el paquete instalable completo y firmado digitalmente con certificado **Authenticode SHA-256**:

- `SedaTech_Setup.exe` — Instalador oficial para Windows 10/11 (64 bits) firmado con SHA-256.
- `SedaTech.exe` — Host nativo Win32 + DWM Transparente + WebView2 con Splash Screen de Login flotante sin fondo de ventana.
- `WebView2Loader.dll` — Librería oficial firmada por Microsoft Edge WebView2.
- `Instalar_Certificado_Antivirus.bat` — Asistente de instalación del certificado raíz y de editor confiable.
- `SedaTech_RootCA.cer` y `SedaTech_Certificado_Seguridad.cer` — Cadena de certificación X.509.
- `app/` — Compilación de producción sincronizada.

---

## Requisitos Funcionales y Seguridad

- **Autenticación por Roles:** Administrador, Técnico y Usuario con validación estricta de contraseña.
- **Splash Screen Nativo Real:** Ventana `WS_POPUP | WS_EX_TOPMOST` directamente sobre el escritorio Windows, esquinas redondeadas por hardware (DWM) y transición fluida al dashboard tras iniciar sesión.
- **Cola de Asignación Inteligente:** Ordenamiento automático por prioridad y antigüedad con matriz 3×3 Impacto/Urgencia.
- **Reportes y Exportación Segura:** PDF tamaño A4 institucional y CSV con UTF-8 BOM y neutralización contra inyección de fórmulas (CWE-1236).
- **Auditoría Inmutable:** Trazabilidad completa de estados, prioridades y asignaciones.
