import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useBases } from '../contexts/BasesContext';
import { useNavigate } from 'react-router-dom';
import { Base } from '../types';

export default function Bases() {
  const { bases } = useBases();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredBases = bases.filter(base =>
    base.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditBase = (base: Base) => {
    navigate(`/bases/edit/${base.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Bases e Fretes" showBack />
      
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Add New Base Button */}
        <Button
          onClick={() => navigate('/bases/add')}
          className="w-full mb-6 bg-primary hover:bg-primary-light text-primary-foreground py-3"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Nova Base
        </Button>

        {/* Bases List */}
        <div className="space-y-4">
          {filteredBases.map((base) => (
            <div key={base.id} className="bg-card border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    {base.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Frete: R$ {base.freight.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Distância: {base.distance} km
                  </p>
                </div>
                <Button
                  onClick={() => handleEditBase(base)}
                  className="bg-primary hover:bg-primary-light text-primary-foreground"
                  size="sm"
                >
                  Editar Frete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredBases.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma base encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}