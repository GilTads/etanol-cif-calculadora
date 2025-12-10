import React, { createContext, useContext, useState, useEffect } from 'react';
import { Base } from '../types';
import { databaseService } from '../services/databaseService';

interface BasesContextType {
  bases: Base[];
  addBase: (base: Omit<Base, 'id'>) => Promise<void>;
  updateBase: (id: string, base: Omit<Base, 'id'>) => Promise<void>;
  deleteBase: (id: string) => Promise<void>;
  getBase: (id: string) => Base | undefined;
  showFreightPerKm: boolean;
  setShowFreightPerKm: (show: boolean) => void;
  loading: boolean;
}

const DEFAULT_SHOW_FREIGHT_PER_KM = false;
const BasesContext = createContext<BasesContextType | undefined>(undefined);

export function BasesProvider({ children }: { children: React.ReactNode }) {
  const [bases, setBases] = useState<Base[]>([]);
  const [showFreightPerKm, setShowFreightPerKm] = useState(DEFAULT_SHOW_FREIGHT_PER_KM);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setLoading(true);
        await databaseService.initialize();
        
        const loadedBases = await databaseService.getBases();
        setBases(loadedBases);
        
        const showFreightSetting = await databaseService.getSetting('showFreightPerKm');

        if (showFreightSetting !== null) {
          try {
            const value = JSON.parse(showFreightSetting);
            setShowFreightPerKm(Boolean(value));
          } catch (error) {
            console.warn('Invalid showFreightPerKm setting found, resetting to default.', error);
            setShowFreightPerKm(DEFAULT_SHOW_FREIGHT_PER_KM);
            await databaseService.setSetting('showFreightPerKm', JSON.stringify(DEFAULT_SHOW_FREIGHT_PER_KM));
          }
        } else {
          setShowFreightPerKm(DEFAULT_SHOW_FREIGHT_PER_KM);
          await databaseService.setSetting('showFreightPerKm', JSON.stringify(DEFAULT_SHOW_FREIGHT_PER_KM));
        }
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  useEffect(() => {
    if (!loading) {
      databaseService
        .setSetting('showFreightPerKm', JSON.stringify(showFreightPerKm))
        .catch(error => console.error('Error saving showFreightPerKm setting:', error));
    }
  }, [showFreightPerKm, loading]);

  const addBase = async (newBase: Omit<Base, 'id'>) => {
    try {
      await databaseService.addBase(newBase);
      const updatedBases = await databaseService.getBases();
      setBases(updatedBases);
    } catch (error) {
      console.error('Error adding base:', error);
    }
  };

  const updateBase = async (id: string, updatedBase: Omit<Base, 'id'>) => {
    try {
      await databaseService.updateBase(id, updatedBase);
      const updatedBases = await databaseService.getBases();
      setBases(updatedBases);
    } catch (error) {
      console.error('Error updating base:', error);
    }
  };

  const deleteBase = async (id: string) => {
    try {
      await databaseService.deleteBase(id);
      const updatedBases = await databaseService.getBases();
      setBases(updatedBases);
    } catch (error) {
      console.error('Error deleting base:', error);
    }
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
      setShowFreightPerKm,
      loading
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
