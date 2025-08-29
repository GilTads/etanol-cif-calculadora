// A minimal municipalities dictionary for the app's supported bases
// Provides a simple lookup by city name (normalized) to latitude/longitude

export interface Municipality {
  name: string;
  latitude: number;
  longitude: number;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const data: Record<string, Municipality> = {};

const add = (name: string, latitude: number, longitude: number, aliases: string[] = []) => {
  const entry: Municipality = { name, latitude, longitude };
  data[normalize(name)] = entry;
  aliases.forEach(a => {
    data[normalize(a)] = entry;
  });
};

// Seed the known municipalities
add('Araçatuba', -21.2076, -50.4401);
add('Araucária', -25.5850, -49.4044);
add('Bauru', -22.3145, -49.0587);
add('Betim', -19.9679, -44.1980);
add('Brasília', -15.7939, -47.8828, ['Brasilia']);
add('Chapecó', -27.1009, -52.6150, ['Chapeco']);
add('Duque de Caxias', -22.7853, -43.3049, ['Duque Caxias']);
add('Esteio', -29.8521, -51.1849, ['Esteio RS']);
add('Goiânia', -16.6869, -49.2648, ['Goiania']);
add('Guarapuava', -25.3902, -51.4627);
add('Guarulhos', -23.4543, -46.5337);
add('Itajaí', -26.9101, -48.6705, ['Itajaí SC', 'Itajai SC', 'Itajai']);
add('Jaraguá do Sul', -26.4851, -49.0713, ['Jaragua do Sul']);
add('Londrina', -23.3045, -51.1696);
add('Maringá', -23.4205, -51.9330, ['Maringa']);
add('Ourinhos', -22.9795, -49.8707);
add('Presidente Prudente', -22.1212, -51.3925, ['P. Prudente', 'P Prudente', 'Pres Prudente']);
add('Paranaguá', -25.5205, -48.5091, ['Paranagua']);
add('Passo Fundo', -28.2576, -52.4061);
add('Paulínia', -22.7543, -47.1488, ['Paulinia']);
add('São José dos Campos', -23.2237, -45.9009, ['São Jose dos Campos', 'Sao Jose dos Campos']);
add('Sarandi', -23.4435, -51.8767); // PR
add('Uberlândia', -18.9113, -48.2622, ['Uberlandia']);

export function findMunicipalityByName(name: string): Municipality | null {
  const key = normalize(name);
  return data[key] || null;
}
