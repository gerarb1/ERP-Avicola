/** Fuente: guía adjunta Hy-Line Brown, diciembre 2025, pp. 4–6.
 * Rangos de referencia; no constituyen una prescripción ni garantías de rendimiento.
 * No extrapolar fuera de las semanas 1–100. Agua en ml/ave/día, alimento en g/ave/día.
 */
export interface ReferenciaHyLine { semana: number; posturaMin: number | null; posturaMax: number | null; aguaMin: number; aguaMax: number; alimentoMin: number; alimentoMax: number }
export const HYLINE: ReferenciaHyLine[] = [
  {"semana":1,"posturaMin":null,"posturaMax":null,"aguaMin":24.0,"aguaMax":33.0,"alimentoMin":16.0,"alimentoMax":17.0},
  {"semana":2,"posturaMin":null,"posturaMax":null,"aguaMin":27.0,"aguaMax":37.0,"alimentoMin":18.0,"alimentoMax":19.0},
  {"semana":3,"posturaMin":null,"posturaMax":null,"aguaMin":31.0,"aguaMax":45.0,"alimentoMin":21.0,"alimentoMax":23.0},
  {"semana":4,"posturaMin":null,"posturaMax":null,"aguaMin":38.0,"aguaMax":55.0,"alimentoMin":26.0,"alimentoMax":28.0},
  {"semana":5,"posturaMin":null,"posturaMax":null,"aguaMin":47.0,"aguaMax":67.0,"alimentoMin":31.0,"alimentoMax":33.0},
  {"semana":6,"posturaMin":null,"posturaMax":null,"aguaMin":56.0,"aguaMax":81.0,"alimentoMin":37.0,"alimentoMax":40.0},
  {"semana":7,"posturaMin":null,"posturaMax":null,"aguaMin":65.0,"aguaMax":92.0,"alimentoMin":43.0,"alimentoMax":46.0},
  {"semana":8,"posturaMin":null,"posturaMax":null,"aguaMin":72.0,"aguaMax":104.0,"alimentoMin":48.0,"alimentoMax":52.0},
  {"semana":9,"posturaMin":null,"posturaMax":null,"aguaMin":80.0,"aguaMax":114.0,"alimentoMin":53.0,"alimentoMax":57.0},
  {"semana":10,"posturaMin":null,"posturaMax":null,"aguaMin":86.0,"aguaMax":122.0,"alimentoMin":57.0,"alimentoMax":61.0},
  {"semana":11,"posturaMin":null,"posturaMax":null,"aguaMin":91.0,"aguaMax":130.0,"alimentoMin":61.0,"alimentoMax":65.0},
  {"semana":12,"posturaMin":null,"posturaMax":null,"aguaMin":94.0,"aguaMax":136.0,"alimentoMin":63.0,"alimentoMax":68.0},
  {"semana":13,"posturaMin":null,"posturaMax":null,"aguaMin":99.0,"aguaMax":140.0,"alimentoMin":66.0,"alimentoMax":70.0},
  {"semana":14,"posturaMin":null,"posturaMax":null,"aguaMin":102.0,"aguaMax":145.0,"alimentoMin":68.0,"alimentoMax":73.0},
  {"semana":15,"posturaMin":null,"posturaMax":null,"aguaMin":105.0,"aguaMax":149.0,"alimentoMin":70.0,"alimentoMax":75.0},
  {"semana":16,"posturaMin":null,"posturaMax":null,"aguaMin":109.0,"aguaMax":155.0,"alimentoMin":73.0,"alimentoMax":78.0},
  {"semana":17,"posturaMin":null,"posturaMax":null,"aguaMin":115.0,"aguaMax":163.0,"alimentoMin":77.0,"alimentoMax":82.0},
  {"semana":18,"posturaMin":6.7,"posturaMax":7.0,"aguaMin":121.0,"aguaMax":173.0,"alimentoMin":81.0,"alimentoMax":86.0},
  {"semana":19,"posturaMin":24.0,"posturaMax":25.2,"aguaMin":130.0,"aguaMax":185.0,"alimentoMin":86.0,"alimentoMax":92.0},
  {"semana":20,"posturaMin":52.5,"posturaMax":55.0,"aguaMin":137.0,"aguaMax":197.0,"alimentoMin":91.0,"alimentoMax":98.0},
  {"semana":21,"posturaMin":75.9,"posturaMax":79.6,"aguaMin":144.0,"aguaMax":206.0,"alimentoMin":96.0,"alimentoMax":103.0},
  {"semana":22,"posturaMin":87.0,"posturaMax":91.2,"aguaMin":152.0,"aguaMax":216.0,"alimentoMin":101.0,"alimentoMax":108.0},
  {"semana":23,"posturaMin":90.9,"posturaMax":95.1,"aguaMin":156.0,"aguaMax":224.0,"alimentoMin":104.0,"alimentoMax":112.0},
  {"semana":24,"posturaMin":92.4,"posturaMax":97.0,"aguaMin":161.0,"aguaMax":228.0,"alimentoMin":107.0,"alimentoMax":114.0},
  {"semana":25,"posturaMin":93.4,"posturaMax":98.1,"aguaMin":162.0,"aguaMax":232.0,"alimentoMin":108.0,"alimentoMax":116.0},
  {"semana":26,"posturaMin":93.6,"posturaMax":98.5,"aguaMin":164.0,"aguaMax":234.0,"alimentoMin":109.0,"alimentoMax":117.0},
  {"semana":27,"posturaMin":93.6,"posturaMax":98.4,"aguaMin":164.0,"aguaMax":235.0,"alimentoMin":110.0,"alimentoMax":117.0},
  {"semana":28,"posturaMin":93.5,"posturaMax":98.4,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":29,"posturaMin":93.4,"posturaMax":98.3,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":30,"posturaMin":93.3,"posturaMax":98.2,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":31,"posturaMin":93.2,"posturaMax":98.1,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":32,"posturaMin":93.1,"posturaMax":98.1,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":33,"posturaMin":92.9,"posturaMax":98.0,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":34,"posturaMin":92.8,"posturaMax":97.9,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":35,"posturaMin":92.7,"posturaMax":97.8,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":36,"posturaMin":92.5,"posturaMax":97.7,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":37,"posturaMin":92.4,"posturaMax":97.6,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":38,"posturaMin":92.3,"posturaMax":97.5,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":39,"posturaMin":92.1,"posturaMax":97.3,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":40,"posturaMin":91.9,"posturaMax":97.2,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":41,"posturaMin":91.8,"posturaMax":97.1,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":42,"posturaMin":91.6,"posturaMax":96.9,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":43,"posturaMin":91.4,"posturaMax":96.8,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":44,"posturaMin":91.2,"posturaMax":96.6,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":45,"posturaMin":91.1,"posturaMax":96.5,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":46,"posturaMin":90.9,"posturaMax":96.3,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":47,"posturaMin":90.7,"posturaMax":96.1,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":48,"posturaMin":90.5,"posturaMax":96.0,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":49,"posturaMin":90.2,"posturaMax":95.8,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":50,"posturaMin":90.0,"posturaMax":95.6,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":51,"posturaMin":89.8,"posturaMax":95.4,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":52,"posturaMin":89.5,"posturaMax":95.2,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":53,"posturaMin":89.3,"posturaMax":94.9,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":54,"posturaMin":89.1,"posturaMax":94.7,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":55,"posturaMin":88.8,"posturaMax":94.5,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":56,"posturaMin":88.5,"posturaMax":94.2,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":57,"posturaMin":88.3,"posturaMax":94.0,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":58,"posturaMin":88.0,"posturaMax":93.7,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":59,"posturaMin":87.7,"posturaMax":93.5,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":60,"posturaMin":87.4,"posturaMax":93.2,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":61,"posturaMin":87.1,"posturaMax":92.9,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":62,"posturaMin":86.4,"posturaMax":92.4,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":63,"posturaMin":86.1,"posturaMax":92.1,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":64,"posturaMin":85.7,"posturaMax":91.8,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":65,"posturaMin":85.4,"posturaMax":91.5,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":66,"posturaMin":85.1,"posturaMax":91.2,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":67,"posturaMin":84.7,"posturaMax":90.8,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":68,"posturaMin":84.4,"posturaMax":90.5,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":69,"posturaMin":84.0,"posturaMax":90.2,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":70,"posturaMin":83.6,"posturaMax":89.8,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":71,"posturaMin":83.3,"posturaMax":89.5,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":72,"posturaMin":82.9,"posturaMax":89.1,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":73,"posturaMin":82.5,"posturaMax":88.8,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":74,"posturaMin":82.1,"posturaMax":88.4,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":75,"posturaMin":81.7,"posturaMax":88.1,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":76,"posturaMin":81.3,"posturaMax":87.7,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":77,"posturaMin":80.9,"posturaMax":87.3,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":78,"posturaMin":80.5,"posturaMax":86.9,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":79,"posturaMin":80.1,"posturaMax":86.5,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":80,"posturaMin":79.7,"posturaMax":86.1,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":81,"posturaMin":79.3,"posturaMax":85.7,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":82,"posturaMin":78.9,"posturaMax":85.3,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":83,"posturaMin":78.5,"posturaMax":84.9,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":84,"posturaMin":78.0,"posturaMax":84.5,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":85,"posturaMin":77.6,"posturaMax":84.1,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":86,"posturaMin":77.2,"posturaMax":83.7,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":87,"posturaMin":76.7,"posturaMax":83.3,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":88,"posturaMin":76.3,"posturaMax":82.8,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":89,"posturaMin":75.9,"posturaMax":82.4,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":90,"posturaMin":75.4,"posturaMax":82.0,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":91,"posturaMin":75.0,"posturaMax":81.6,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":92,"posturaMin":74.5,"posturaMax":81.1,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":93,"posturaMin":74.1,"posturaMax":80.7,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":94,"posturaMin":73.6,"posturaMax":80.2,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":95,"posturaMin":73.1,"posturaMax":79.8,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":96,"posturaMin":72.7,"posturaMax":79.4,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":97,"posturaMin":72.2,"posturaMax":78.9,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":98,"posturaMin":71.8,"posturaMax":78.5,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":99,"posturaMin":71.3,"posturaMax":78.0,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0},
  {"semana":100,"posturaMin":70.8,"posturaMax":77.6,"aguaMin":165.0,"aguaMax":236.0,"alimentoMin":110.0,"alimentoMax":118.0}
];
export function edadSemanas(fechaIngreso: string, edadIngreso: number, fecha: string, fechaNacimiento?: string | null): number {
  if (fechaNacimiento) return Math.floor((Date.parse(fecha + 'T12:00:00Z') - Date.parse(fechaNacimiento + 'T12:00:00Z')) / 604800000);
  return edadIngreso + Math.floor((Date.parse(fecha + 'T12:00:00Z') - Date.parse(fechaIngreso + 'T12:00:00Z')) / 604800000);
}
export function referenciaHyLine(semana: number) { return HYLINE.find(r => r.semana === Math.floor(semana)) ?? null; }
export function fechaBolivia(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function semanaAnteriorCompleta(fecha: string) {
  const fin = new Date(fecha + 'T12:00:00Z');
  const dia = (fin.getUTCDay() + 6) % 7;
  fin.setUTCDate(fin.getUTCDate() - dia - 1);
  const inicio = new Date(fin); inicio.setUTCDate(inicio.getUTCDate() - 6);
  return { desde: inicio.toISOString().slice(0,10), hasta: fin.toISOString().slice(0,10) };
}
export function centavos(monto: string | number) { return Math.round(Number(monto) * 100); }
export function moneda(monto: string | number) {
  return 'Bs ' + new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(monto));
}
