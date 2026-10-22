export const TALLAS_HUEVO = {
  P: { codigo: 'P', nombre: 'Pequeño', pesoMinG: 0, pesoMaxG: 47, ordenDisplay: 1 },
  CH: { codigo: 'CH', nombre: 'Chico', pesoMinG: 48, pesoMaxG: 52, ordenDisplay: 2 },
  M: { codigo: 'M', nombre: 'Mediano', pesoMinG: 53, pesoMaxG: 59, ordenDisplay: 3 },
  G: { codigo: 'G', nombre: 'Grande', pesoMinG: 60, pesoMaxG: 66, ordenDisplay: 4 },
  XG: { codigo: 'XG', nombre: 'Extra Grande', pesoMinG: 67, pesoMaxG: 72, ordenDisplay: 5 },
  XXG: { codigo: 'XXG', nombre: 'Doble Extra Grande', pesoMinG: 73, pesoMaxG: 999, ordenDisplay: 6 },
} as const;

export type CodigoTalla = keyof typeof TALLAS_HUEVO;
export const CODIGOS_TALLA = Object.keys(TALLAS_HUEVO) as CodigoTalla[];
