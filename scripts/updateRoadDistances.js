// Script para calcular distâncias rodoviárias reais usando OpenRouteService
// Coordenadas da Energética Santa Helena - Nova Andradina/MS
const PLANT_COORDINATES = {
  lat: -22.2263333,
  lng: -53.3390000
};

// Lista das bases com coordenadas
const bases = [
  { id: '1', name: 'Araçatuba', freight: 160.00, latitude: -21.2076, longitude: -50.4401 },
  { id: '2', name: 'Araucária', freight: 180.00, latitude: -25.5850, longitude: -49.4044 },
  { id: '3', name: 'Bauru', freight: 150.00, latitude: -22.3145, longitude: -49.0587 },
  { id: '4', name: 'Betim', freight: 450.00, latitude: -19.9679, longitude: -44.1980 },
  { id: '5', name: 'Brasília', freight: 370.00, latitude: -15.7939, longitude: -47.8828 },
  { id: '6', name: 'Chapecó', freight: 250.00, latitude: -27.1009, longitude: -52.6150 },
  { id: '7', name: 'Duque Caxias', freight: 330.00, latitude: -22.7853, longitude: -43.3049 },
  { id: '8', name: 'Esteio RS', freight: 330.00, latitude: -29.8521, longitude: -51.1849 },
  { id: '9', name: 'Goiania', freight: 300.00, latitude: -16.6869, longitude: -49.2648 },
  { id: '10', name: 'Guarapuava', freight: 170.00, latitude: -25.3902, longitude: -51.4627 },
  { id: '11', name: 'Guarulhos', freight: 200.00, latitude: -23.4543, longitude: -46.5337 },
  { id: '12', name: 'Itajaí SC', freight: 220.00, latitude: -26.9101, longitude: -48.6705 },
  { id: '13', name: 'Jaraguá do Sul', freight: 230.00, latitude: -26.4851, longitude: -49.0713 },
  { id: '14', name: 'Londrina', freight: 120.00, latitude: -23.3045, longitude: -51.1696 },
  { id: '15', name: 'Maringá', freight: 110.00, latitude: -23.4205, longitude: -51.9330 },
  { id: '16', name: 'Ourinhos', freight: 160.00, latitude: -22.9795, longitude: -49.8707 },
  { id: '17', name: 'P. Prudente', freight: 120.00, latitude: -22.1212, longitude: -51.3925 },
  { id: '18', name: 'Paranaguá', freight: 200.00, latitude: -25.5205, longitude: -48.5091 },
  { id: '19', name: 'Passo Fundo', freight: 330.00, latitude: -28.2576, longitude: -52.4061 },
  { id: '20', name: 'Paulínia', freight: 190.00, latitude: -22.7543, longitude: -47.1488 },
  { id: '21', name: 'São Jose dos Campos', freight: 230.00, latitude: -23.2237, longitude: -45.9009 },
  { id: '22', name: 'Sarandi', freight: 110.00, latitude: -23.4435, longitude: -51.8767 },
  { id: '23', name: 'Uberlândia', freight: 250.00, latitude: -18.9113, longitude: -48.2622 }
];

// Função para calcular distância rodoviária usando OpenRouteService
async function calculateRoadDistance(destinationLat, destinationLng) {
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248e8b1b3e8d8f64e4b91fb82b8a5c3b407&start=${PLANT_COORDINATES.lng},${PLANT_COORDINATES.lat}&end=${destinationLng},${destinationLat}`
    );

    if (!response.ok) {
      throw new Error(`Erro ao consultar API: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features[0] && data.features[0].properties) {
      // Distância em metros, converter para quilômetros
      const distanceInKm = Math.round(data.features[0].properties.segments[0].distance / 1000);
      return distanceInKm;
    }

    throw new Error('Rota não encontrada');
  } catch (error) {
    console.error(`Erro ao calcular distância: ${error.message}`);
    
    // Fallback para cálculo Haversine com fator de correção
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Raio da Terra em km
    
    const dLat = toRad(destinationLat - PLANT_COORDINATES.lat);
    const dLon = toRad(destinationLng - PLANT_COORDINATES.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(PLANT_COORDINATES.lat)) * Math.cos(toRad(destinationLat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Aplicar fator de correção para aproximar da distância rodoviária
    return Math.round(distance * 1.3);
  }
}

// Função para aguardar entre requisições
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função principal para calcular todas as distâncias
async function updateAllDistances() {
  console.log('Iniciando cálculo de distâncias rodoviárias...');
  
  const updatedBases = [];
  
  for (let i = 0; i < bases.length; i++) {
    const base = bases[i];
    console.log(`Calculando distância para ${base.name}...`);
    
    try {
      const distance = await calculateRoadDistance(base.latitude, base.longitude);
      updatedBases.push({
        ...base,
        distance
      });
      console.log(`${base.name}: ${distance} km`);
    } catch (error) {
      console.error(`Erro ao calcular distância para ${base.name}:`, error.message);
      updatedBases.push(base); // Manter distância original em caso de erro
    }
    
    // Aguardar 1 segundo entre requisições para não sobrecarregar a API
    if (i < bases.length - 1) {
      await sleep(1000);
    }
  }
  
  // Gerar o novo código para o arquivo bases.ts
  console.log('\n=== CÓDIGO ATUALIZADO PARA src/data/bases.ts ===\n');
  console.log("import { Base } from '../types';");
  console.log('');
  console.log('export const initialBases: Base[] = [');
  
  updatedBases.forEach(base => {
    console.log(`  { id: '${base.id}', name: '${base.name}', freight: ${base.freight.toFixed(2)}, distance: ${base.distance}, latitude: ${base.latitude}, longitude: ${base.longitude} },`);
  });
  
  console.log('];');
}

// Executar o script
updateAllDistances().catch(console.error);