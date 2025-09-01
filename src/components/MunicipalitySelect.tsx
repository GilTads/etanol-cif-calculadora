import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, MapPin, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface Municipality {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

interface MunicipalitySelectProps {
  value: string;
  onSelect: (municipality: Municipality) => void;
  onInputChange: (value: string) => void;
  apiKey?: string;
  onApiKeyChange?: (key: string) => void;
}

export function MunicipalitySelect({ 
  value, 
  onSelect, 
  onInputChange, 
  apiKey, 
  onApiKeyChange 
}: MunicipalitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchMunicipalities = async (query: string) => {
    if (!apiKey || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&components=country:br&key=${apiKey}&language=pt-BR`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const data = await response.json();
      
      if (data.predictions) {
        const municipalities: Municipality[] = await Promise.all(
          data.predictions.slice(0, 6).map(async (prediction: any) => {
            // Get place details to get coordinates
            const detailsResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=geometry,name,address_components&key=${apiKey}&language=pt-BR`
            );
            
            const detailsData = await detailsResponse.json();
            const result = detailsData.result;
            
            // Extract state from address components
            const stateComponent = result.address_components?.find((comp: any) => 
              comp.types.includes('administrative_area_level_1')
            );
            
            return {
              name: result.name,
              state: stateComponent?.short_name || '',
              latitude: result.geometry.location.lat,
              longitude: result.geometry.location.lng,
              placeId: prediction.place_id
            };
          })
        );
        
        setSuggestions(municipalities);
      }
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onInputChange(newValue);
    
    // Clear timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce search
    timeoutRef.current = setTimeout(() => {
      if (newValue.trim()) {
        searchMunicipalities(newValue.trim());
        setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);
  };

  const handleSelect = (municipality: Municipality) => {
    onSelect(municipality);
    onInputChange(municipality.name);
    setIsOpen(false);
    setSuggestions([]);
  };

  if (showApiKeyInput && onApiKeyChange) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para buscar municípios brasileiros, você precisa de uma chave da API do Google Maps.{' '}
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Obtenha sua chave aqui
            </a>
            {' '}e habilite a API Places.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Label htmlFor="apiKey">Chave da API Google Maps</Label>
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type="password"
              placeholder="Insira sua chave da API"
              value={apiKey || ''}
              onChange={(e) => onApiKeyChange(e.target.value)}
            />
            <Button
              type="button"
              onClick={() => setShowApiKeyInput(false)}
              disabled={!apiKey}
            >
              Usar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder="Digite o nome do município..."
          onFocus={() => value && setIsOpen(true)}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {onApiKeyChange && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowApiKeyInput(true)}
          className="mt-2 text-xs"
        >
          <MapPin className="h-3 w-3 mr-1" />
          Alterar chave da API
        </Button>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((municipality, index) => (
            <button
              key={`${municipality.placeId}-${index}`}
              type="button"
              onClick={() => handleSelect(municipality)}
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors border-0 bg-transparent"
            >
              <div className="font-medium">{municipality.name}</div>
              {municipality.state && (
                <div className="text-sm text-muted-foreground">{municipality.state}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}