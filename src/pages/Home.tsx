import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import santaHelenaLogo from '../assets/santa-helena-logo.png';
import { removeBackground, loadImage } from '../utils/backgroundRemoval';

export default function Home() {
  const navigate = useNavigate();
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processLogo = async () => {
      try {
        setIsLoading(true);
        
        // Load the original logo
        const response = await fetch(santaHelenaLogo);
        const blob = await response.blob();
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        const processedUrl = URL.createObjectURL(processedBlob);
        
        setProcessedLogoUrl(processedUrl);
      } catch (error) {
        console.error('Error processing logo:', error);
        // Fallback to original logo
        setProcessedLogoUrl(santaHelenaLogo);
      } finally {
        setIsLoading(false);
      }
    };

    processLogo();

    // Cleanup URL on unmount
    return () => {
      if (processedLogoUrl) {
        URL.revokeObjectURL(processedLogoUrl);
      }
    };
  }, []);

  const menuItems = [
    {
      title: 'Bases e Fretes',
      path: '/bases',
      className: 'bg-primary hover:bg-primary-light text-primary-foreground'
    },
    {
      title: 'Relatório Comparativo',
      path: '/relatorio',
      className: 'bg-primary hover:bg-primary-light text-primary-foreground'
    },
    {
      title: 'Calcular Preço CIF',
      path: '/calcular',
      className: 'bg-primary hover:bg-primary-light text-primary-foreground'
    },
    {
      title: 'Configurações',
      path: '/configuracoes',
      className: 'bg-primary hover:bg-primary-light text-primary-foreground'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          {isLoading ? (
            <div className="mx-auto mb-6 h-24 w-24 bg-muted animate-pulse rounded-lg" />
          ) : (
            <img 
              src={processedLogoUrl || santaHelenaLogo} 
              alt="Santa Helena Logo" 
              className="mx-auto mb-6 h-24 w-auto"
            />
          )}
          <h1 className="text-2xl font-bold text-primary mb-2">
            Energética Santa Helena
          </h1>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-4">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full py-6 text-lg font-medium rounded-2xl ${item.className}`}
              size="lg"
            >
              {item.title}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}