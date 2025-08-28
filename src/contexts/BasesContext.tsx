import React, { createContext, useContext, useState, useEffect } from 'react';
import { Base } from '../types';
import { initialBases } from '../data/bases';

interface BasesContextType {
  bases: Base[];
  addBase: (base: Omit<Base, 'id'>) => void;
  updateBase: (id: string, base: Omit<Base, 'id'>) => void;
  deleteBase: (id: string) => void;
  getBase: (id: string) => Base | undefined;
  showFreightPerKm: boolean;
  setShowFreightPerKm: (show: boolean) => void;
}

const BasesContext = createContext<BasesContextType | undefined>(undefined);

export function BasesProvider({ children }: { children: React.ReactNode }) {
  const [bases, setBases] = useState<Base[]>([]);
  const [showFreightPerKm, setShowFreightPerKm] = useState(true);

  useEffect(() => {
    const storedBases = localStorage.getItem('santahelena-bases');
    if (storedBases) {
      setBases(JSON.parse(storedBases));
    } else {
      setBases(initialBases);
      localStorage.setItem('santahelena-bases', JSON.stringify(initialBases));
    }

    const storedSettings = localStorage.getItem('santahelena-settings');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      setShowFreightPerKm(settings.showFreightPerKm ?? true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('santahelena-bases', JSON.stringify(bases));
  }, [bases]);

  useEffect(() => {
    localStorage.setItem('santahelena-settings', JSON.stringify({ showFreightPerKm }));
  }, [showFreightPerKm]);

  const addBase = (newBase: Omit<Base, 'id'>) => {
    const id = Date.now().toString();
    setBases(prev => [...prev, { ...newBase, id }]);
  };

  const updateBase = (id: string, updatedBase: Omit<Base, 'id'>) => {
    setBases(prev => prev.map(base => 
      base.id === id ? { ...updatedBase, id } : base
    ));
  };

  const deleteBase = (id: string) => {
    setBases(prev => prev.filter(base => base.id !== id));
  };

  const getBase = (id: string) => {
    return bases.find(base => base.id === id);
  };

  return (
    <BasesContext.Provider value={{
      bases,
      addBase,
      updateBase,
      deleteBase,
      getBase,
      showFreightPerKm,
      setShowFreightPerKm
    }}>
      {children}
    </BasesContext.Provider>
  );
}

export function useBases() {
  const context = useContext(BasesContext);
  if (context === undefined) {
    throw new Error('useBases must be used within a BasesProvider');
  }
  return context;
}