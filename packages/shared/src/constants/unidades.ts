export const UNIDADES = {
  HUEVOS_POR_MAPLE: 30,
  MAPLES_POR_CAJA: 12,
  HUEVOS_POR_CAJA: 360, // 30 * 12
} as const;

/** Convert maples + sueltos to total units */
export function calcularTotalUnidades(maples: number, sueltos: number = 0): number {
  return maples * UNIDADES.HUEVOS_POR_MAPLE + sueltos;
}

/** Convert total units to maples + sueltos */
export function unidadesAMaples(totalUnidades: number): { maples: number; sueltos: number } {
  const maples = Math.floor(totalUnidades / UNIDADES.HUEVOS_POR_MAPLE);
  const sueltos = totalUnidades % UNIDADES.HUEVOS_POR_MAPLE;
  return { maples, sueltos };
}

/** Convert maples to cajas + maples remainder */
export function maplesACajas(totalMaples: number): { cajas: number; maplesRestantes: number } {
  const cajas = Math.floor(totalMaples / UNIDADES.MAPLES_POR_CAJA);
  const maplesRestantes = totalMaples % UNIDADES.MAPLES_POR_CAJA;
  return { cajas, maplesRestantes };
}
