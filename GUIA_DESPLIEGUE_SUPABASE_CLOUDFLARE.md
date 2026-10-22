# 🚀 Estado y Guía de Producción: Supabase & Cloudflare

El sistema **ERP y Business Intelligence "Alta La Estancia"** se encuentra **100% desplegado y operativo en producción**.

---

## 🌐 URLs de Producción en Vivo

| Componente | Servicio | URL / Identificador | Estado |
| :--- | :--- | :--- | :--- |
| **Frontend PWA** | Cloudflare Workers Static Assets | **[https://erp-avicola-web.gerardoburgos1232.workers.dev](https://erp-avicola-web.gerardoburgos1232.workers.dev)** | 🟢 Activo (HTTPS) |
| **Backend API** | Cloudflare Workers Edge | **[https://erp-avicola-api.gerardoburgos1232.workers.dev](https://erp-avicola-api.gerardoburgos1232.workers.dev)** | 🟢 Activo (31ms startup) |
| **Acelerador Edge DB** | Cloudflare Hyperdrive | ID: `5a3de3a4cbe04ca88ad5d13514c115c3` | 🟢 Enlazado y activo |
| **Base de Datos** | Supabase PostgreSQL | Proyecto: `vhptjsbbyyhjdfshnbim` (AWS Oregon) | 🟢 12 Tablas + Seed |
| **Entorno Local** | Vite Dev Server (LAN) | `http://localhost:5173` / `http://192.168.1.6:5173` | 🟢 Activo para desarrollo |

---

## 📱 Cómo Acceder e Instalar en tu Teléfono Móvil o Tablet

La aplicación web está configurada como una **Progressive Web App (PWA)**, lo que permite instalarla como si fuera una aplicación nativa de Android o iOS sin necesidad de tiendas de aplicaciones.

### En Android (Chrome / Brave / Edge):
1. Abre tu navegador en el móvil y entra a:
   👉 **`https://erp-avicola-web.gerardoburgos1232.workers.dev`**
2. Aparecerá un aviso en la parte inferior: **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
   - Si no aparece automáticamente, toca el menú de tres puntos verticales (`⋮`) arriba a la derecha en Chrome y selecciona **"Instalar aplicación"** o **"Agregar a la pantalla de inicio"**.
3. Se creará el icono de **ERP Avícola** en tu pantalla de inicio con diseño a pantalla completa (sin barra del navegador) y soporte offline.

### En iPhone / iPad (Safari):
1. Abre Safari y visita:
   👉 **`https://erp-avicola-web.gerardoburgos1232.workers.dev`**
2. Presiona el botón de **Compartir** (el cuadro con una flecha hacia arriba en la barra inferior).
3. Selecciona **"Agregar al inicio"** (*Add to Home Screen*).
4. Asigna el nombre y presiona **Agregar**.

---

## 🗄️ Resumen de lo Configurado en la Base de Datos

En Supabase se aplicaron todas las migraciones y datos de arranque:

1. **Catálogo de Tallas de Huevo:**
   - `P` (Pequeño, 0 - 47g)
   - `CH` (Chico, 48 - 52g)
   - `M` (Mediano, 53 - 59g)
   - `G` (Grande, 60 - 66g)
   - `XG` (Extra Grande, 67 - 72g)
   - `XXG` (Doble Extra Grande, 73g+)
2. **Galpones Aprovisionados:**
   - `Galpón 1`: Capacidad para 1,500 aves.
   - `Galpón 2`: Capacidad para 2,500 aves.
3. **Lotes Activos:**
   - `LOTE-2026-G1`: 1,500 aves Hy-Line Brown.
   - `LOTE-2026-G2`: 2,500 aves Hy-Line Brown.
   - **Total censo:** 4,000 aves alojadas.
4. **Inventario & Precios:**
   - 6 registros de stock base vinculados por clave foránea.
   - Matriz de precios por maple (Bs. 30.00 base) y caja (Bs. 360.00).

---

## 🛠️ Comandos de Mantenimiento para el Futuro

### Para redesplegar cambios en el Backend:
```powershell
cd "c:\Users\Usuario\Desktop\ERP avicola\apps\api"
pnpm run deploy
```

### Para redesplegar cambios en el Frontend:
```powershell
cd "c:\Users\Usuario\Desktop\ERP avicola\apps\web"
pnpm run build
pnpm run deploy
```
