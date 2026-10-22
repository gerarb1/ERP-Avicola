# 🥚 ERP Avícola & Business Intelligence "Alta La Estancia"

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-EF4444.svg)](https://turbo.build/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20+%20Vite%20PWA-61DAFB.svg)](https://react.dev/)
[![Hono.js](https://img.shields.io/badge/Backend-Hono.js%20Edge-E36002.svg)](https://hono.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloud-Cloudflare%20Workers%20%2B%20Hyperdrive-F38020.svg)](https://workers.cloudflare.com/)
[![Supabase](https://img.shields.io/badge/Database-PostgreSQL%20(Supabase)-3ECF8E.svg)](https://supabase.com/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle%200.45-C5F74F.svg)](https://orm.drizzle.team/)

Sistema integral de gestión de recursos empresariales (**ERP**) y módulo de analítica predictiva/inteligencia de negocios (**BI**) diseñado específicamente para la operación agroindustrial de postura comercial en **"Alta La Estancia"**.

> La operación autenticada, gestión de cuentas reales, raciones estimadas, reglas Hy-Line, migraciones y validaciones de esta rama están en [Operación y puesta en marcha](docs/OPERACION.md).

---

## 🌐 Enlaces de Producción en Vivo

- 📱 **Aplicación Web (PWA Instalable):** [https://erp-avicola-web.gerardoburgos1232.workers.dev](https://erp-avicola-web.gerardoburgos1232.workers.dev)
- ⚡ **Backend API (Edge Computing):** [https://erp-avicola-api.gerardoburgos1232.workers.dev](https://erp-avicola-api.gerardoburgos1232.workers.dev)
- 📊 **Health Check:** [https://erp-avicola-api.gerardoburgos1232.workers.dev/health](https://erp-avicola-api.gerardoburgos1232.workers.dev/health)

---

## 🚜 Parámetros Operativos del Negocio

- **Capacidad Instalada:** 4,000 aves de postura activa (*Hy-Line Brown*).
  - **Galpón 1:** 1,500 aves alojadas.
  - **Galpón 2:** 2,500 aves alojadas.
- **Unidades de Negocio:**
  - `1 Maple` = 30 unidades físicas.
  - `1 Caja Estándar` = 12 maples = 360 unidades físicas.
- **Clasificación Comercial por Tallas:**
  - `P` (Pequeño): $< 48\text{ g}$
  - `CH` (Chico): $48 - 52\text{ g}$
  - `M` (Mediano): $53 - 59\text{ g}$
  - `G` (Grande): $60 - 66\text{ g}$
  - `XG` (Extra Grande): $67 - 72\text{ g}$
  - `XXG` (Doble Extra Grande): $\ge 73\text{ g}$

---

## 🏗️ Arquitectura del Sistema

El proyecto sigue una estructura **Turborepo Monorepo** con principios de **Clean Architecture**, **Domain-Driven Design (DDD)** y **Screaming Architecture**:

```text
erp-avicola/
├── apps/
│   ├── api/                 # Backend Edge Hono.js en Cloudflare Workers
│   │   ├── src/
│   │   │   ├── features/    # Screaming Architecture (galpones, produccion, inventario, ventas, precios, finanzas, bi)
│   │   │   └── middleware/  # Database (Hyperdrive), RBAC, Idempotencia, Error handling
│   │   └── wrangler.jsonc   # Configuración de Worker y enlace Hyperdrive
│   │
│   └── web/                 # Frontend React 19 + Vite 6 PWA Mobile-First
│       ├── src/
│       │   ├── features/    # Vistas tácticas por rol: produccion, inventario, ventas, finanzas, bi
│       │   ├── lib/offline/ # Motor Offline-First con Dexie.js (IndexedDB) y TanStack Query
│       │   └── shared/      # 3 zonas fijas (Top Bar, Sidebar/BottomNav, SlideOverSheet)
│       └── wrangler.jsonc   # Despliegue estático Cloudflare Workers Assets
│
└── packages/
    ├── db/                  # Esquemas de base de datos Drizzle ORM, migraciones y seed
    ├── shared/              # Lógica de dominio pura, fórmulas (% postura, FCR, márgenes), tipos y esquemas Zod
    └── tsconfig/            # Configuraciones base de TypeScript compartidas
```

---

## 📐 Fórmulas de Negocio Implementadas

- **Porcentaje de Postura Diaria:**
  $$\%\text{ Postura} = \left(\frac{\text{Huevos Recolectados}}{\text{Aves Vivas Alojadas}}\right) \times 100$$
- **Índice de Conversión Alimenticia (FCR):**
  $$\text{FCR} = \frac{\text{Kg Alimento Consumido}}{\text{Maples Producidos}}$$
- **Asignación Proporcional de Costo de Alimento por Talla:**
  $$\text{Costo Alimento}_{\text{Talla}} = \frac{\text{Costo Total Alimento} \times \text{Unidades}_{\text{Talla}}}{\text{Total Unidades Producidas}}$$
- **Margen Operativo por Talla:**
  $$\text{Margen}_{\text{Talla}} = \text{Ingresos}_{\text{Talla}} - \text{Costo Proporcional}_{\text{Talla}}$$

---

## 💻 Puesta en Marcha Local

### Prerrequisitos
- **Node.js** $\ge 20.0.0$
- **pnpm** $\ge 9.0.0$

### 1. Instalación de dependencias
```powershell
pnpm install
```

### 2. Configurar variables de entorno
Crea `packages/db/.env` basado en `.env.example`:
```env
DATABASE_URL="postgresql://postgres.[USER]:[PASSWORD]@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
```

Crea `apps/web/.env`:
```env
VITE_API_URL="https://erp-avicola-api.gerardoburgos1232.workers.dev"
```

### 3. Ejecutar en desarrollo
```powershell
pnpm dev
```
- Frontend Web: `http://localhost:5173`
- Backend API: `http://localhost:8787`

### 4. Migraciones y Seed de la Base de Datos
```powershell
# Subir esquema a Supabase
pnpm --filter @erp-avicola/db db:push

# Cargar datos iniciales (Galpones, Lotes, Tallas, Precios)
pnpm --filter @erp-avicola/db db:seed
```

---

## 🚀 Despliegue a Producción

El proyecto está vinculado a Cloudflare:

```powershell
# Desplegar API Worker
cd apps/api
pnpm run deploy

# Compilar y desplegar Frontend PWA
cd ../web
pnpm run build
pnpm run deploy
```

---

## 📄 Licencia y Propiedad

Desarrollado exclusivamente para **Alta La Estancia Agroindustrial**. Todos los derechos reservados.
