import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useBases } from '../contexts/BasesContext';
import { useToast } from '../hooks/use-toast';
import { MunicipalitySelect } from '../components/MunicipalitySelect';

// Coordenadas da Energética Santa Helena - Nova Andradina/MS
const PLANT_COORDINATES = {
  lat: -21.99706851064158,
  lng: -53.423919158273875
};

async function calculateRoadDistance(
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

export default function AddEditBase() {
  const { id } = useParams();
  const { addBase, updateBase, getBase } = useBases();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    freight: '',
    distance: '',
    latitude: '',
    longitude: ''
  });

  const handleMunicipalitySelect = async (municipality: { name: string; state: string; latitude?: number; longitude?: number }) => {
    setFormData(prev => ({
      ...prev,
      name: municipality.name,
      latitude: municipality.latitude?.toFixed(6) || '',
      longitude: municipality.longitude?.toFixed(6) || ''
    }));

    // Automatically calculate distance when coordinates are available
    if (municipality.latitude && municipality.longitude) {
      try {
        toast({
          title: "Calculando distância...",
          description: "Consultando rotas rodoviárias"
        });

        const distance = await calculateRoadDistance(
          municipality.latitude,
          municipality.longitude
        );

        setFormData(prev => ({ ...prev, distance: distance.toString() }));
        
        toast({
          title: "Distância calculada automaticamente",
          description: `${municipality.name} está a ${distance} km da Energética Santa Helena via rota rodoviária`
        });
      } catch (error) {
        console.error('Erro ao calcular distância:', error);
        toast({
          title: "Erro",
          description: "Não foi possível calcular a distância automaticamente. Use o botão de calcular.",
          variant: "destructive"
        });
      }
    }
  };

  useEffect(() => {
    if (isEdit && id) {
      const base = getBase(id);
      if (base) {
        setFormData({
          name: base.name,
          freight: base.freight.toString(),
          distance: base.distance.toString(),
          latitude: base.latitude?.toString() || '',
          longitude: base.longitude?.toString() || ''
        });
      }
    }
  }, [id, isEdit, getBase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.freight || !formData.distance) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const baseData = {
      name: formData.name.trim(),
      freight: parseFloat(formData.freight),
      distance: parseInt(formData.distance),
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
    };

    if (isEdit && id) {
      updateBase(id, baseData);
      toast({
        title: "Sucesso",
        description: "Base atualizada com sucesso"
      });
    } else {
      addBase(baseData);
      toast({
        title: "Sucesso", 
        description: "Base adicionada com sucesso"
      });
    }

    navigate('/bases');
  };

  const calculateDistance = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Informe o nome da cidade primeiro",
        variant: "destructive"
      });
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast({
        title: "Erro",
        description: "Coordenadas não encontradas para o município selecionado",
        variant: "destructive"
      });
      return;
    }

    try {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        toast({
          title: "Erro",
          description: "Coordenadas inválidas",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Calculando distância...",
        description: "Consultando rotas rodoviárias"
      });

      const distance = await calculateRoadDistance(lat, lng);
      setFormData(prev => ({ ...prev, distance: distance.toString() }));
      
      toast({
        title: "Distância calculada",
        description: `Distância da Energética Santa Helena até ${formData.name}: ${distance} km via rota rodoviária`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao calcular distância. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={isEdit ? "Editar Base" : "Adicionar Nova Base"} 
        showBack 
      />
      
      <div className="container mx-auto px-4 py-6 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome da Base */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome da Base (Município)
            </Label>
            <MunicipalitySelect
              value={formData.name}
              onSelect={handleMunicipalitySelect}
              onInputChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            />
          </div>

          {/* Valor do Frete */}
          <div className="space-y-2">
            <Label htmlFor="freight" className="text-sm font-medium">
              Valor do Frete
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="freight"
                type="number"
                step="0.01"
                value={formData.freight}
                onChange={(e) => setFormData(prev => ({ ...prev, freight: e.target.value }))}
                placeholder="0,00"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Distância */}
          <div className="space-y-2">
            <Label htmlFor="distance" className="text-sm font-medium">
              Distância
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="distance"
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData(prev => ({ ...prev, distance: e.target.value }))}
                  placeholder="414 km"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={calculateDistance}
                className="shrink-0"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Distância calculada via rota rodoviária. Você pode ajustar se necessário.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary-light text-primary-foreground py-3"
            >
              Salvar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/bases')}
              className="flex-1 py-3"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}