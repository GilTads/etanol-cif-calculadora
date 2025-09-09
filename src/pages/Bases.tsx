import React, { useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { useBases } from '../contexts/BasesContext';
import { useNavigate } from 'react-router-dom';
import { Base } from '../types';
import { Spinner } from '../components/ui/spinner';
import { formatNumber, formatCurrency } from '../utils/formatNumber';

export default function Bases() {
  const { bases, deleteBase, loading } = useBases();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredBases = bases.filter(base =>
    base.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditBase = (base: Base) => {
    navigate(`/bases/edit/${base.id}`);
  };

  const handleDeleteBase = async (baseId: string) => {
    await deleteBase(baseId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Bases e Fretes" showBack />
        <div className="flex items-center justify-center pt-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Bases e Fretes" showBack />
      
      <div className="container mx-auto px-4 py-6 max-w-md content-container">
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
                    Frete: {formatCurrency(base.freight)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Distância: {base.distance} km
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditBase(base)}
                    className="bg-primary hover:bg-primary-light text-primary-foreground"
                    size="sm"
                  >
                    Editar Frete
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Base</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a base "{base.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteBase(base.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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