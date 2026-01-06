// src/components/respuestas/types.ts

export type RespuestaTipo = 'SI_CUMPLE' | 'CUMPLE_PARCIAL' | 'NO_CUMPLE' | 'NO_APLICA' | '';

export interface NivelMadurezInfo {
  value: number;
  label: string;
  descripcion: string;
  color: string;
}

export const NIVELES_MADUREZ: NivelMadurezInfo[] = [
  { value: 0, label: '0', descripcion: 'No Implementado', color: 'text-gray-500' },
  { value: 0.5, label: '0.5', descripcion: 'Inicio de Implementación', color: 'text-gray-500' },
  { value: 1.0, label: '1', descripcion: 'Inicial', color: 'text-red-600' },
  { value: 1.5, label: '1.5', descripcion: 'Inicial Avanzado', color: 'text-red-500' },
  { value: 2.0, label: '2', descripcion: 'Gestionado', color: 'text-orange-600' },
  { value: 2.5, label: '2.5', descripcion: 'Gestionado Avanzado', color: 'text-orange-500' },
  { value: 3.0, label: '3', descripcion: 'Definido', color: 'text-yellow-600' },
  { value: 3.5, label: '3.5', descripcion: 'Definido Avanzado', color: 'text-yellow-500' },
  { value: 4.0, label: '4', descripcion: 'Cuantitativamente Gestionado', color: 'text-blue-600' },
  { value: 4.5, label: '4.5', descripcion: 'Cuantitativamente Gestionado Avanzado', color: 'text-blue-500' },
  { value: 5.0, label: '5', descripcion: 'Optimizado', color: 'text-green-600' },
];

export const getNivelInfo = (valor: number): NivelMadurezInfo => {
  return NIVELES_MADUREZ.find(n => n.value === valor) || NIVELES_MADUREZ[0];
};