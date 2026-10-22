export const ROLES = {
  ADMINISTRADOR: 'administrador',
  ENCARGADO_GALPON: 'encargado_galpon',
  ENCARGADO_ALMACEN: 'encargado_almacen',
} as const;

export type RolUsuario = typeof ROLES[keyof typeof ROLES];
