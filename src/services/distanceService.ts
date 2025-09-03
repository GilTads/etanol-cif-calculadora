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
    // Usando OpenRouteService como alternativa gratuita ao Google Maps
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248e8b1b3e8d8f64e4b91fb82b8a5c3b407&start=${PLANT_COORDINATES.lng},${PLANT_COORDINATES.lat}&end=${destinationLng},${destinationLat}`
    );

    if (!response.ok) {
      throw new Error('Erro ao consultar serviço de rotas');
    }

    const data = await response.json();
    
    if (data.features && data.features[0] && data.features[0].properties) {
      // Distância em metros, converter para quilômetros
      const distanceInKm = Math.round(data.features[0].properties.segments[0].distance / 1000);
      return distanceInKm;
    }

    throw new Error('Rota não encontrada');
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