# Operación y preparación para producción

Rama de trabajo: `feat/operacion-avicola-hyline`. Los cambios de código y las migraciones se preparan aquí; el despliegue y la base pública no se modifican automáticamente.

## Recolección simple y consumos estimados

En Galpones y postura solo se exigen lote, fecha, huevos sanos y huevos rotos. Las observaciones son opcionales. Ya no se pide medir alimento ni agua a diario, ni elegir un alimento para poder guardar huevos.

- La edad confirmada determina el rango semanal Hy-Line. La ración orientativa usa el punto medio del rango en g/ave/día, o la ración manual acordada por administración para ese lote. El punto medio es una estimación del sistema, no un valor medido ni una dieta prescrita por la guía.
- Se guarda una estimación de alimento y agua para cada recolección, usando el censo de esa fecha. Si no se confirmó la edad y no hay ración acordada, no se inventa una cantidad. El agua de referencia depende de la edad confirmada y no se presenta como consumo real.
- Las estimaciones no descuentan existencias físicas. Al entregar alimento, almacén registra las bolsas que realmente salieron; el peso de bolsa es configurable (44 kg por defecto). Así no es necesario pesar consumo diariamente ni descontarlo dos veces.
- La API conserva la posibilidad de recibir kg y litros medidos para integraciones o mediciones puntuales. Esos campos quedan NULL si no se midieron. Los promedios y variaciones de consumo medido no se calculan rellenando datos faltantes con cero.
- Administración puede confirmar la edad y ajustar o quitar la ración manual en Configuración de granja. La edad se expresa para la fecha de inicio del registro indicada en pantalla. Las estimaciones ya guardadas se conservan como historial.

La postura incluye todos los huevos recolectados y usa aves vivas de los días registrados. Los rotos de recolección no entran al almacén. Una baja actualiza el censo y los registros afectados; se rechazan inconsistencias y cantidades superiores a las aves vivas.

## Selectores, inventario y remisiones

Las pantallas de administración y de los encargados usan los mismos formularios operativos. Un selector sin recolecciones pendientes o sin remisiones impagas no es una lista de usuarios/roles: depende de los registros reales disponibles. Ahora explica qué registro previo falta y bloquea el formulario mientras no haya opciones, en vez de mostrar solo «Seleccionar…». Los errores de carga se muestran por separado.

Clasificar permite ingresar **cajas completas por talla + maples adicionales + huevos sueltos**: una caja son 12 maples y un maple 30 huevos. El servidor convierte a unidades, valida contra la recolección sana pendiente y evita clasificarla más de una vez. La API sigue aceptando unidades para clientes anteriores, pero no permite combinar ambos modos en una misma solicitud.

Para los huevos que ya existían al comenzar se ofrece **Stock inicial contado**, solo para administración. No necesita una recolección histórica ficticia. Se permite antes del primer movimiento de cada talla y deja un ajuste identificable. No reemplaza saldos con movimientos existentes. Los insumos iniciales se registran como entradas reales, con motivo y cantidades contadas.

Las remisiones conservan cliente, destino, cajas/maples/sueltos, precio por maple en Bs, abonos y estado de pago. El precio se introduce explícitamente; no se presupone Bs 30. El selector de abonos solo ofrece remisiones que todavía deben dinero. Despacho, stock, deuda del cliente y cobro se guardan en una transacción; nunca se permite pagar más que el saldo. Los cobros se tratan actualmente como efectivo en caja.

## Perfiles y cuentas reales

| Función | Administración | Galpón | Almacén |
| --- | --- | --- | --- |
| Recolección, bajas, sucesos, referencias por edad | Sí | Sí | No |
| Clasificación, merma, despacho, insumos | Sí | No | Sí |
| Consultar alimento disponible | Sí | Sí | Sí |
| Clientes, remisiones y abonos | Sí | No | Sí |
| Anotar gastos propios | Sí | Sí | Sí |
| Caja completa, reposiciones, informes y arqueos | Sí | No | No |
| Configurar granja, edad y ración | Sí | No | No |
| Crear/restablecer/desactivar cuentas | Sí | No | No |
| Cambiar contraseña y guardar código de recuperación | Sí | Sí | Sí |

En **Cuentas y acceso**, administración crea usuarios con nombre, correo y uno de los tres perfiles. El sistema genera una contraseña temporal que se muestra una vez y debe entregarse en privado. La persona cambia esa contraseña en el primer ingreso antes de poder registrar operaciones. Se puede restablecer una contraseña o desactivar/reactivar una cuenta. No se permite desactivar la propia cuenta ni dejar la granja sin un administrador activo.

En **Mi cuenta** cada usuario cambia su contraseña y obtiene un código de recuperación de un solo uso. Debe guardarlo fuera de la aplicación. El enlace **Olvidé mi contraseña** permite restablecerla usando ese código; no se necesita un servidor de correo. Si un encargado pierde el código, administración puede emitir una nueva contraseña temporal. El administrador debe conservar su código de respaldo. No se implementa envío automático por correo/WhatsApp.

Restablecer o cambiar contraseña revoca todas las sesiones y anula el código anterior. La recuperación con código lo consume y requiere generar otro después de ingresar. Las contraseñas se almacenan con PBKDF2-SHA256, sal única y 100000 iteraciones compatibles con Workers; los tokens de sesión y códigos se almacenan como hash. Las respuestas con contraseñas/códigos no se guardan en la tabla de reintentos. Los intentos fallidos de login y recuperación se limitan por correo durante 15 minutos. Los roles se verifican en el servidor; los encabezados X-User-Role/X-User-Id no conceden acceso.

## Base nueva sin datos ficticios

El seed de producción ahora crea **solo catálogos**: tallas, stock vacío por talla y las capacidades de Galpón 1 (1500) y Galpón 2 (2500). No activa lotes ni genera edades, producción, precios, saldos o usuarios de demostración. Ejecutarlo otra vez no sustituye datos existentes. La capacidad de un galpón no es su censo de aves.

Desde la raíz, con Node 24 en cloud y pnpm 9.15:

```bash
pnpm install --frozen-lockfile
# DATABASE_URL debe apuntar a la base de desarrollo elegida.
pnpm --filter @erp-avicola/db db:push
pnpm --filter @erp-avicola/db db:seed
```

Para producción, usar las migraciones SQL revisadas y no db:push. La conexión debe conservar la verificación TLS cuando la base la requiera; solo loopback local puede usar explícitamente sslmode=disable. El script db:seed existente lee packages/db/.env o la variable DATABASE_URL inyectada.

Crear **el primer administrador real** requiere acceso de operación a la base, una vez. No hay un registro público que permita convertirse en administrador:

```bash
# DATABASE_URL ya debe estar configurada en el entorno seguro.
ADMIN_EMAIL='tu-correo-real@tu-dominio.com' \
ADMIN_NOMBRE='Tu nombre' \
ADMIN_CREDENTIALS_FILE='/ruta/privada/admin-inicial.txt' \
pnpm --filter @erp-avicola/db exec tsx scripts/bootstrap-admin.mts
```

El archivo debe ser nuevo y quedar fuera del repositorio; se crea con permisos 0600, con contraseña temporal y código de respaldo. No se imprimen valores en los logs. El script rechaza crear otro administrador inicial si ya hay uno activo. Si existe un administrador sin credencial propia, debe inicializarse deliberadamente con asistencia del operador de base; no se sobrescriben cuentas existentes.

Después de ingresar y cambiar la contraseña, el administrador puede crear desde la aplicación las otras dos cuentas reales (galpón y almacén). No es necesario usar cuentas de demostración. `crear-cuentas-demo.mts` y `fixtures-locales.mts` son utilidades para pruebas, no pasos de preparación de producción; las fixtures se limitan a bases locales erp_test_*.

## Un solo galpón activo

En **Configuración de granja**, elegir el galpón de capacidad 2500 y confirmar su censo actual. El valor inicial sugerido es 2500 porque es la cantidad aproximada indicada; verificar el conteo real. El otro galpón queda fuera de operación y conserva su capacidad e historial.

La acción «Iniciar operación con un solo galpón» fija el comienzo del nuevo censo en la fecha actual de Bolivia. Si ya hay lotes activos, requiere marcar que se archiven: no se borran recolecciones, bajas, saldos, remisiones ni movimientos anteriores. Las existencias de huevos pendientes de lotes anteriores pueden seguir clasificándose porque ya fueron recolectadas.

La edad puede dejarse pendiente; la interfaz lo indica y no calcula referencias de edad hasta confirmarla. No se reutilizan sin verificar las edades/fechas ficticias del MVP. Para corregir solo edad o ración, usar el formulario del lote activo y no reiniciar el lote.

Durante este trabajo se preparó **la base local** con un solo lote activo de 2500 aves en Galpón 2, manteniendo ambas capacidades y los historiales. La edad real sigue pendiente de confirmación. No se modificó Supabase de producción.

## Actualizar un despliegue existente

1. Respaldar la base y revisar censos, saldos, stock y moneda. Se interpretan los importes como BOB; no se convierten saldos de otras monedas ni se borran datos previos.
2. Si aún se tiene el esquema original del MVP, aplicar una vez `001_operacion.sql` y después `002_raciones_cuentas.sql`, de packages/db/migrations. Si ya se aplicó 001, aplicar **solo 002**. Las migraciones son aditivas, salvo permitir que kg_alimento sea NULL cuando no se midió. No borran datos ni cambian capacidades. Las edades anteriores requieren confirmación explícita.
3. Preparar los catálogos si faltan, mediante el seed actualizado, y crear o reutilizar el administrador real. El seed no elimina cuentas demo preexistentes: administración puede desactivarlas después de verificar el acceso real. No ejecutar las fixtures de prueba.
4. Compilar la web con el origen correcto en VITE_API_URL y desplegar API/web de esta rama de forma coordinada. La API mantiene los bindings Cloudflare/Hyperdrive del proyecto. Las migraciones y la configuración de datos se aplican antes de probar los formularios nuevos.
5. Desde la aplicación, configurar el único galpón activo, confirmar censo/edad, ingresar stock inicial contado, insumos y fondo de caja reales. Crear las cuentas de los encargados y entregar las contraseñas temporales en privado. Guardar el código del administrador.
6. Verificar recolección → clasificación → remisión → abono → caja, y actualizar la PWA en dispositivos que conserven una versión anterior.

La publicación de código y la aplicación de migraciones siguen siendo acciones distintas. El push a la rama de trabajo no aplica cambios a producción.

## Caja, bitácoras y notificaciones

Todos los importes se muestran en Bs y se calculan en centavos. Se conservan gastos por responsable, historial por fechas, CSV semanal y arqueo de lunes a domingo ya finalizado. Los cobros de remisiones ingresan automáticamente; las compras solo generan gasto de caja cuando el actor lo marca. El arqueo obtiene el saldo inicial de movimientos anteriores, registra efectivo contado y diferencia, exige explicación si no coincide y cierra fechas anteriores. No ajusta dinero ocultamente ni crea facturas o asientos contables.

La bitácora registra vacunas, vitaminas, despique, cambio de alimento y observaciones con producto, dosis anotada y seguimiento. No prescribe tratamientos ni inventa un calendario sanitario. Las notificaciones internas comparan semanas completas, distinguen alimentación estimada de medida y alertan cobertura baja o seguimiento vencido. Se actualizan al entrar y cada minuto con la app abierta; no son notificaciones push con la app cerrada.

## Fuente y validación

La referencia es el PDF adjunto Hy-Line Brown, diciembre 2025, sistemas convencionales. SHA-256: `3319c0efbcb5753291a33312af04f3cf75d89ac130934a1b28b719ffa6f5ab4d`. `hyline.ts` conserva las 100 filas de postura, alimento y agua de pp. 4–6. No extrapola fuera de semanas 1–100 ni presenta postura de crianza como dato disponible. Las pp. 13–18 aclaran que los cambios de dieta dependen también de producción/tamaño de huevo y condiciones de manejo, no solo de edad.

```bash
pnpm type-check
node --test tests/hyline.test.mjs
bash tests/run-api.sh
pnpm build
pnpm --filter @erp-avicola/api exec wrangler deploy --dry-run
```

El runner usa PostgreSQL en loopback, crea una base temporal propia y la elimina al terminar. Requiere createdb, dropdb, Python, pnpm y Wrangler. En cloud activar `/workspace/.setup/bin` y `/workspace/.setup/pg/root/usr/lib/postgresql/17/bin` en PATH, las librerías de `/workspace/.setup/pg/root/usr/lib/x86_64-linux-gnu` en LD_LIBRARY_PATH y XDG_CONFIG_HOME=/workspace/.setup/config.

Con Vite de pruebas en 5174 apuntando a API 8790, `ERP_BROWSER_TESTS=1` añade `tests/operacion_ui.cjs` al runner. PLAYWRIGHT_MODULE permite usar el runtime Playwright disponible en el entorno, sin añadirlo al producto. Comprueba estados vacíos para ambos perfiles autorizados, recolección simplificada, móvil, creación de cuenta y recuperación completa. Los datos de prueba quedan en una base aislada.

El build reescribe el generado versionado apps/web/tsconfig.tsbuildinfo; conservar/restaurar sus bytes si solo se valida compilación. Vite puede advertir del tamaño del bundle. Los resultados locales no certifican la base o despliegue públicos.
