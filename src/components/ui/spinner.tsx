import React from 'react';
import { cn } from '@/lib/utils';
import santaHelenaLogo from '@/assets/santa-helena-logo.png';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <img 
        src={santaHelenaLogo}
        alt="Carregando..."
        className={cn(
          'animate-spin',
          sizeClasses[size]
        )}
      />
    </div>
  );
}

export default Spinner;