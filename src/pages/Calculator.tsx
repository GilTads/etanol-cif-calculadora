import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useBases } from '../contexts/BasesContext';
import { useToast } from '../hooks/use-toast';
import { formatNumber, formatCurrency } from '../utils/formatNumber';

export default function Calculator() {
  const { bases, showFreightPerKm } = useBases();
  const { toast } = useToast();
  const [fobPrice, setFobPrice] = useState('');
  const [selectedBaseId, setSelectedBaseId] = useState('');
  const [result, setResult] = useState<{
    base: string;
    fobPrice: number;
    freight: number;
    distance: number;
    freightPerKm: number;
    cifPrice: number;
  } | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const selectedBase = bases.find(base => base.id === selectedBaseId);

  const calculateCIF = () => {
    if (!fobPrice || !selectedBase) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    const fob = parseFloat(fobPrice);
    const cifPrice = fob + selectedBase.freight;
    const freightPerKm = selectedBase.freight / selectedBase.distance;

    setResult({
      base: selectedBase.name,
      fobPrice: fob,
      freight: selectedBase.freight,
      distance: selectedBase.distance,
      freightPerKm,
      cifPrice
    });
  };

const shareViaWhatsApp = () => {
  if (!result) return;

  const message = `Cálculo de Preço CIF
Energética Santa Helena

Base: ${result.base}
Preço FOB: ${formatCurrency(result.fobPrice)}
Frete: ${formatCurrency(result.freight)}
Distância: ${formatNumber(result.distance)} km
${showFreightPerKm ? `Valor do frete por km: ${formatCurrency(result.freightPerKm)}` : ''}
Preço CIF: ${formatCurrency(result.cifPrice)}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
  setShowShareDialog(false);
};


  return (
    <div className="min-h-screen bg-background">
      <Header title="Calcular Preço CIF" showBack />
      
      <div className="container mx-auto px-4 py-6 max-w-md content-container">
        <form onSubmit={(e) => { e.preventDefault(); calculateCIF(); }} className="space-y-6">
          {/* Preço FOB */}
          <div className="space-y-2">
            <Label htmlFor="fob" className="text-sm font-medium">
              Preço FOB
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="fob"
                type="number"
                step="0.01"
                value={fobPrice}
                onChange={(e) => setFobPrice(e.target.value)}
                placeholder="500,00"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Base */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Base</Label>
            <Select value={selectedBaseId} onValueChange={setSelectedBaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {bases.map((base) => (
                  <SelectItem key={base.id} value={base.id}>
                    {base.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Base Info */}
          {selectedBase && (
            <div className="bg-muted/30 p-3 rounded-lg space-y-1">
              <p className="text-sm">
                Frete: {formatCurrency(selectedBase.freight)} por km
              </p>
              <p className="text-sm">
                Distância da base: {formatNumber(selectedBase.distance)} km
              </p>
            </div>
          )}

          {/* Calculate Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary-light text-primary-foreground py-6 text-lg font-medium"
          >
            Calcular
          </Button>

          {/* Result */}
          {result && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preço CIF:</Label>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(result.cifPrice)}
                </div>
              </div>

              <Button
                onClick={() => setShowShareDialog(true)}
                className="w-full bg-primary hover:bg-primary-light text-primary-foreground py-3"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Compartilhar via WhatsApp
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Compartilhar via WhatsApp</DialogTitle>
          </DialogHeader>
          
          {result && (
            <div className="space-y-4">
              <div className="bg-accent/20 p-4 rounded-lg space-y-2 text-sm">
                <div><strong>Cálculo de Preço CIF</strong></div>
                <div><strong>Energética Santa Helena</strong></div>
                <div>Base: {result.base}</div>
                <div>Preço FOB: {formatCurrency(result.fobPrice)}</div>
                <div>Frete: {formatCurrency(result.freight)}</div>
                <div>Distância: {formatNumber(result.distance)} km</div>
                {showFreightPerKm && (
                  <div>Valor do frete por km: {formatCurrency(result.freightPerKm)}</div>
                )}
                <div><strong>Preço CIF: {formatCurrency(result.cifPrice)}</strong></div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={shareViaWhatsApp}
                  className="flex-1 bg-primary hover:bg-primary-light text-primary-foreground"
                >
                  Enviar via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowShareDialog(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}