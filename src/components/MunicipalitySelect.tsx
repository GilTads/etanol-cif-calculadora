import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from './ui/input';

interface Municipality {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
        nome: string;
      };
    };
  };
}

interface MunicipalitySelectProps {
  value: string;
  onSelect: (municipality: { name: string; state: string; latitude?: number; longitude?: number }) => void;
  onInputChange: (value: string) => void;
}

export function MunicipalitySelect({ value, onSelect, onInputChange }: MunicipalitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(false);
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
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Using IBGE API - free Brazilian municipalities database
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const data: Municipality[] = await response.json();
      
      // Sort by relevance (exact matches first, then partial matches)
      const sortedData = data
        .filter(municipality => 
          municipality.nome.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => {
          const aExact = a.nome.toLowerCase().startsWith(query.toLowerCase());
          const bExact = b.nome.toLowerCase().startsWith(query.toLowerCase());
          
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          return a.nome.localeCompare(b.nome);
        })
        .slice(0, 8); // Limit to 8 results
        
      setSuggestions(sortedData);
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

  const handleSelect = async (municipality: Municipality) => {
    try {
      // Get coordinates using Nominatim (OpenStreetMap) - free geocoding service
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(municipality.nome + ', ' + municipality.microrregiao.mesorregiao.UF.sigla + ', Brasil')}&limit=1`
      );
      
      const geocodeData = await geocodeResponse.json();
      
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      if (geocodeData && geocodeData.length > 0) {
        latitude = parseFloat(geocodeData[0].lat);
        longitude = parseFloat(geocodeData[0].lon);
      }

      onSelect({
        name: municipality.nome,
        state: municipality.microrregiao.mesorregiao.UF.sigla,
        latitude,
        longitude
      });
    } catch (error) {
      console.error('Erro ao obter coordenadas:', error);
      // Still select the municipality even if geocoding fails
      onSelect({
        name: municipality.nome,
        state: municipality.microrregiao.mesorregiao.UF.sigla
      });
    }
    
    onInputChange(municipality.nome);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder="Digite o nome do município brasileiro..."
          onFocus={() => value && setIsOpen(true)}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((municipality) => (
            <button
              key={municipality.id}
              type="button"
              onClick={() => handleSelect(municipality)}
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors border-0 bg-transparent"
            >
              <div className="font-medium">{municipality.nome}</div>
              <div className="text-sm text-muted-foreground">
                {municipality.microrregiao.mesorregiao.UF.sigla} - {municipality.microrregiao.mesorregiao.UF.nome}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && !loading && suggestions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            Nenhum município encontrado
          </div>
        </div>
      )}
    </div>
  );
}