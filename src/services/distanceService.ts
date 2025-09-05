import { supabase } from '@/integrations/supabase/client';

// Coordenadas da Energética Santa Helena - Nova Andradina/MS
const PLANT_COORDINATES = {
  lat: -22.2263333,
  lng: -53.3390000
};

export async function calculateRoadDistance(
  destinationLat: number,
  destinationLng: number
): Promise<number> {
  try {
    // Usar a Edge Function que integra com Google Maps API
    const { data, error } = await supabase.functions.invoke('calculate-distance', {
      body: { destinationLat, destinationLng }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.error && data.fallback) {
      throw new Error('Google Maps API failed, using fallback');
    }

    return data.distance;
  } catch (error) {
    console.error('Erro ao calcular distância por rota:', error);
    
    // Fallback para cálculo Haversine com fator de correção se a API falhar
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Raio da Terra em km
    
    const dLat = toRad(destinationLat - PLANT_COORDINATES.lat);
    const dLon = toRad(destinationLng - PLANT_COORDINATES.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(PLANT_COORDINATES.lat)) * Math.cos(toRad(destinationLat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Aplicar um fator de correção para aproximar da distância rodoviária
    // Geralmente a distância rodoviária é 20-30% maior que a linha reta
    return Math.round(distance * 1.3);
  }
}