export * from '../schemas';
// Type interfaces matching DB will be exported from here
export interface Usuario {
  id: string;
  authId: string;
  nombre: string;
  email: string;
  rol: 'administrador' | 'encargado_galpon' | 'encargado_almacen';
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
