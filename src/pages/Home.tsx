import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import santaHelenaLogo from '../assets/santa-helena-logo.png';

export default function Home() {
  const navigate = useNavigate();

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
          <img 
            src={santaHelenaLogo} 
            alt="Santa Helena Logo" 
            className="mx-auto mb-6 h-24 w-auto"
          />
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