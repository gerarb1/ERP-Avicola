# Operación avícola: alcance y puesta en marcha

Rama: `feat/operacion-avicola-hyline`. No se modifica ni despliega la rama principal durante este trabajo.

## Diagnóstico previo

El MVP tenía acceso simulado (cualquier contraseña y rol inferido del correo), indicadores y notificaciones estáticos, formularios que modificaban estado local y hooks vacíos. Las rutas de producción e inventario validaban campos distintos de los consumidos por sus servicios; se validaban tallas como UUID aunque son códigos. La venta no descontaba todos los huevos sueltos, no registraba abonos y trataba de guardar la categoría inexistente VENTAS en caja. La disponibilidad podía perder actualizaciones concurrentes. El arqueo asumía saldo inicial cero.

Se sustituyeron las cinco pantallas operativas y su navegación por formularios conectados a una API autenticada. Se conservaron las tablas y unidades de negocio existentes, agregando los campos y registros que faltaban. Las antiguas rutas del MVP ya no se montan; los clientes deben actualizar la web junto con la API. Se retiraron los HTML públicos de demostración. Los archivos antiguos no montados se mantienen como referencia y no forman parte del flujo operativo.

## Funciones y perfiles

| Función | Administración | Galpón | Almacén |
| --- | --- | --- | --- |
| Recolección, bajas, agua, consumo, bitácora | Sí | Sí | No |
| Clasificar recolección, registrar merma, despachar | Sí | No | Sí |
| Compras de insumos, existencias, precios de bolsa | Sí | Consulta de alimento | Sí |
| Clientes, remisiones y abonos | Sí | No | Sí |
| Anotar gastos y ver sus propios movimientos | Sí | Sí | Sí |
| Ver toda la caja, reposiciones y arqueos | Sí | No | No |
| Análisis por edad | Sí | Referencia en su pantalla | Cobertura en su pantalla |
| Resumen semanal y seguimientos | Sí | Sí | Resumen y cobertura |

Los permisos se comprueban en el servidor. Los encabezados X-User-Role y X-User-Id ya no conceden acceso. Las sesiones duran ocho horas, usan tokens aleatorios almacenados como hash en PostgreSQL y se revocan al salir; las contraseñas usan PBKDF2-SHA256 con sal única y 100000 iteraciones compatibles con Workers. Diez intentos fallidos bloquean temporalmente el correo durante 15 minutos. El navegador no conserva cachés operativas entre cuentas. Los tres perfiles son cuentas reales en la base donde se ejecuta el script, no accesos incrustados en el frontend.

## Reglas operativas

- **Galpón:** una recolección por lote y día, separando huevos sanos y rotos. El consumo descuenta kg del alimento seleccionado. Las bajas disminuyen el censo; si se registran para una fecha anterior, ajustan los censos diarios afectados y se rechazan inconsistencias. El censo del día usa las aves al cierre después de bajas, con la misma convención para numerador y denominador. Los sucesos guardan producto, aplicación/dosis anotada y próxima fecha de seguimiento: vacunas, vitaminas, despique, cambio de alimento y observaciones.
- **Almacén:** solo clasifica huevos sanos pendientes de una recolección. La clasificación no se duplica. Las mermas y despachos descuentan unidades físicas normalizadas: 30 huevos por maple, 12 maples por caja. Los rotos de recolección no se descuentan otra vez del almacén.
- **Insumos:** control en kg para alimento, con peso configurable por bolsa (44 kg por defecto). Registra compras, costo total, proveedor/motivo, vencimiento, consumo y merma. El precio por bolsa se deriva de cada compra; no se supone un precio fijo. El stock es agregado por producto; el vencimiento se consulta en el historial de compras, sin asignación automática de lotes de compra/FIFO. La cobertura es una estimación de la granja, no una garantía de que cada fase de alimento tenga existencias suficientes.
- **Remisiones:** cliente, destino y detalle de cajas/maples/huevos sueltos, precio por maple en Bs y cobro proporcional de sueltos. Estado pendiente, parcial o pagado según pagos efectivamente registrados. Venta, stock, historial, saldo del cliente y cobro se guardan en una transacción. Los pagos no pueden superar la deuda. Todos los cobros actuales se registran como efectivo en caja; no se implementaron transferencias ni cuentas bancarias.
- **Caja:** importes en centavos para cálculo y dos decimales en almacenamiento/presentación, siempre Bs. Las compras solo generan gasto si el actor marca que se pagaron desde caja; evita duplicarlo manualmente. Informes por fechas, con vista predeterminada de la última semana completa y descarga CSV con responsables. Son constancias internas: no facturas ni asientos contables.
- **Arqueo:** lunes a domingo finalizado, saldo inicial calculado desde movimientos anteriores, ingresos/gastos, efectivo contado y diferencia. Una diferencia requiere explicación y queda visible. No ajusta dinero de forma oculta. No permite volver a cerrar un período ni anotar movimientos de caja anteriores al último cierre; las correcciones se registran en un período abierto.
- **Reintentos:** las escrituras operativas exigen una clave UUID, conservan la respuesta en PostgreSQL y verifican usuario, ruta y contenido. La interfaz reutiliza la clave al reintentar el mismo formulario tras un fallo de red. Las transacciones serializan cambios de stock, censo, caja y cierre. No se encolan movimientos nuevos sin conexión: se requiere confirmación del servidor.

## Guía Hy-Line aplicada

Fuente: PDF adjunto «Guía de rendimiento, ponedoras comerciales, sistemas convencionales», Hy-Line Brown, **diciembre de 2025**. SHA-256 del archivo recibido: `3319c0efbcb5753291a33312af04f3cf75d89ac130934a1b28b719ffa6f5ab4d`.

Se transcribieron las 100 filas de las tablas de crianza y producción, pp. 4–6, en `packages/shared/src/domain/hyline.ts`: rangos de postura %, agua ml/ave/día y alimento g/ave/día. No se interpola ni se extrapola fuera de 1–100 semanas. En crianza no se inventa un rango de postura. Por ejemplo, semana 20: 52.5–55%; semana 26: 93.6–98.5%; semana 100: 70.8–77.6%. Se calcula la edad completando semanas desde la fecha y edad de ingreso del lote, para la fecha de cada registro.

Postura semanal = huevos totales de días registrados / suma de aves vivas de esos días × 100. Consumos por ave usan el mismo denominador. La curva compara el rango de la edad de **cada fecha**, no un 92% fijo. Censo, agua y postura sin mediciones históricas se muestran como no disponibles. Los días sin registro no se convierten en ceros. La variación semanal solo se anuncia si ambas semanas tienen siete días; el agua incompleta no se estima.

Las pp. 13–18 indican que la fase alimentaria también depende de producción, tamaño del huevo y peso, no solo de edad. Por eso se registra el alimento aplicado y se muestran referencias, sin cambiar automáticamente la dieta. Los rangos no son garantías y dependen del ambiente y del sistema de alojamiento. No se prescribe medicación, vacunas, dosis, despique ni calendarios sanitarios que la guía no establece para este lote. No se presenta kg/maple como si fuera conversión kg de alimento/kg de huevo, ni márgenes ficticios.

Las notificaciones **dentro de la aplicación** se renuevan por semana completa en horario de Bolivia (lunes–domingo), comparan postura y alimento, muestran agua/bajas y alertan cobertura baja y seguimientos vencidos. Se consultan al entrar y cada minuto con la app abierta; la lectura se guarda por usuario. No son correo, WhatsApp ni push con la app cerrada.

## Preparar una base nueva de desarrollo

Node 24 en este entorno, pnpm 9.15.0 y PostgreSQL. Desde la raíz:

```bash
pnpm install --frozen-lockfile
# DATABASE_URL debe apuntar a una base local de desarrollo.
pnpm --filter @erp-avicola/db db:push
pnpm --filter @erp-avicola/db db:seed
DEMO_CREDENTIALS_FILE=/ruta/privada/cuentas.txt pnpm --filter @erp-avicola/db exec tsx scripts/crear-cuentas-demo.mts
```

El seed existente es solo para una base nueva: no repetir sobre datos reales. Ya no desactiva la verificación TLS; PostgreSQL local puede usar explícitamente `sslmode=disable` en una conexión de loopback. Configurar `packages/db/.env` local o inyectar DATABASE_URL. El archivo privado de credenciales debe ser nuevo, fuera del repositorio; se crea con permisos 0600 y no se imprimen contraseñas en los logs.

Cuentas: `admin@altalaestancia.com`, `galpon@altalaestancia.com`, `almacen@altalaestancia.com`. El script no reemplaza usuarios ni contraseñas existentes; si alguno ya existe, indica que no lo cambió. Verificar que el usuario existente tenga credencial antes de usarlo como cuenta de demostración. Las cuentas creadas durante este trabajo están únicamente en la base local; sus credenciales están en `/workspace/.setup/cuentas-demo.txt`.

Arrancar la API y la web en terminales separadas:

```bash
pnpm --filter @erp-avicola/api dev --ip 127.0.0.1
VITE_API_URL=http://127.0.0.1:8787 pnpm --filter @erp-avicola/web dev --host 127.0.0.1
```

VITE_API_URL admite el origen de la API con o sin `/api`; no se duplica el prefijo. El binding Hyperdrive local debe apuntar a esa misma base (Wrangler requiere usuario y contraseña en la URI, incluso con trust local). En el entorno cloud están instalados los binarios y datos bajo `/workspace/.setup/pg`; activar `/workspace/.setup/bin` para pnpm y arrancar PostgreSQL según la configuración guardada del entorno.

## Actualizar el despliegue existente

1. Respaldar la base y verificar el censo de cada lote, edades, clientes, saldos y moneda de los registros existentes. Esta rama interpreta importes como BOB; no realiza conversiones de moneda ni inventa pagos/censos históricos.
2. Aplicar **una vez** `packages/db/migrations/001_operacion.sql` al esquema original del MVP. Es una migración aditiva con transacción; no borra tablas ni registros. No usar `db:push` ni seed sobre producción. Las columnas históricas de censo y agua quedan NULL.
3. Crear las tres cuentas de demostración contra la base de destino con el script y un archivo privado nuevo. Para usuarios preexistentes sin credenciales se necesita una inicialización deliberada; el script no secuestra ni sobrescribe cuentas.
4. Compilar la web con el VITE_API_URL de la API desplegada, conservando la configuración Cloudflare/Hyperdrive de destino. Desplegar API y web de esta rama de manera coordinada. La guía de despliegue del repo contiene los comandos del proyecto. No se desplegó durante este trabajo.
5. Verificar inicio de sesión de los tres perfiles, permisos, recolección → clasificación → venta → pago → caja y actualizar la PWA en dispositivos que conservaran la versión anterior. La API nueva ya no admite los accesos simulados del MVP.

No se han aplicado migraciones ni creado usuarios en Supabase de producción. No hay publicación ni push implícito de esta rama.

## Validación reproducible

```bash
pnpm type-check
node --test tests/hyline.test.mjs
bash tests/run-api.sh
pnpm build
```

El runner de integración requiere `createdb`, `dropdb`, Python y PostgreSQL local en 127.0.0.1:5432, además de pnpm/Wrangler. Crea una base temporal propia, inicia un Worker en 8790 y elimina solo sus procesos/base/credenciales al salir. No acepta una API remota. En cloud agregar `/workspace/.setup/pg/root/usr/lib/postgresql/17/bin` al PATH y su `/workspace/.setup/pg/root/usr/lib/x86_64-linux-gnu` a LD_LIBRARY_PATH.

`pnpm build` reescribe el archivo generado versionado `apps/web/tsconfig.tsbuildinfo`; conservar y restaurar sus bytes al comprobar el build si no se desea incluir un cambio de caché. Vite advierte sobre el tamaño del bundle; la compilación y la generación PWA completan.

`tests/navegador.cjs` comprueba los tres perfiles en escritorio/móvil, rechazo de contraseña falsa, notificaciones, informes, creación de insumo y salida. Requiere Playwright/Chromium, una web de pruebas en 5174 apuntando a API aislada en 8790 y ERP_TEST_CREDENTIALS de esa base. PLAYWRIGHT_MODULE permite usar un runtime externo sin agregarlo al producto. La prueba escribe un insumo en esa base aislada.

Resultados de esta implementación: comprobación de tipos en cuatro paquetes, compilación web/PWA, cinco pruebas de dominio, diez pruebas de integración, navegador en escritorio/móvil para los tres perfiles y migración sobre esquema original con un registro histórico conservado sin mediciones inventadas. Son pruebas locales, no certifican el despliegue de producción.
