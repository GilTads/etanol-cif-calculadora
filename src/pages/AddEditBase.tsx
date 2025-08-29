import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useBases } from '../contexts/BasesContext';
import { useToast } from '../hooks/use-toast';
import { findMunicipalityByName } from '../data/municipalities';

export default function AddEditBase() {
  const { id } = useParams();
  const { addBase, updateBase, deleteBase, getBase } = useBases();
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

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  // Auto-suggest municipalities and auto-link latitude/longitude
  useEffect(() => {
    const name = formData.name.trim();
    if (name.length >= 2) {
      // Get all municipality names from our database
      import('../data/municipalities').then(({ municipalityNames }) => {
        const filtered = municipalityNames
          .filter(municipality => 
            municipality.toLowerCase().includes(name.toLowerCase())
          )
          .slice(0, 10);
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      });

      // Auto-populate coordinates when exact match is found
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
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
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

  const handleDelete = () => {
    if (isEdit && id) {
      deleteBase(id);
      toast({
        title: "Sucesso",
        description: "Base excluída com sucesso"
      });
      navigate('/bases');
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setFormData(prev => ({ ...prev, name: suggestion }));
    setShowSuggestions(false);
    
    // Auto-populate coordinates
    const match = findMunicipalityByName(suggestion);
    if (match) {
      setFormData(prev => ({
        ...prev,
        name: suggestion,
        latitude: match.latitude.toFixed(6),
        longitude: match.longitude.toFixed(6),
      }));
    }
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
            <div className="relative">
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Digite o nome do município..."
                required
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
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