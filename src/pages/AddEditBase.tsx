import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useBases } from '../contexts/BasesContext';
import { useToast } from '../hooks/use-toast';
import { findMunicipalityByName } from '../data/municipalities';

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

  // Auto-link latitude/longitude from municipality name as the user types
  useEffect(() => {
    const name = formData.name.trim();
    if (!name) return;

    const handle = setTimeout(() => {
      const match = findMunicipalityByName(name);
      if (match) {
        setFormData((prev) => ({
          ...prev,
          latitude: match.latitude.toFixed(6),
          longitude: match.longitude.toFixed(6),
        }));
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [formData.name]);

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

    const PLANT_COORDS = { lat: -21.997204, lng: -53.425025 }; // Energética Santa Helena - Nova Andradina - MS

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    try {
      let lat = formData.latitude ? parseFloat(formData.latitude) : undefined;
      let lng = formData.longitude ? parseFloat(formData.longitude) : undefined;

      if ((!lat || !lng) && formData.name.trim()) {
        const match = findMunicipalityByName(formData.name.trim());
        if (match) {
          lat = match.latitude;
          lng = match.longitude;
          setFormData(prev => ({
            ...prev,
            latitude: match.latitude.toFixed(6),
            longitude: match.longitude.toFixed(6)
          }));
        }
      }

      if (lat === undefined || lng === undefined) {
        toast({
          title: "Coordenadas não encontradas",
          description: "Informe latitude e longitude ou corrija o nome do município.",
          variant: "destructive"
        });
        return;
      }

      const distance = Math.round(haversineKm(PLANT_COORDS.lat, PLANT_COORDS.lng, lat, lng));
      setFormData(prev => ({ ...prev, distance: distance.toString() }));
      
      toast({
        title: "Distância calculada",
        description: `Distância de Nova Andradina até ${formData.name}: ${distance} km`
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
              Nome da Base
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ribeirão Preto"
              required
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
                  placeholder="382 km"
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
              Distância calculada automaticamente. Você pode ajustar se necessário.
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