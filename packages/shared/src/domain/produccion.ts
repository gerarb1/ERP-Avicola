/** Calcula el porcentaje de postura diaria */
export function calcularPorcentajePostura(huevosRecolectados: number, avesVivas: number): number {
  if (avesVivas <= 0) return 0;
  return Number(((huevosRecolectados / avesVivas) * 100).toFixed(2));
}

/** Calcula el FCR (Feed Conversion Ratio) */
export function calcularFCR(kgAlimento: number, maplesProducidos: number): number {
  if (maplesProducidos <= 0) return 0;
  return Number((kgAlimento / maplesProducidos).toFixed(4));
}

/** Calcula costo proporcional de alimento por talla */
export function calcularCostoAlimentoPorTalla(
  costoTotalAlimento: number,
  unidadesTalla: number,
  totalUnidadesProducidas: number
): number {
  if (totalUnidadesProducidas <= 0) return 0;
  return Number(((costoTotalAlimento * unidadesTalla) / totalUnidadesProducidas).toFixed(2));
}

/** Calcula margen estimado por talla */
export function calcularMargenTalla(ingresoVentas: number, costoAlimentoProporcional: number): number {
  return Number((ingresoVentas - costoAlimentoProporcional).toFixed(2));
}
