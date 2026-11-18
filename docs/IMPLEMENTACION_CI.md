# Registro de implementación de CI

Fecha de trabajo: 18 de noviembre de 2026. Base del cambio:
`56b7fb60feed4cbd573563d88901d0a1e1d912ec`.

## Cambios incluidos

- Workflow CI con instalación bloqueada, tipos, pruebas unitarias, interfaz/API,
  restauración de PostgreSQL temporal y construcción de ambos componentes.
- Ejecutor local sin dependencia de un archivo `.env`, con autenticación de PostgreSQL,
  procesos controlados, puertos reservados y limpieza de bases temporales.
- Playwright declarado como dependencia y navegador portable.
- Verificación de restauración mediante comparación del contenido de cada tabla pública.
- Prueba de humo con comprobación opcional u obligatoria de una consulta autenticada.
- Publicación manual desde main condicionada a CI satisfactoria y habilitación explícita;
  evidencias con commit e identificadores de las versiones de Workers.
- Eliminación del seguimiento de archivos generados por TypeScript y selección explícita
  de `vite.config.ts` para impedir que una configuración JavaScript antigua se utilice.
- Procedimiento de despliegue, mantenimiento y recuperación en `CI_DESPLIEGUE.md`.

## Verificación local

- Pruebas unitarias: 10 aprobadas, 0 fallidas. Incluyen seis casos del dominio y cuatro
  casos de la prueba de humo, con comprobación de rechazo cuando falta una sesión válida.
- Comprobación de tipos: aprobada en los cuatro paquetes que declaran ese script.
- Construcción web: aprobada. Persiste la advertencia de tamaño del paquete JavaScript;
  no se modificó la división de módulos en este cambio.
- API: empaquetado `wrangler deploy --dry-run` aprobado, sin publicación.
- Workflows: validados con actionlint 1.7.7.
- Integración y navegador locales: no completados. El entorno de ejecución restringe
  `uv_interface_addresses` al iniciar Wrangler. La preparación de la base y las semillas
  sí se ejecutaron; esto no equivale a aprobar los escenarios de integración.

La ejecución de GitHub Actions debe consultarse para determinar el estado de la
integración, la interfaz y la restauración en el ejecutor remoto. No se atribuyen aquí
resultados de producción ni aceptación de usuarios.

## Activación pendiente

Configurar protección de main, entorno `production`, secretos y URL de servicios;
comprobar la configuración de Hyperdrive y los respaldos operativos; desactivar la vía
automática redundante de publicación antes de habilitar `ERP_DEPLOY_ENABLED`.
Este cambio no modifica datos operativos, no aplica migraciones y no publica el ERP.
