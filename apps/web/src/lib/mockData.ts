export interface TallaInfo {
  codigo: 'P' | 'CH' | 'M' | 'G' | 'XG' | 'XXG';
  nombre: string;
  rangoGramos: string;
  pesoMinG: number;
  pesoMaxG: number;
  precioMaple: number; // Precio mercado semanal
  precioCaja: number;  // 12 maples
  costoAlimentoPorMaple: number; // Calculado proporcionalmente
  stockMaples: number;
  stockSueltos: number;
  rotacionDias: number; // Días promedio en almacén
  ventasSemanalesMaples: number;
}

export interface RegistroProduccion {
  id: string;
  fecha: string;
  galponId: string;
  galponNombre: string;
  maples: number;
  sueltos: number;
  totalHuevos: number;
  kgAlimento: number;
  posturaPct: number;
  fcr: number;
  mortalidad: number;
}

export interface NotaRemision {
  id: string;
  numero: number;
  fecha: string;
  cliente: string;
  tipoCliente: 'MAYORISTA' | 'MINORISTA';
  tipoPago: 'CONTADO' | 'CREDITO';
  items: {
    tallaCodigo: string;
    maples: number;
    precioMaple: number;
    subtotal: number;
  }[];
  total: number;
  estado: 'PAGADA' | 'PENDIENTE';
}

export interface MovimientoCaja {
  id: string;
  fecha: string;
  tipo: 'INGRESO' | 'EGRESO';
  categoria: 'VENTAS' | 'ALIMENTO' | 'INSUMOS_VITAMINAS' | 'MAPLES_VACIOS' | 'TRANSPORTE_FLETE' | 'VETERINARIA' | 'VARIOS';
  descripcion: string;
  monto: number;
}

// Datos iniciales realistas para granja de 4,000 aves Hy-Line Brown
export const TALLAS_INICIALES: TallaInfo[] = [
  {
    codigo: 'P',
    nombre: 'Pequeño',
    rangoGramos: '< 48 g',
    pesoMinG: 0,
    pesoMaxG: 47,
    precioMaple: 2.80,
    precioCaja: 33.60,
    costoAlimentoPorMaple: 1.85,
    stockMaples: 42,
    stockSueltos: 15,
    rotacionDias: 14, // Baja rotación
    ventasSemanalesMaples: 35,
  },
  {
    codigo: 'CH',
    nombre: 'Chico',
    rangoGramos: '48 – 52 g',
    pesoMinG: 48,
    pesoMaxG: 52,
    precioMaple: 3.20,
    precioCaja: 38.40,
    costoAlimentoPorMaple: 1.95,
    stockMaples: 65,
    stockSueltos: 8,
    rotacionDias: 7,
    ventasSemanalesMaples: 70,
  },
  {
    codigo: 'M',
    nombre: 'Mediano',
    rangoGramos: '53 – 59 g',
    pesoMinG: 53,
    pesoMaxG: 59,
    precioMaple: 3.85,
    precioCaja: 46.20,
    costoAlimentoPorMaple: 2.05,
    stockMaples: 140,
    stockSueltos: 22,
    rotacionDias: 3, // Alta rotación
    ventasSemanalesMaples: 210,
  },
  {
    codigo: 'G',
    nombre: 'Grande',
    rangoGramos: '60 – 66 g',
    pesoMinG: 60,
    pesoMaxG: 66,
    precioMaple: 4.40,
    precioCaja: 52.80,
    costoAlimentoPorMaple: 2.15,
    stockMaples: 210,
    stockSueltos: 5,
    rotacionDias: 2, // Muy alta rotación (la que más se vende)
    ventasSemanalesMaples: 320,
  },
  {
    codigo: 'XG',
    nombre: 'Extra Grande',
    rangoGramos: '67 – 72 g',
    pesoMinG: 67,
    pesoMaxG: 72,
    precioMaple: 4.95,
    precioCaja: 59.40,
    costoAlimentoPorMaple: 2.25,
    stockMaples: 95,
    stockSueltos: 14,
    rotacionDias: 5,
    ventasSemanalesMaples: 130,
  },
  {
    codigo: 'XXG',
    nombre: 'Doble Extra Grande (Jumbo)',
    rangoGramos: '> 72 g',
    pesoMinG: 73,
    pesoMaxG: 999,
    precioMaple: 5.40,
    precioCaja: 64.80,
    costoAlimentoPorMaple: 2.35,
    stockMaples: 30,
    stockSueltos: 18,
    rotacionDias: 9, // Rotación moderada/baja
    ventasSemanalesMaples: 45,
  },
];

export const PRODUCCION_HISTORICA_7_DIAS: RegistroProduccion[] = [
  { id: 'p1', fecha: '2026-10-01', galponId: 'g1', galponNombre: 'Galpón 1 (1,500 aves)', maples: 46, sueltos: 12, totalHuevos: 1392, kgAlimento: 165, posturaPct: 92.8, fcr: 3.58, mortalidad: 1 },
  { id: 'p2', fecha: '2026-10-01', galponId: 'g2', galponNombre: 'Galpón 2 (2,500 aves)', maples: 77, sueltos: 15, totalHuevos: 2325, kgAlimento: 275, posturaPct: 93.0, fcr: 3.57, mortalidad: 2 },
  { id: 'p3', fecha: '2026-10-02', galponId: 'g1', galponNombre: 'Galpón 1 (1,500 aves)', maples: 45, sueltos: 20, totalHuevos: 1370, kgAlimento: 164, posturaPct: 91.4, fcr: 3.64, mortalidad: 0 },
  { id: 'p4', fecha: '2026-10-02', galponId: 'g2', galponNombre: 'Galpón 2 (2,500 aves)', maples: 78, sueltos: 0, totalHuevos: 2340, kgAlimento: 275, posturaPct: 93.6, fcr: 3.52, mortalidad: 1 },
  { id: 'p5', fecha: '2026-10-03', galponId: 'g1', galponNombre: 'Galpón 1 (1,500 aves)', maples: 46, sueltos: 5, totalHuevos: 1385, kgAlimento: 165, posturaPct: 92.4, fcr: 3.58, mortalidad: 2 },
  { id: 'p6', fecha: '2026-10-03', galponId: 'g2', galponNombre: 'Galpón 2 (2,500 aves)', maples: 76, sueltos: 24, totalHuevos: 2304, kgAlimento: 274, posturaPct: 92.2, fcr: 3.60, mortalidad: 3 },
  { id: 'p7', fecha: '2026-10-04', galponId: 'g1', galponNombre: 'Galpón 1 (1,500 aves)', maples: 47, sueltos: 0, totalHuevos: 1410, kgAlimento: 165, posturaPct: 94.1, fcr: 3.51, mortalidad: 1 },
  { id: 'p8', fecha: '2026-10-04', galponId: 'g2', galponNombre: 'Galpón 2 (2,500 aves)', maples: 79, sueltos: 10, totalHuevos: 2380, kgAlimento: 276, posturaPct: 95.3, fcr: 3.49, mortalidad: 0 },
  { id: 'p9', fecha: '2026-10-05', galponId: 'g1', galponNombre: 'Galpón 1 (1,500 aves)', maples: 46, sueltos: 15, totalHuevos: 1395, kgAlimento: 164, posturaPct: 93.1, fcr: 3.56, mortalidad: 0 },
  { id: 'p10', fecha: '2026-10-05', galponId: 'g2', galponNombre: 'Galpón 2 (2,500 aves)', maples: 77, sueltos: 20, totalHuevos: 2330, kgAlimento: 275, posturaPct: 93.3, fcr: 3.57, mortalidad: 1 },
  { id: 'p11', fecha: '2026-10-06', galponId: 'g1', galponNombre: 'Galpón 1 (1,500 aves)', maples: 46, sueltos: 8, totalHuevos: 1388, kgAlimento: 165, posturaPct: 92.7, fcr: 3.58, mortalidad: 1 },
  { id: 'p12', fecha: '2026-10-06', galponId: 'g2', galponNombre: 'Galpón 2 (2,500 aves)', maples: 78, sueltos: 6, totalHuevos: 2346, kgAlimento: 276, posturaPct: 93.9, fcr: 3.53, mortalidad: 2 },
];

export const REMISIONES_INICIALES: NotaRemision[] = [
  {
    id: 'rem-101',
    numero: 101,
    fecha: '2026-10-05',
    cliente: 'Distribuidora Avícola Don Pedro',
    tipoCliente: 'MAYORISTA',
    tipoPago: 'CREDITO',
    items: [
      { tallaCodigo: 'G', maples: 120, precioMaple: 4.40, subtotal: 528.00 },
      { tallaCodigo: 'M', maples: 80, precioMaple: 3.85, subtotal: 308.00 },
      { tallaCodigo: 'XG', maples: 40, precioMaple: 4.95, subtotal: 198.00 },
    ],
    total: 1034.00,
    estado: 'PENDIENTE',
  },
  {
    id: 'rem-102',
    numero: 102,
    fecha: '2026-10-05',
    cliente: 'Mercado Central - Puesto 45',
    tipoCliente: 'MAYORISTA',
    tipoPago: 'CONTADO',
    items: [
      { tallaCodigo: 'G', maples: 60, precioMaple: 4.40, subtotal: 264.00 },
      { tallaCodigo: 'CH', maples: 30, precioMaple: 3.20, subtotal: 96.00 },
    ],
    total: 360.00,
    estado: 'PAGADA',
  },
  {
    id: 'rem-103',
    numero: 103,
    fecha: '2026-10-06',
    cliente: 'Panadería La Espiga Dorada',
    tipoCliente: 'MINORISTA',
    tipoPago: 'CONTADO',
    items: [
      { tallaCodigo: 'P', maples: 15, precioMaple: 2.80, subtotal: 42.00 },
      { tallaCodigo: 'M', maples: 20, precioMaple: 3.85, subtotal: 77.00 },
    ],
    total: 119.00,
    estado: 'PAGADA',
  },
];

export const MOVIMIENTOS_CAJA_INICIALES: MovimientoCaja[] = [
  { id: 'm1', fecha: '2026-10-05', tipo: 'INGRESO', categoria: 'VENTAS', descripcion: 'Cobro Remisión #102 Contado', monto: 360.00 },
  { id: 'm2', fecha: '2026-10-06', tipo: 'INGRESO', categoria: 'VENTAS', descripcion: 'Cobro Remisión #103 Contado', monto: 119.00 },
  { id: 'm3', fecha: '2026-10-02', tipo: 'EGRESO', categoria: 'ALIMENTO', descripcion: 'Compra 3 Toneladas Concentrado Hy-Line', monto: 1250.00 },
  { id: 'm4', fecha: '2026-10-03', tipo: 'EGRESO', categoria: 'MAPLES_VACIOS', descripcion: '500 Maples nuevos de cartón', monto: 85.00 },
  { id: 'm5', fecha: '2026-10-04', tipo: 'EGRESO', categoria: 'TRANSPORTE_FLETE', descripcion: 'Flete despacho dominical feria', monto: 60.00 },
  { id: 'm6', fecha: '2026-10-05', tipo: 'EGRESO', categoria: 'INSUMOS_VITAMINAS', descripcion: 'Complejo B y electrolitos antiestrés', monto: 45.00 },
];
