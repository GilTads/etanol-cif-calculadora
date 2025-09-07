import React, { useState } from 'react';
import { MessageCircle, FileText } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useBases } from '../contexts/BasesContext';
import { useToast } from '../hooks/use-toast';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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

  const exportPDF = async () => {
    try {
      const doc = new jsPDF();
      const fob = parseFloat(fobPrice);
      
      // Variáveis para controle da posição e margens
      let yPos = 30; // Posição inicial Y
      const margin = 20; // Margem
      const lineHeight = 10; // Espaçamento entre as linhas
      const pageHeight = doc.internal.pageSize.height;
      const contentHeightLimit = pageHeight - (margin * 2);

      // --- Cabeçalho do Relatório ---
      doc.setFontSize(16);
      doc.text('Relatório Comparativo', margin, yPos);
      yPos += lineHeight;
      doc.text('Energética Santa Helena', margin, yPos);
      yPos += lineHeight * 2;
      
      doc.setFontSize(12);
      doc.text(`Preço FOB: R$ ${fob.toFixed(2)}`, margin, yPos);
      yPos += lineHeight * 2;

      // --- Cabeçalho da Tabela ---
      doc.setFontSize(10);
      doc.text('Base', margin, yPos);
      doc.text('Distância (km)', margin + 40, yPos);
      doc.text('Frete (R$)', margin + 80, yPos);
      if (showFreightPerKm) {
        doc.text('Frete/km (R$)', margin + 120, yPos);
      }
      doc.text('CIF (R$)', margin + (showFreightPerKm ? 160 : 120), yPos);
      yPos += lineHeight;
      doc.line(margin, yPos - 2, doc.internal.pageSize.width - margin, yPos - 2);
      yPos += lineHeight / 2;

      // --- Dados da Tabela ---
      bases.forEach(base => {
        // Lógica de quebra de página
        if (yPos + lineHeight * 2 > contentHeightLimit) {
          doc.addPage();
          yPos = margin;
          doc.setFontSize(10);
          doc.text('Base', margin, yPos);
          doc.text('Distância (km)', margin + 40, yPos);
          doc.text('Frete (R$)', margin + 80, yPos);
          if (showFreightPerKm) {
            doc.text('Frete/km (R$)', margin + 120, yPos);
          }
          doc.text('CIF (R$)', margin + (showFreightPerKm ? 160 : 120), yPos);
          yPos += lineHeight;
          doc.line(margin, yPos - 2, doc.internal.pageSize.width - margin, yPos - 2);
          yPos += lineHeight / 2;
        }

        const freightPerKm = base.freight / base.distance;
        const cifPrice = calculateCIF(base);
        
        doc.text(base.name.substring(0, 15), margin, yPos);
        doc.text(base.distance.toString(), margin + 40, yPos);
        doc.text(base.freight.toFixed(2), margin + 80, yPos);
        if (showFreightPerKm) {
          doc.text(freightPerKm.toFixed(2), margin + 120, yPos);
        }
        doc.text(cifPrice.toFixed(2), margin + (showFreightPerKm ? 160 : 120), yPos);
        yPos += lineHeight;
      });
      
      // --- Rodapé ---
      const now = new Date();
      doc.setFontSize(8);
      if (yPos + lineHeight * 3 > contentHeightLimit) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`, margin, yPos + (lineHeight * 2));
      
      // Converte o PDF para Base64
      const pdfOutput = doc.output('datauristring');
      const pdfData = pdfOutput.split(',')[1];
      
      const fileName = `relatorio-comparativo-${now.toISOString().split('T')[0]}.pdf`;
      
      // Salva o PDF
      await Filesystem.writeFile({
        path: fileName,
        data: pdfData,
        directory: Directory.Documents,
      });

      // Abre a caixa de diálogo para compartilhamento/visualização
      const uriResult = await Filesystem.getUri({
        directory: Directory.Documents,
        path: fileName
      });

      await Share.share({
        title: 'Relatório Comparativo',
        text: 'Confira o relatório em PDF que foi gerado.',
        url: uriResult.uri,
        dialogTitle: 'Compartilhar Relatório',
      });

      toast({
        title: "PDF gerado com sucesso",
        description: "O arquivo foi salvo e aberto para visualização."
      });

    } catch (error) {
      console.error('Erro ao exportar/compartilhar PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Houve um problema ao salvar ou abrir o arquivo."
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Relatório Comparativo" showBack />
      
      <div className="container mx-auto px-4 py-6 max-w-md content-container">
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