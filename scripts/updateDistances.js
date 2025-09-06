// Script para atualizar as distâncias reais das bases
// Coordenadas da Energética Santa Helena - Nova Andradina/MS
const PLANT_COORDINATES = {
  lat: -22.2263333,
  lng: -53.3390000
};

// Bases com coordenadas corretas
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

// Função para calcular distância Haversine com fator de correção
function calculateDistance(destLat, destLng) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Raio da Terra em km
  
  const dLat = toRad(destLat - PLANT_COORDINATES.lat);
  const dLon = toRad(destLng - PLANT_COORDINATES.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(PLANT_COORDINATES.lat)) * Math.cos(toRad(destLat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Aplicar fator de correção para distância rodoviária (30% maior que linha reta)
  return Math.round(distance * 1.3);
}

// Calcular e exibir as distâncias
console.log('Distâncias calculadas da Energética Santa Helena:');
console.log('=====================================');

const updatedBases = bases.map(base => {
  const distance = calculateDistance(base.latitude, base.longitude);
  console.log(`${base.name}: ${distance} km`);
  return { ...base, distance };
});

// Gerar código TypeScript atualizado
console.log('\n\nCódigo TypeScript atualizado:');
console.log('============================');
console.log('export const initialBases: Base[] = [');
updatedBases.forEach(base => {
  console.log(`  { id: '${base.id}', name: '${base.name}', freight: ${base.freight.toFixed(2)}, distance: ${base.distance}, latitude: ${base.latitude}, longitude: ${base.longitude} },`);
});
console.log('];');