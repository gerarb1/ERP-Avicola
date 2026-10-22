import { create } from 'zustand';

export type ContextUnit = 'galpon-1' | 'galpon-2' | 'almacen' | 'todos';

interface ContextState {
  currentUnit: ContextUnit;
  unitLabel: string;
  loteActivo: string;
  avesVivas: number;
  setUnit: (unit: ContextUnit) => void;
}

export const useGlobalContextStore = create<ContextState>((set) => ({
  currentUnit: 'galpon-1',
  unitLabel: 'Galpón 01',
  loteActivo: 'Lote Hy-Line 34',
  avesVivas: 1485,
  setUnit: (unit) => {
    switch (unit) {
      case 'galpon-1':
        set({ currentUnit: unit, unitLabel: 'Galpón 01', loteActivo: 'Lote Hy-Line 34', avesVivas: 1485 });
        break;
      case 'galpon-2':
        set({ currentUnit: unit, unitLabel: 'Galpón 02', loteActivo: 'Lote Hy-Line 28', avesVivas: 2468 });
        break;
      case 'almacen':
        set({ currentUnit: unit, unitLabel: 'Almacén Central', loteActivo: 'Stock General Tallas', avesVivas: 0 });
        break;
      case 'todos':
        set({ currentUnit: unit, unitLabel: 'Granja Completa', loteActivo: 'Consolidado (2 Galpones)', avesVivas: 3953 });
        break;
    }
  },
}));
