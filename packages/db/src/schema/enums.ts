import { pgEnum } from 'drizzle-orm/pg-core';
import { CATEGORIAS_EGRESO } from '@erp-avicola/shared';

const categoriasValores = Object.values(CATEGORIAS_EGRESO) as [string, ...string[]];

export const rolUsuarioEnum = pgEnum('rol_usuario', ['administrador', 'encargado_galpon', 'encargado_almacen']);
export const tipoPagoEnum = pgEnum('tipo_pago', ['CONTADO', 'CREDITO']);
export const estadoNotaEnum = pgEnum('estado_nota', ['PENDIENTE', 'PAGADA', 'PARCIAL', 'ANULADA']);
export const tipoMovimientoEnum = pgEnum('tipo_movimiento', ['INGRESO', 'EGRESO']);
export const categoriaEgresoEnum = pgEnum('categoria_egreso', categoriasValores);
export const tipoMovimientoInventarioEnum = pgEnum('tipo_movimiento_inventario', ['ENTRADA', 'SALIDA', 'MERMA', 'AJUSTE']);
export const tipoClienteEnum = pgEnum('tipo_cliente', ['MAYORISTA', 'MINORISTA']);
