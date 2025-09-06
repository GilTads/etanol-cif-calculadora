import React, { useState } from 'react';
import { MessageCircle, FileText } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useBases } from '../contexts/BasesContext';
import { useToast } from '../hooks/use-toast';
import jsPDF from 'jspdf';

export default function Report() {
  const { bases, showFreightPerKm } = useBases();
  const { toast } = useToast();
  const [fobPrice, setFobPrice] = useState('500.00');

  const updateFobPrice = () => {
    toast({
      title: "Preço FOB atualizado",
      description: `Novo preço: R$ ${fobPrice}`
    });
  };

  const calculateCIF = (base: any) => {
    const fob = parseFloat(fobPrice);
    return fob + base.freight;
  };

  const shareViaWhatsApp = () => {
    const fob = parseFloat(fobPrice);
    let message = `Relatório Comparativo - Energética Santa Helena\n\nPreço FOB: R$ ${fob.toFixed(2)}\n\n`;
    
    bases.forEach(base => {
      const cifPrice = calculateCIF(base);
      const freightPerKm = base.freight / base.distance;
      
      message += `${base.name}\n`;
      message += `Distância: ${base.distance} km\n`;
      message += `Frete: R$ ${base.freight.toFixed(2)}\n`;
      if (showFreightPerKm) {
        message += `Frete/km: R$ ${freightPerKm.toFixed(2)}\n`;
      }
      message += `CIF: R$ ${cifPrice.toFixed(2)}\n\n`;
    });

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const fob = parseFloat(fobPrice);
    
    // Header
    doc.setFontSize(16);
    doc.text('Relatório Comparativo', 20, 30);
    doc.text('Energética Santa Helena', 20, 40);
    
    doc.setFontSize(12);
    doc.text(`Preço FOB: R$ ${fob.toFixed(2)}`, 20, 55);
    
    // Table header
    doc.setFontSize(10);
    doc.text('Base', 20, 75);
    doc.text('Distância (km)', 60, 75);
    doc.text('Frete (R$)', 100, 75);
    doc.text('Frete/km (R$)', 140, 75);
    doc.text('CIF (R$)', 180, 75);
    
    // Draw line under header
    doc.line(20, 78, 200, 78);
    
    // Table data
    let yPos = 88;
    bases.forEach(base => {
      const freightPerKm = base.freight / base.distance;
      const cifPrice = calculateCIF(base);
      
      doc.text(base.name.substring(0, 15), 20, yPos);
      doc.text(base.distance.toString(), 60, yPos);
      doc.text(base.freight.toFixed(2), 100, yPos);
      doc.text(freightPerKm.toFixed(2), 140, yPos);
      doc.text(cifPrice.toFixed(2), 180, yPos);
      
      yPos += 10;
    });
    
    // Footer
    const now = new Date();
    doc.setFontSize(8);
    doc.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`, 20, yPos + 20);
    
    // Save the PDF
    doc.save(`relatorio-comparativo-${now.toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF exportado com sucesso",
      description: "O arquivo foi baixado para o seu dispositivo"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Relatório Comparativo" showBack />
      
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* FOB Price Input */}
        <div className="mb-6 space-y-3">
          <Label className="text-sm font-medium">Preço FOB</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                R$
              </span>
              <Input
                type="number"
                step="0.01"
                value={fobPrice}
                onChange={(e) => setFobPrice(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={updateFobPrice}
              className="bg-primary hover:bg-primary-light text-primary-foreground"
            >
              Atualizar
            </Button>
          </div>
        </div>

        {/* Report Table */}
        <div className="bg-card border rounded-lg overflow-hidden mb-6">
          <div className="bg-muted p-3">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium">
              <div>Base</div>
              <div className="text-center">Distância (km)</div>
              <div className="text-center">Frete (R$)</div>
              <div className="text-center">Frete/km (R$)</div>
            </div>
          </div>
          
          <div className="divide-y">
            {bases.map((base) => {
              const freightPerKm = base.freight / base.distance;
              const cifPrice = calculateCIF(base);
              
              return (
                <div key={base.id} className="p-3">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="font-medium">{base.name}</div>
                    <div className="text-center">{base.distance}</div>
                    <div className="text-center">{base.freight.toFixed(2)}</div>
                    <div className="text-center">{cifPrice.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={shareViaWhatsApp}
            className="w-full bg-primary hover:bg-primary-light text-primary-foreground py-3"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Compartilhar via WhatsApp
          </Button>
          
          <Button
            onClick={exportPDF}
            variant="outline"
            className="w-full py-3"
          >
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}