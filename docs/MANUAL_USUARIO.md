# MANUAL DE USUARIO - SedaTech v1.0.0

## 1. Inicio de Sesión (P01)
Al iniciar la aplicación, se presenta la pantalla de acceso seguro.
- Para evaluar el sistema inmediatamente, puede hacer clic en cualquiera de las 3 tarjetas de demostración rápida:
  - **Danae:** Rol Administrador (Control total, colas y reportes).
  - **Tigre:** Rol Técnico (Diagnóstico, inicio de atención y soluciones).
  - **Augusto:** Rol Cliente (Crear tickets y consultar avance).

## 2. Flujo del Administrador (Danae)
1. **Dashboard:** Supervisa tarjetas con conteos en vivo, gráfico de dona por estado y gráfico de barras por prioridad.
2. **Cola de Asignación:** Lista ordenada por prioridad (Alta > Media > Baja) y antigüedad ascendente.
3. **Matriz de Prioridad (RF-03):** 3×3 Impacto × Urgencia para calcular la prioridad técnica recomendada.
4. **Reportes:** Filtra por fechas, estados y exporta reportes en formato CSV seguro.

## 3. Flujo del Técnico (Tigre)
1. Ingresa a **Mis Asignaciones**.
2. Pulsa **Iniciar Atención (RF-05)**: El ticket pasa a «En atención» y se envía una notificación sonora y visual al cliente.
3. Al terminar la reparación, pulsa **Resolver**: Es obligatorio detallar la solución técnica y el tiempo en minutos.

## 4. Flujo del Cliente / Usuario (Augusto)
1. Pulsa **Nuevo Ticket (RF-02)** en la barra lateral o botón flotante.
2. Ingresa asunto, modelo de equipo, descripción del problema y categoría.
3. Recibe avisos en tiempo real cuando el técnico comience a reparar su computadora.
4. Si ya no requiere la atención, puede pulsar **Cancelar Solicitud (RF-07)** mientras el ticket siga «Pendiente».
