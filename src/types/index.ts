export interface Base {
  id: string;
  name: string;
  freight: number;
  distance: number;
  latitude?: number;
  longitude?: number;
}

export interface CIFCalculation {
  base: Base;
  fobPrice: number;
  cifPrice: number;
  freightPerKm: number;
}