# Guía de uso por roles

**ERP Avícola · Alta La Estancia**

Guía práctica de la versión de la rama `feat/operacion-avicola-hyline`.

Este manual explica qué hace cada módulo, quién lo usa y cómo completar las tareas habituales. Los ejemplos de cantidades, clientes y precios son ilustrativos: al trabajar, registra lo que realmente ocurrió.

La guía corresponde a la versión actualizada. Para verla en la aplicación pública, primero debe desplegarse esa versión con sus migraciones. La preparación técnica está en [Operación y puesta en marcha](docs/OPERACION.md).

## Cómo encontrar tu tarea

- **Administración:** configura la granja y las cuentas, supervisa los resultados y concilia caja. Lee el apartado 2.
- **Encargado de galpón:** registra recolección, bajas y sucesos. Lee el apartado 3.
- **Encargado de almacén:** clasifica, controla existencias e insumos, despacha y registra cobros. Lee el apartado 4.
- **Todos:** revisen primero el apartado 1 para ingresar, recuperar la cuenta y entender las unidades.
- El apartado 5 reúne un ejemplo completo y el 6 resuelve los problemas habituales.

| Módulo o tarea | Administración | Galpón | Almacén |
| --- | --- | --- | --- |
| Galpones y postura | Sí | Sí | No |
| Inventario y almacén | Sí | No | Sí |
| Notas de remisión | Sí | No | Sí |
| Mis gastos | Ve todos los movimientos | Sus movimientos | Sus movimientos |
| Caja y arqueos | Sí | No | No |
| Rendimiento y análisis | Sí | No | No |
| Configuración de granja | Sí | No | No |
| Cuentas y acceso | Sí | No | No |
| Mi cuenta y notificaciones | Sí | Sí | Sí |

## 1. Antes de empezar: para todos los actores

### 1.1. Unidades y dinero

| Concepto | Equivalencia |
| --- | --- |
| 1 maple | 30 huevos |
| 1 caja | 12 maples = 360 huevos |
| 1 bolsa de alimento | El peso configurado para ese producto; 44 kg por defecto |
| Moneda | Bolivianos, identificados como Bs |

En clasificación, las cantidades de cajas, maples y sueltos **se suman**. No repitas en maples los huevos que ya contaste en cajas. Por ejemplo: **2 cajas + 3 maples + 4 huevos = 814 huevos**.

### 1.2. Ingresar por primera vez

1. Abre la dirección de la aplicación que te indique administración.
2. Escribe tu correo y la contraseña temporal que te entregaron.
3. Pulsa **Iniciar Sesión**. El sistema identifica tu perfil; no eliges un rol en esta pantalla.
4. Si la contraseña es temporal, entrarás a **Mi cuenta**. Escribe la contraseña temporal y repite dos veces una nueva de al menos 12 caracteres.
5. Pulsa **Guardar nueva contraseña**.
6. Guarda fuera de la aplicación el código de recuperación que aparece. Se muestra en ese momento y permite recuperar la cuenta una sola vez.
7. Pulsa **Guardé mi código. Iniciar sesión** y entra con tu nueva contraseña.

En computadora, usa el menú lateral. En celular, abre el botón de menú de la barra superior. Para terminar, pulsa el icono **Cerrar sesión**; si compartes el dispositivo, cada persona debe entrar con su propia cuenta.

### 1.3. Mi cuenta: cambiar contraseña y recuperar acceso

**Qué hace:** permite cambiar tu contraseña y renovar tu código de respaldo.

Para cambiarla, abre **Mi cuenta**, completa contraseña actual, nueva contraseña y repetición, y guarda. Se cerrarán tus sesiones; conserva el nuevo código y vuelve a ingresar.

Si olvidaste la contraseña:

1. En el inicio de sesión, pulsa **Olvidé mi contraseña**.
2. Escribe tu correo, código de recuperación y la nueva contraseña dos veces.
3. Pulsa **Restablecer contraseña** y vuelve a ingresar.
4. En **Mi cuenta**, confirma tu contraseña y pulsa **Generar nuevo código**. Guarda ese nuevo respaldo: el código usado ya no sirve.

**Ejemplo:** Juan olvidó la contraseña, pero conserva su código. La restablece y genera otro código para la próxima vez. Si no conserva el código, pide a administración una nueva contraseña temporal. No se envía un correo automático. El administrador también debe guardar su propio código; si lo pierde junto con su contraseña, necesita asistencia del responsable técnico de la base.

### 1.4. Notificaciones y conexión

La campana superior abre **Notificaciones semanales**. Muestra el resumen de la última semana completa, cambios de postura y alimento cuando hay datos suficientes, cobertura baja de alimento y seguimientos según el perfil. Puedes pulsar **Marcar como leída**; la lectura se guarda para tu cuenta.

**Ejemplo:** si solo hay tres días registrados de una semana, el resumen avisa que está incompleto. Eso no significa que los otros cuatro días tuvieron cero producción. El alimento estimado se identifica como tal; no es consumo pesado o medido.

Las notificaciones se consultan al entrar y se actualizan con la aplicación abierta. No son avisos por WhatsApp, correo ni push con la aplicación cerrada.

Para guardar nuevos registros se necesita conexión. Si no hay señal, toma nota aparte y registra después al recuperar conexión, con la fecha real del hecho. Espera la confirmación de guardado; abrir la aplicación no confirma que una operación se haya guardado.

## 2. Actor: administración

### 2.1. Orden recomendado para comenzar

El responsable técnico debe preparar la base y entregar el primer acceso de administrador. Después:

1. Cambia la contraseña y guarda tu código de recuperación.
2. En **Configuración de granja**, revisa qué galpón está activo y su censo.
3. Confirma nacimiento y llegada del lote.
4. En **Inventario y almacén**, ingresa el stock inicial contado y los insumos que realmente existen.
5. En **Caja y arqueos**, registra el fondo de caja disponible, si corresponde.
6. En **Cuentas y acceso**, crea una cuenta de galpón y otra de almacén.
7. Entrega los accesos en privado y pide a cada persona completar su primer ingreso.

El sistema no genera ventas, recolecciones, compras o fondos de caja ficticios para completar las pantallas.

### 2.2. Configuración de granja

**Qué hace:** distingue capacidad instalada, aves vivas y lotes en operación. Permite confirmar la edad y acordar una ración de referencia.

**Situación de esta granja:** Galpón 2 tiene capacidad de 2.500 aves y es el previsto para operar con aproximadamente 2.500. Galpón 1 conserva su capacidad de 1.500, pero queda fuera de operación. La capacidad no debe confundirse con el conteo de aves vivas.

Si todavía no se ha iniciado el lote real:

1. Abre **Configuración de granja**.
2. En **Iniciar operación con un solo galpón**, elige el galpón activo.
3. Introduce el censo actual contado; 2.500 es el valor sugerido, no un conteo automático.
4. Introduce nacimiento y llegada si los conoces. Para este lote se registraron **11/02/2026** y **12/02/2026**, respectivamente: llegaron con un día de nacidas.
5. Si existen lotes previos que deben quedar archivados, marca la confirmación correspondiente y guarda.

Esta acción inicia un nuevo censo desde la fecha de registro, conserva los historiales anteriores y deja solo el galpón elegido en operación. **No la uses para corregir una edad o una ración de un lote que ya está trabajando.**

Para corregir esos datos, usa **Confirmar edad / ajustar ración** dentro del lote activo. La fecha de nacimiento tiene prioridad sobre una edad aproximada y permite que la edad avance automáticamente el día correcto.

**Ejemplo de referencia:** un nacimiento el 11/02/2026 equivale a 36 semanas y 1 día el 22/10/2026. A las 36 semanas, Hy-Line indica 110–118 g de alimento por ave al día; el punto medio equivale a unos 285 kg diarios para 2.500 aves. Es una estimación de planificación, no una medición ni una orden de suministro. Una ración manual debe acordarse con el responsable del manejo; puedes quitarla con **Volver a la referencia por edad**.

### 2.3. Cuentas y acceso

**Qué hace:** crea cuentas reales, asigna perfiles y permite restablecer o desactivar accesos.

Para crear una cuenta:

1. Abre **Cuentas y acceso**.
2. En **Crear cuenta**, completa nombre y correo de la persona.
3. Elige **Encargado de galpón**, **Encargado de almacén** o **Administrador**.
4. Pulsa **Crear cuenta**.
5. Copia la contraseña temporal que se muestra una vez y entrégala por un medio privado.
6. Pide a la persona cambiarla en su primer ingreso y guardar su código de recuperación.

**Ejemplo:** crea la cuenta de Juan con el perfil de galpón y la de Luis con el perfil de almacén. Juan registrará huevos y bajas; Luis clasificará y despachará. No necesitan compartir tu cuenta de administrador.

Si alguien perdió su acceso, pulsa **Nueva contraseña temporal** junto a esa cuenta activa. Se cierran sus sesiones y se anula el código anterior. Si una persona deja de trabajar, usa **Desactivar**; sus registros se conservan. **Reactivar** permite volver a habilitarla. No puedes desactivar tu propia cuenta.

### 2.4. Rendimiento y análisis

**Qué hace:** muestra aves vivas, edad, postura, referencias Hy-Line, disponibilidad de alimento y cobertura estimada.

1. Abre **Rendimiento y análisis**.
2. Revisa los lotes y sus censos.
3. Elige el lote en **Analizar lote**.
4. Observa la última semana completa, la cantidad de días registrados y la curva de postura frente al rango esperado para la edad de cada fecha.
5. Si falta información, revisa los historiales operativos antes de sacar conclusiones.

**Ejemplo:** con 2.500 aves vivas y 2.360 huevos totales, la postura de ese día es **94,4 %**. Para la semana 36, la guía da un rango de **92,5–97,7 %**. El valor está dentro del rango de referencia; la comparación no garantiza que todas las condiciones de manejo estén correctas.

No se usa un objetivo fijo del 92 % para todas las edades. Las referencias cubren semanas 1–100. El alimento estimado se presenta por separado del medido; si no se controla el agua, su consumo real puede aparecer sin datos. La cobertura agrupa alimentos y debe revisarse por producto y fase antes de comprar.

### 2.5. Inventario y almacén: conteo inicial y supervisión

**Qué hace:** permite revisar stock, compras, mermas y movimientos. Administración dispone de los mismos formularios operativos del encargado de almacén y, además, puede registrar el stock inicial.

Para los huevos que ya estaban antes de comenzar a usar el ERP:

1. Cuenta físicamente las cajas, maples y huevos sueltos de cada talla.
2. En **Inventario y almacén**, busca **Stock inicial contado (solo al comenzar)**.
3. Elige una talla sin movimientos previos, fecha y cantidades contadas.
4. Guarda y repite para las otras tallas que corresponda.

**Ejemplo:** existen 2 cajas, 3 maples adicionales y 4 huevos sueltos talla G: registra **814 huevos equivalentes** mediante esos tres campos. No inventes una recolección anterior para ingresarlos.

Solo se permite inicializar una talla antes de sus primeros movimientos. Después, no reemplaces el saldo inicial para ocultar diferencias. Para clasificar, registrar insumos o descontar roturas, sigue los pasos del apartado 4. Si el encargado ya registró una operación, no la repitas con tu cuenta.

### 2.6. Notas de remisión: supervisión de entregas y deudas

**Qué hace:** permite consultar clientes, entregas, saldos y pagos, y registrar las mismas operaciones que almacén.

1. Abre **Notas de remisión** y revisa la tabla de entregas.
2. Pulsa el número de una nota para ver sus tallas y su historial de pagos.
3. Consulta **Saldos por cliente** para saber cuánto queda por cobrar.
4. Si tú realizas la venta o recibes el dinero, usa los pasos del apartado 4.4 y coordina con almacén para registrarlo una sola vez.

**Ejemplo:** una nota totaliza Bs 423,00 y tiene Bs 100,00 abonados. El saldo por cobrar es Bs 323,00; no se vuelve a descontar stock cuando se registra ese abono.

### 2.7. Caja y arqueos

**Qué hace:** reúne movimientos de dinero con fecha y responsable, permite descargar un informe y comparar el saldo esperado con el efectivo contado. Son constancias internas, sin facturas ni asientos contables.

**Anotar dinero recibido o gastado**

1. Abre **Caja y arqueos** y el formulario **Anotar gasto o ingreso**.
2. Elige la fecha real, **Gasté / pagué** o **Recibí dinero / reposición**.
3. Introduce monto en Bs, explicación y concepto.
4. Guarda y comprueba el historial.

**Ejemplo:** si entregas Bs 1.000,00 para iniciar caja, regístralos como ingreso y describe «Fondo inicial de caja». Los cobros de remisiones ya ingresan automáticamente; no los repitas aquí.

**Consultar el informe**

1. En **Historial e informe semanal**, selecciona **Desde** y **Hasta**.
2. Revisa saldo inicial del período, ingresos, gastos y saldo esperado al cierre.
3. Pulsa **Descargar informe CSV** para abrirlo en Excel u otra hoja de cálculo. Si aparecen juntos los datos, elige punto y coma como separador al importar.

La vista comienza en la última semana completa; puedes cambiar el período. El informe se obtiene de los registros guardados: no se envía automáticamente por correo.

**Realizar un arqueo**

1. Cuenta el efectivo físico correspondiente al cierre.
2. En **Conciliar una semana finalizada**, elige un lunes y el domingo de esa misma semana, ya terminada.
3. Introduce el efectivo contado en **Efectivo contado al cierre (Bs)**.
4. Si hay diferencia, explica el motivo en observaciones y guarda.
5. Consulta **Arqueos guardados**: muestra lo esperado, lo contado, la diferencia y el estado.

**Ejemplo:** saldo inicial Bs 0,00; ingresos Bs 1.423,00; gastos Bs 820,00. Se esperan **Bs 603,00**. Si cuentas Bs 603,00, coincide; si cuentas Bs 598,00, existe una diferencia de **Bs -5,00** que debe explicarse.

Un arqueo cierra esas fechas y las anteriores para nuevos movimientos de caja. No cambia dinero para hacer coincidir los números. Registra las correcciones que correspondan en un período abierto y con explicación; no repitas el arqueo de una semana ya cerrada.

### 2.8. Rutina de administración

- **Al comenzar:** revisar campana, galpón activo, censo y disponibilidad de alimento.
- **Durante la semana:** comprobar recolecciones faltantes, movimientos, gastos y remisiones por cobrar.
- **Al finalizar una semana:** completar los registros pendientes antes del cierre, descargar el informe, contar el efectivo y guardar el arqueo.
- **Al cambiar personal:** desactivar el acceso anterior y crear una cuenta propia para quien ingresa.

## 3. Actor: encargado de galpón

### 3.1. Galpones y postura: consultar el lote

**Qué hace:** muestra el galpón en operación, aves vivas, edad y referencias de postura, alimento y agua. Al ingresar con este perfil, esta es tu pantalla principal.

En **Consultar lote**, selecciona el que atiendes. Si solo hay un lote activo, es normal que solo aparezca una opción. Si no hay ninguno, pide a administración configurar el galpón antes de registrar.

Las referencias de alimento y agua sirven para orientarse. No necesitas medirlas todos los días ni escribirlas para guardar la recolección. La entrega real de bolsas la registra almacén; avisa qué alimento se entregó y a qué galpón.

### 3.2. Registrar recolección diaria

1. Reúne el total de las recolecciones del día para no registrar el mismo lote dos veces.
2. En **Registrar recolección diaria**, elige lote y fecha.
3. Escribe **Huevos sanos (unidades)** y **Huevos rotos en recolección**.
4. Añade observaciones si ocurrió algo que deba quedar registrado.
5. Pulsa **Guardar registro** y revisa el **Historial de recolección**.

**Ejemplo:** recogiste 2.350 huevos sanos y 10 rotos. Introduce **2350** y **10**. El sistema usa 2.360 huevos para la postura y deja 2.350 sanos para que almacén los clasifique por talla. Todavía no se crea stock de huevos clasificados.

Si cuentas en maples, conviértelos a unidades antes de escribirlos: 78 maples y 10 sueltos son **2.350 huevos sanos**. Hay un registro por lote y fecha. Si el día ya está registrado, no vuelvas a cargarlo para completar otra parte.

### 3.3. Registrar bajas

**Qué hace:** descuenta aves fallecidas del censo y deja constancia de la causa.

1. Busca **Registrar bajas**.
2. Selecciona lote y fecha del suceso.
3. Escribe la cantidad y la causa o explicación.
4. Guarda y verifica el nuevo número de aves vivas y la bitácora.

**Ejemplo independiente:** si el censo era de 2.500 aves y hubo 3 bajas, pasa a **2.497**. No cambies manualmente el censo inicial para descontarlas. Una baja registrada para una fecha anterior puede ajustar la postura histórica afectada; si contradice una recolección, el sistema la rechaza para que se revisen los datos.

### 3.4. Agregar un suceso al historial

**Qué hace:** guarda vacunas, vitaminas, despique, cambios de alimento y observaciones por galpón.

1. En **Agregar suceso al historial**, elige lote, fecha y tipo de suceso.
2. Escribe qué ocurrió o qué se hizo.
3. Si corresponde, añade producto, dosis/aplicación y próxima fecha de seguimiento.
4. Guarda y revisa la **Bitácora del galpón**.

**Ejemplo:** tipo «Vitamina», producto realmente utilizado, descripción «Aplicada según indicación del responsable» y dosis efectivamente aplicada. Si se acordó un control posterior, registra su fecha. El sistema conserva lo realizado; no decide tratamientos ni prescribe dosis.

Anotar una aplicación en la bitácora no descuenta automáticamente vitaminas o vacunas del inventario. Coordina con almacén para que registre la salida real del insumo una sola vez.

### 3.5. Mis gastos

**Qué hace:** permite dejar constancia de los gastos que realizaste y consultar tus propios movimientos.

1. Abre **Mis gastos**.
2. En **Anotar un gasto**, completa fecha, monto, explicación y concepto.
3. Guarda y comprueba el historial.
4. Cambia el período y descarga el CSV si necesitas entregar tu relación de gastos.

**Ejemplo:** pagaste Bs 20,00 por transporte: «Transporte de insumos al galpón». Administración verá el gasto con tu responsable; tú no ves la caja completa ni haces arqueos. Si ese gasto ya fue anotado por otro actor, coordina antes de volver a registrarlo.

### 3.6. Rutina del galpón

- Revisar el lote y avisar anomalías de aves, alimento o agua.
- Registrar las bajas y los sucesos que correspondan.
- Al completar las recolecciones del día, guardar el total de sanos y rotos.
- Entregar los huevos sanos a almacén para su clasificación.
- Anotar gastos propios y revisar los seguimientos de la campana.

## 4. Actor: encargado de almacén

### 4.1. Clasificar huevos por talla

**Qué hace:** convierte una recolección sana pendiente en stock físico de tallas P, CH, M, G, XG y XXG.

1. Abre **Inventario y almacén**.
2. En **Clasificar huevos recolectados**, elige la recolección pendiente y la fecha de clasificación.
3. Elige una talla.
4. Introduce cajas completas, maples adicionales y huevos sueltos adicionales de esa talla.
5. Guarda y repite para las demás tallas de la misma recolección.
6. Comprueba **Stock físico por tallas** y **Movimientos de huevos**.

**Ejemplo:** de una recolección de 2.350 sanos, clasificas:

| Talla | Cajas completas | Maples adicionales | Huevos sueltos | Total de huevos |
| --- | --- | --- | --- | --- |
| G | 2 | 3 | 4 | 814 |
| M | 4 | 3 | 6 | 1.536 |
| Total | | | | 2.350 |

En clasificación, usa de 0 a 11 maples adicionales y de 0 a 29 sueltos; completa otra caja o maple cuando corresponda. Si primero guardas la talla G, quedan 1.536 huevos por clasificar. Cuando termines todas las tallas, esa recolección deja de aparecer como pendiente.

Si el selector está vacío, no inventes un ingreso: puede faltar registrar la recolección o puede estar totalmente clasificada. Para huevos que ya existían antes de comenzar, pide a administración el conteo inicial.

### 4.2. Descontar merma de almacén

**Qué hace:** descuenta huevos ya clasificados que se rompieron o perdieron en almacén.

1. En **Descontar merma de almacén**, elige fecha y talla.
2. Indica los huevos afectados en unidades y explica qué ocurrió.
3. Guarda y revisa el stock y el movimiento.

**Ejemplo:** se rompen 5 huevos talla G durante la manipulación. Registra **5**, no cinco maples. Si había 814, quedan **809 huevos equivalentes**.

Los 10 rotos anotados por galpón en la recolección nunca entraron al stock. No vuelvas a descontarlos como merma de almacén.

### 4.3. Insumos: alimento, vitaminas, vacunas y cama

**Qué hace:** registra productos, compras/entradas, entregas/salidas, mermas, costo total y vencimientos anotados.

**Crear el producto, una vez**

1. En **Crear insumo**, escribe un nombre claro, por ejemplo «Alimento de postura — fase acordada».
2. Elige tipo: alimento, vitamina, vacuna, cama u otro.
3. Selecciona la unidad de control. Para alimento, usa **Kilogramos**.
4. Confirma el peso de la bolsa; si pesa 44 kg, deja ese valor.
5. Guarda. Crear el producto todavía no agrega existencias.

Usa productos distintos si necesitas separar fórmulas o fases de alimento. Para viruta o arroz de cama, elige «Cama» y una unidad coherente con tu control. La dosis o aplicación sanitaria la indica el responsable del manejo, no el ERP.

**Registrar una compra o entrada**

1. En **Elegir insumo para compra / salida**, selecciona el producto.
2. En el formulario del producto, elige **Compra / entrada** y fecha.
3. Escribe la cantidad: en alimento se ingresa en **bolsas** y el sistema convierte a kg.
4. Introduce el **costo total de la compra**, proveedor/motivo y vencimiento si corresponde.
5. Marca **Registrar también como gasto de caja** solo si se pagó desde caja y ese gasto todavía no está registrado.
6. Guarda y consulta el historial.

**Ejemplo:** compras 20 bolsas de 44 kg por Bs 800,00. Ingresa **20 bolsas** y **Bs 800,00 de costo total**. Se registran **880 kg** y un precio de **Bs 40,00 por bolsa**. No escribas 880 en el campo de bolsas ni 40 como costo total.

Si son existencias anteriores al inicio, anota la cantidad contada como entrada y explica «Existencia inicial contada». No registres un gasto de caja nuevo por una compra pagada antes del período que estás llevando.

**Registrar entrega o merma**

1. Selecciona el producto y elige **Uso / salida** o **Merma**.
2. Introduce fecha, cantidad realmente entregada/perdida y motivo o destino.
3. Para una salida sin nueva compra, deja costo total en 0 y no marques gasto de caja.
4. Guarda y revisa el saldo.

**Ejemplo:** entregas 6 bolsas al galpón: son 264 kg. De las 20 bolsas compradas quedan **14 bolsas = 616 kg en almacén**, si no hubo otros movimientos. El historial de cantidades se muestra en la unidad de control del producto, por ejemplo kg.

La referencia diaria del galpón no descuenta ese alimento automáticamente. Registra la entrega real una vez. Los vencimientos se consultan en el historial: el sistema no asigna automáticamente qué lote de compra se consumió primero. La cobertura es una estimación; revisar el stock de cada tipo de alimento sigue siendo necesario.

### 4.4. Notas de remisión: vender y despachar

**Qué hace:** deja constancia de a quién y dónde se entregaron huevos, cuánto costaron y cuánto se pagó. La remisión es un registro interno, no una factura.

**Registrar el cliente, si no existe**

1. Abre **Notas de remisión**.
2. En **Registrar cliente / punto de venta**, escribe nombre, teléfono y dirección si se conocen.
3. Guarda; el cliente aparecerá en la nueva remisión.

**Registrar la entrega**

1. En **Nueva remisión**, elige cliente, fecha y destino de entrega.
2. Por cada talla, indica cajas, maples adicionales, huevos sueltos y **precio por maple**.
3. Usa **Agregar talla** si hay otra talla en la misma venta. No dupliques cantidades ya incluidas en cajas.
4. En **Pago recibido hoy (Bs)**, escribe lo efectivamente recibido: 0 si todavía no pagó, un abono si pagó parte o el total si canceló.
5. Revisa el total y pulsa **Guardar y despachar**.
6. Verifica la nota, saldo y salida de inventario.

**Ejemplo:** vendes 1 caja + 2 maples + 3 huevos talla G a Bs 30,00 por maple. Son **423 huevos** y el total es **Bs 423,00**. Si recibiste Bs 100,00, la nota queda **PARCIAL**, con **Bs 323,00 pendientes**. El stock se descuenta al guardar el despacho, no cuando se termina de cobrar.

El precio por maple debe ser real y mayor que cero. Se cobra proporcionalmente por los huevos sueltos. El sistema rechaza despachar más stock del disponible. Para cambiar un precio o cantidad antes de guardar, corrige la línea; una nota ya guardada no se modifica desde este formulario.

### 4.5. Anotar abonos y consultar el historial

1. En **Anotar pago / abono**, elige una remisión que tenga deuda.
2. Escribe fecha del cobro, monto recibido y referencia si corresponde.
3. Guarda.
4. En **Remisiones e historial de entrega**, pulsa el número de la nota para consultar detalles y pagos.
5. Revisa **Saldos por cliente**.

**Ejemplo:** sobre la deuda de Bs 323,00 recibes ese mismo monto. Registra un abono de **Bs 323,00**. La nota pasa a **PAGADA** y su saldo queda en cero. No se descuenta stock otra vez. Si no hay notas impagas, es normal que el selector no tenga opciones.

La venta con cobro y cada abono generan un ingreso en caja. No los vuelvas a registrar manualmente como dinero recibido. En esta versión los cobros se registran como efectivo; no hay control separado de bancos o transferencias.

### 4.6. Mis gastos

**Qué hace:** permite anotar tus propios gastos y entregar su historial a administración.

Completa **Mis gastos → Anotar un gasto** con fecha, monto, explicación y concepto. Puedes filtrar por período y descargar el informe de tus movimientos.

**Ejemplo:** compras maples vacíos por Bs 25,00 y lo anotas aquí. Si una compra de insumos ya generó gasto al marcar la casilla de caja, no la repitas en Mis gastos. No tienes acceso al arqueo ni al saldo general de caja.

### 4.7. Rutina del almacén

- Recibir huevos sanos y clasificar las recolecciones pendientes por talla.
- Registrar roturas de almacén, compras y entregas reales de insumos.
- Revisar stock antes de preparar una remisión.
- Anotar cada despacho y cada cobro una sola vez.
- Revisar deudas pendientes, gastos propios y notificaciones.

## 5. Ejemplo completo: desde el galpón hasta caja

Este ejercicio ilustra una secuencia; no es una carga de datos para producción. Se supone stock inicial de huevos en cero y que no hubo otras operaciones.

| Paso | Actor y acción | Resultado |
| --- | --- | --- |
| 1 | Galpón registra 2.350 sanos y 10 rotos | 2.360 huevos para postura; 2.350 para clasificar |
| 2 | Almacén clasifica G: 2 cajas + 3 maples + 4 huevos | 814 huevos G |
| 3 | Almacén clasifica M: 4 cajas + 3 maples + 6 huevos | 1.536 huevos M; recolección totalmente clasificada |
| 4 | Almacén registra merma de 5 huevos G | Quedan 809 huevos G |
| 5 | Almacén despacha 423 huevos G y cobra Bs 100,00 | Quedan 386 G; nota de Bs 423,00 con deuda de Bs 323,00 |
| 6 | Almacén cobra y registra Bs 323,00 | Nota pagada; ingreso total de la venta Bs 423,00 |

Al finalizar, quedan **386 huevos G + 1.536 huevos M = 1.922 huevos** en stock. Esos 386 G equivalen a 12 maples y 26 sueltos; la vista también informa cuántas cajas completas pueden armarse.

Para el ejemplo de caja de esa misma semana, supone además un fondo de Bs 1.000,00, una compra de alimento pagada desde caja por Bs 800,00 y transporte por Bs 20,00:

**Bs 1.000,00 + Bs 100,00 + Bs 323,00 − Bs 800,00 − Bs 20,00 = Bs 603,00.**

Administración compara esos Bs 603,00 con el efectivo al cierre y guarda el arqueo de la semana finalizada. Registrar la remisión y sus abonos no requiere volver a escribir esos ingresos en caja.

## 6. Problemas habituales y límites de esta versión

| Situación | Qué hacer |
| --- | --- |
| No aparece un galpón para registrar | Administración debe revisar que exista un lote activo y configurar su censo. |
| No puedo elegir una recolección pendiente | Primero debe existir una recolección con huevos sanos aún sin clasificar. Si ya se clasificó toda, revisa el historial. |
| No puedo elegir una remisión para abonar | Solo aparecen las notas con saldo por cobrar. Revisa si todavía falta crear la venta o si ya está pagada. |
| No hay insumos en el selector | Crea primero el producto; después registra la compra o entrada para agregar existencias. |
| El sistema indica stock insuficiente | Revisa talla, cantidades y movimientos. Una recolección sin clasificar todavía no es stock por talla. |
| El día ya tiene recolección | Revisa el historial. No registres el mismo hecho con otra fecha para evitar la validación. |
| Me equivoqué en un registro guardado | Comunica a administración cuál fue el registro y el dato correcto. No hay un editor general ni un botón de anulación en estas pantallas; si hace falta corregir datos, coordina una corrección trazable con el responsable técnico. |
| No permite un gasto o cobro con fecha antigua | Puede existir un arqueo que ya cerró esas fechas. No cambies la fecha solo para sortear el cierre; administración debe revisar cómo registrar la corrección en un período abierto. |
| No puedo hacer el arqueo | Debe ser una semana de lunes a domingo ya finalizada, no cerrada antes. Si hay diferencia, necesita explicación. |
| El análisis dice que faltan datos | Completa los registros reales que falten. No se rellenan días con ceros ni se inventa consumo de agua. |
| Se perdió la conexión al guardar | Al reconectar, revisa el historial antes de repetir. Si hay duda, pide a administración verificar si se guardó. |
| No puedo entrar a mi cuenta | Revisa correo y contraseña. Usa el código de recuperación o solicita restablecimiento al administrador. Después de varios intentos fallidos, espera 15 minutos. |

**Para recordar:** cada persona usa su cuenta; cada hecho se registra una sola vez; estimar alimento no equivale a medirlo; registrar una recolección no equivale a clasificar stock; cobrar una deuda no equivale a despachar huevos de nuevo.
