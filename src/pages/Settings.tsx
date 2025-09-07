import React from 'react';
import { Header } from '../components/Header';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { useBases } from '../contexts/BasesContext';

export default function Settings() {
  const { showFreightPerKm, setShowFreightPerKm } = useBases();

  return (
    <div className="min-h-screen bg-background">
      <Header title="Configurações" showBack />
      
      <div className="container mx-auto px-4 py-6 max-w-md content-container">
        {/* Freight per km setting */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">
              Mostrar valor do frete por km
            </Label>
            <Switch
              checked={showFreightPerKm}
              onCheckedChange={setShowFreightPerKm}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Controla se o valor do frete por km será exibido na interface e nos relatórios compartilhados.
          </p>
        </div>

        {/* About Section */}
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-medium mb-2">Sobre</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong>Cálculo de Preços CIF para Etanol</strong></p>
            <p>Energética Santa Helena</p>
            <p>Versão 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}