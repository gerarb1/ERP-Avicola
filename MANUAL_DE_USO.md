# 📘 Manual de Operaciones y Uso del Sistema
## ERP Agroindustrial & BI — "Alta La Estancia"

---

## 📑 Tabla de Contenidos
1. [Introducción & Visión General](#1-introducción--visión-general)
2. [Instalación en Teléfonos y Tablets (PWA)](#2-instalación-en-teléfonos-y-tablets-pwa)
3. [Navegación General y Elementos Fijos](#3-navegación-general-y-elementos-fijos)
4. [Módulo Galponero (Encargado de Galpón)](#4-módulo-galponero-encargado-de-galpón)
5. [Módulo Almacenero (Encargado de Almacén)](#5-módulo-almacenero-encargado-de-almacén)
6. [Módulo Gerencial (Administrador & BI)](#6-módulo-gerencial-administrador--bi)
7. [Funcionamiento Offline (Zona Rural sin Señal)](#7-funcionamiento-offline-zona-rural-sin-señal)
8. [Preguntas Frecuentes y Buenas Prácticas](#8-preguntas-frecuentes-y-buenas-prácticas)

---

## 1. Introducción & Visión General

El **ERP Avícola de Alta La Estancia** ha sido concebido para erradicar por completo el registro manual en cuadernos de papel, centralizar los datos en tiempo real y convertir las operaciones diarias de las 4,000 aves de postura en **decisiones comerciales rentables**.

### Parámetros de la Granja:
- **Galpón 1:** 1,500 aves (*Hy-Line Brown*).
- **Galpón 2:** 2,500 aves (*Hy-Line Brown*).
- **Equivalencias estándar:**
  - $1\text{ Maple} = 30\text{ huevos}$.
  - $1\text{ Caja Estándar} = 12\text{ maples} = 360\text{ huevos}$.

---

## 2. Instalación en Teléfonos y Tablets (PWA)

El sistema funciona como una **Progressive Web App (PWA)**, lo que permite utilizarlo como una aplicación móvil sin pasar por Google Play o App Store:

### En Android (Google Chrome / Brave):
1. Ingresa a: **`https://erp-avicola-web.gerardoburgos1232.workers.dev`**
2. Toca los tres puntos (`⋮`) en la esquina superior derecha.
3. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla principal"**.
4. Listo. Tendrás el icono verde de la granja en tu teléfono.

### En iPhone / iPad (Safari):
1. Abre el enlace en Safari.
2. Toca el botón de Compartir (icono cuadrado con flecha hacia arriba).
3. Selecciona **"Agregar al inicio"** (*Add to Home Screen*).

---

## 3. Navegación General y Elementos Fijos

La pantalla se estructura en 3 zonas claras diseñadas con ergonomía móvil:

1. **Barra Superior (Top App Bar):**
   - **Selector Global de Galpón (`Galpón 01 ▼`):** Permite cambiar el contexto entre Galpón 1 y Galpón 2 con un solo toque.
   - **Indicador de Sincronización:** Punto verde cuando los datos están guardados en la nube; ámbar con contador si estás trabajando offline en el galpón.
   - **Paleta de Comandos (`Ctrl+K` en PC o icono de lupa en móvil):** Para saltar rápidamente a cualquier lote o función.
2. **Barra Inferior / Lateral:**
   - En celulares: Barra inferior con acceso a las vistas principales.
   - En computadoras: Barra lateral colapsable para maximizar el área de trabajo.
3. **Panel Lateral Deslizante (*Slide-Over Sheet*):**
   - Al registrar datos o inspeccionar alertas, no se recarga la página; se abre un panel lateral sobre el 40% de la pantalla que preserva el contexto del trabajo anterior.

---

## 4. Módulo Galponero (Encargado de Galpón)

**Objetivo:** Captura ultrarrápida (en menos de 30 segundos) de las actividades matutinas y vespertinas en galpón.

### 4.1. Registro del Día (Modo Táctico)
Al entrar a la vista de **Producción**, encontrarás el botón destacado **"+ Registrar Postura del Día"**:

1. **Seleccionar Galpón:** Elige Galpón 1 o Galpón 2.
2. **Maples Recolectados:** Ingresa la cantidad de maples completos (ej. 46 maples).
3. **Huevos Sueltos:** Ingresa los huevos que no completaron un maple (0 a 29).
4. **Alimento Servido (kg):** Ingresa los kilogramos de balanceado administrados hoy.
5. **Cálculo en Vivo y Alerta de Seguridad:**
   - La pantalla calcula automáticamente el $\% \text{ de Postura}$ y el índice de conversión $\text{FCR}$.
   - **Validación de Integridad:** Si por error introduces más huevos que la cantidad de aves vivas alojadas, el botón se bloquea y te avisa: *"Los huevos recolectados superan las aves vivas del lote"*.

### 4.2. Registro de Mortalidad Diaria
1. Presiona **"Registrar Baja / Mortalidad"**.
2. Ingresa la cantidad de aves muertas y la causa (ej. *Causa natural*, *Picaje*, *Prolapso*, *Golpe de calor*).
3. Al guardar, el censo de aves vivas se **decrementa automáticamente** en la base de datos, garantizando que el porcentaje de postura de los días siguientes se calcule sobre la población real.

---

## 5. Módulo Almacenero (Encargado de Almacén)

**Objetivo:** Control riguroso de entradas clasificadas por tamaño, prevención de mermas y control de stock para la venta.

### 5.1. Recepción y Clasificación por Tallas
Cuando la producción llega del galpón a la sala de selección:
1. Haz clic en **"+ Recepción Clasificada"**.
2. Ingresa la cantidad clasificada en cada talla comercial:
   - **P (Pequeño)**
   - **CH (Chico)**
   - **M (Mediano)**
   - **G (Grande)**
   - **XG (Extra Grande)**
   - **XXG (Doble Extra Grande)**
3. El sistema muestra la equivalencia instantánea en **Cajas (12 maples) + Maples restantes**.

### 5.2. Registro de Mermas / Roturas
Si un huevo se rompe durante la selección o el traslado:
1. Haz clic en **"Registrar Merma"**.
2. Selecciona la talla afectada, cantidad y motivo (*Rotura en selección*, *Cáscara frágil*, *Daño en transporte*).
3. El stock disponible se ajusta de inmediato.

---

## 6. Módulo Gerencial (Administrador & BI)

**Objetivo:** Diagnóstico de la granja en 5 segundos, control comercial de domingos y optimización de utilidades.

### 6.1. Tablero de Control de Postura
- **Curva Continua de Postura:** Línea continua con la producción diaria real superpuesta contra el **estándar genético esperado Hy-Line Brown (92%)**.
- **Panel de Alertas Tempranas:** Destaca de forma automática únicamente los galpones con desviaciones (ej. caída mayor al 3% en postura o pico de bajas).

### 6.2. Analítica de Tallas (Business Intelligence)
En la sección **BI**, el sistema responde a las preguntas estratégicas:
- **¿Qué tallas se venden más?**
  Muestra la rotación semanal y el volumen facturado de tallas de alta demanda (típicamente **Grande `G`** y **Extra Grande `XG`**).
- **¿Qué hacer con las tallas de menor venta?**
  El módulo identifica cuellos de botella en tallas pequeñas (`P` y `CH`) y propone acciones operativas:
  - *Sugerencia de canal:* Paquetes de precio especial para panaderías y repostería industrial donde el peso individual del huevo no es determinante.
  - *Sugerencia de rotación:* Descuento por volumen en compra mixta (ej. por cada 5 cajas de Grande, 1 caja de Mediano a precio preferencial).
- **Cálculo de Ganancia por Talla:**
  Aplica la fórmula de asignación de coste de alimento proporcional al peso y unidades, restando el ingreso por venta para mostrar la **utilidad neta real por talla**.

### 6.3. Emisión de Notas de Remisión Dominicales
Los domingos de feria o entrega a mayoristas:
1. Ir a **Ventas** $\rightarrow$ **"+ Nueva Nota de Remisión"**.
2. Seleccionar el Cliente Mayorista o Minorista.
3. Indicar el tipo de pago:
   - **CONTADO:** El dinero ingresa automáticamente a la Caja Chica.
   - **CRÉDITO:** Se genera una cuenta por cobrar y se acumula en el historial del cliente.
4. Agregar los maples/cajas por talla. El sistema descuenta el stock en tiempo real y previene la venta de tallas sin inventario suficiente.

### 6.4. Caja Chica y Arqueo Semanal
- Registro de gastos menores del día a día (*Maples vacíos*, *Insumos veterinarios*, *Flete*).
- Los domingos se realiza el **Arqueo Obligatorio**: Compara el saldo esperado del sistema vs el dinero físico en mano y genera el informe de conciliación.

---

## 7. Funcionamiento Offline (Zona Rural sin Señal)

La granja suele tener intermitencias o ausencia de red móvil:

1. **No te preocupes por la señal:** Puedes abrir la aplicación y registrar postura, bajas o inventario aunque el celular esté en Modo Avión o sin señal.
2. **Almacenamiento Local Seguro:** Cada registro se guarda en la base de datos interna del navegador (**IndexedDB / Dexie.js**) con una clave de idempotencia única `UUIDv4`.
3. **Sincronización Automática:** En cuanto el teléfono vuelve a detectar conexión WiFi o 4G, el motor de sincronización sube los datos a Supabase en segundo plano sin duplicar registros ni alterar números de lote.
4. **Indicador Visual:** El punto ámbar en la barra superior te indica cuántas operaciones están en cola esperando sincronización.

---

## 8. Preguntas Frecuentes y Buenas Prácticas

- **¿Pueden dos personas registrar al mismo tiempo?**  
  Sí. Cada registro viaja con encabezado de idempotencia transaccional `X-Idempotency-Key` en el backend de Cloudflare, evitando duplicidades.
- **¿Qué pasa si me equivoco al ingresar la recolección?**  
  Puedes ingresar al Historial de la jornada y editar el registro del día antes del cierre dominical.
- **¿Cómo respaldar la información?**  
  La base de datos PostgreSQL en Supabase realiza respaldos diarios automáticos en la nube.

---
*Alta La Estancia — Agroindustria de Precisión*
