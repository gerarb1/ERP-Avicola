# Integración continua y mantenimiento de Agro Insight

La CI ejecuta tipos, pruebas unitarias, recorridos de navegador, integración de API,
una restauración de datos de prueba y la construcción de web/API. Cualquier comando
fallido bloquea el trabajo. Los archivos de `.github/workflows` contienen la definición
reproducible; la ejecución en Actions constituye la evidencia, no la mera existencia del YAML.

## Ejecutar localmente

Requisitos: Node.js 24, pnpm 9.15.0, Python 3, Bash, `setsid`, curl y PostgreSQL local.
Instalar el cliente PostgreSQL de la misma versión principal o una superior al servidor
(`psql`, `createdb`, `dropdb`, `pg_dump`, `pg_restore`). El usuario local `postgres` debe
poder crear bases. Nunca indicar una URL productiva para estas pruebas.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm type-check
pnpm test:unit
pnpm test:integration
pnpm test:e2e
VITE_API_URL=http://127.0.0.1:8790 pnpm build:web
pnpm build:api
```

`test:integration` incluye el ensayo de restauración. `test:e2e` incluye lo anterior
más la interfaz; no hace falta ejecutar ambos en CI. Si el navegador necesita bibliotecas
Linux, usar `pnpm exec playwright install --with-deps chromium` en un entorno con permisos.
Por defecto PostgreSQL usa `127.0.0.1:5432`, usuario `postgres` y contraseña de prueba
`postgres`. Se admiten `ERP_TEST_PGPORT` y `ERP_TEST_DB_PASSWORD`; el host y los nombres
se generan localmente y no se toman de `DATABASE_URL`.

El ejecutor crea bases `erp_test_<tiempo>_<pid>` y una copia terminada en `_restore`,
levanta API en 8790 y web en 5174, y elimina sus propios recursos al finalizar. Rechaza
puertos ocupados. No necesita crear ni reemplazar archivos `.env`. Las credenciales
ficticias y el dump se guardan temporalmente con acceso privado y se borran al finalizar.
El navegador descargado por Playwright es la opción normal; para una instalación local
puede indicarse `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Evidencia en GitHub Actions

`CI ERP / Verificar ERP` se ejecuta en pull requests, en main, en la rama inicial de
implementación, manualmente y cada lunes a las 10:00 UTC. Usa PostgreSQL 16 temporal.
El artefacto `evidencia-<run>-<intento>` conserva durante 30 días:

- Commit, identificador de ejecución, fecha y versiones del entorno.
- Registros de tipos y pruebas unitarias.
- Resultados de interfaz, API y comparación de restauración.
- Construcción de web y empaquetado de API sin publicar.

La restauración compara los nombres y el contenido completo de cada tabla pública
mediante un hash de filas ordenadas. Esto comprueba una copia de datos de prueba;
no certifica los respaldos de Supabase ni valida roles, permisos, extensiones o funciones
fuera del esquema público. También se debe ensayar periódicamente la restauración
operativa en un destino independiente.

Configurar en GitHub una regla de main que exija la comprobación **Verificar ERP**
antes de integrar cambios, junto con revisión y bloqueo de pushes que eludan la regla.
Esta configuración depende de los permisos y del plan del repositorio y no se establece
por agregar el workflow. Probar el bloqueo con un fallo reversible en una rama separada;
corregirlo y conservar ambas ejecuciones como evidencia del Anexo 5.

## Publicación controlada

`Publicar ERP` está preparado para ejecución manual, solo desde main, después de
repetir la CI para ese mismo commit. La publicación está deshabilitada mientras la
variable de repositorio `ERP_DEPLOY_ENABLED` no sea `true`.

Antes de habilitarla:

1. Confirmar en Cloudflare que los nombres de Workers y el binding Hyperdrive de
   los archivos Wrangler corresponden al entorno que se quiere publicar. Verificar
   TLS a Supabase, región, permisos de base y configuración de CORS.
2. Configurar en GitHub el entorno `production`. Definir las variables `ERP_WEB_URL`
   y `ERP_API_URL` con los orígenes HTTPS reales. No incluir credenciales ni `/api`
   en `ERP_API_URL`. Configurar los secretos `CLOUDFLARE_API_TOKEN`,
   `CLOUDFLARE_ACCOUNT_ID` y `ERP_SMOKE_TOKEN`. El token Cloudflare debe permitir
   publicar únicamente en la cuenta prevista. El token de humo es una sesión válida
   de un usuario autorizado para consultar galpones; debe renovarse al expirar.
3. Desactivar las publicaciones automáticas redundantes de Workers Builds de API y
   web antes de habilitar este camino. Si se conserva Workers Builds, se necesita
   una barrera equivalente que espere todos los controles; este repositorio no
   cambia la configuración del panel del proveedor.
4. Comprobar respaldos y compatibilidad del esquema. El workflow no ejecuta
   `db:push`, semillas ni migraciones en producción. Los cambios de esquema
   requieren un procedimiento específico y una copia verificada previa.
5. Tras verificar estos requisitos, habilitar `ERP_DEPLOY_ENABLED=true` y ejecutar
   manualmente `Publicar ERP` desde main. Para el primer establecimiento de una
   infraestructura nueva se necesita un procedimiento de alta: este workflow
   verifica un servicio ya existente antes de actualizarlo.

La web se construye con la API productiva y la API se publica con `APP_ENV=production`.
Se verifica que main aún corresponda al commit comprobado, se publica API y luego web,
y se repite la prueba de humo. Se serializan entregas, pero ambos Workers no se actualizan
atómicamente: un fallo parcial requiere intervención. Guardar los dos identificadores de
versión que muestra Wrangler y el enlace de la ejecución en el registro de entrega.

## Prueba de humo sin modificar datos operativos

```sh
ERP_WEB_URL=https://web.example.com ERP_API_URL=https://api.example.com node scripts/smoke.mjs
```

Comprueba HTML, `/health` y rechazo de una consulta sin sesión. Con `ERP_SMOKE_TOKEN`
consulta además `/api/galpones`, sin insertar producción, ventas ni movimientos de caja.
Con `ERP_REQUIRE_DATABASE_CHECK=1`, omitir el token bloquea el control. `/health` por sí
solo **no consulta PostgreSQL**. No pegar tokens en comandos guardados en el historial:
inyectarlos mediante el gestor de secretos del entorno. Nunca se imprimen en el reporte.
La prueba no sustituye permisos por rol, ciclo operativo completo ni aceptación de usuarios.

## Mantenimiento, respaldo y reversión

- En cada cambio: ejecutar CI y revisar las evidencias del commit que se publicará.
- Después de cada entrega: prueba de humo y registro de las versiones de ambos Workers.
- Semanalmente: revisar errores, dependencias e incidencias; la ejecución programada
  de CI permite detectar roturas de herramientas aunque no cambie el código.
- Diariamente y antes de migraciones: verificar un respaldo operativo protegido de
  PostgreSQL. Su programación y retención se configuran en el proveedor o sistema
  de copias; **no están automatizadas por este workflow**.
- Mensualmente: restaurar una copia operativa en una base independiente, comprobar
  datos y recorridos, medir duración y anotar la fecha del último dato recuperable.

Ante un fallo de publicación, detener nuevas entregas, identificar qué Worker cambió,
y valorar desde Cloudflare la reversión a versiones compatibles de API y web. Comprobar
que el esquema actual admite esas versiones y repetir la prueba de humo. Un rollback de
Worker no revierte PostgreSQL. No restaurar automáticamente una copia sobre producción:
se deben conciliar las operaciones posteriores para evitar pérdida de información.

## Referencias

- https://docs.github.com/en/actions/get-started/continuous-integration
- https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers
- https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
- https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/
