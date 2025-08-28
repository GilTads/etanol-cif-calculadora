import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  className?: string;
}

export function Header({ title, showBack = false, className = '' }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={`bg-primary text-primary-foreground p-4 ${className}`}>
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-light"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
}