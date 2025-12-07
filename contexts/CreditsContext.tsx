import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CreditsContextType {
  credits: number;
  isLoading: boolean;
  addCredits: (amount: number) => void;
  useCredit: () => boolean;
  refreshCredits: () => Promise<void>;
  hasCredits: boolean;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

const CREDITS_STORAGE_KEY = '@resume_improver_credits';
const FREE_CREDITS = 1; // New users get 1 free credit

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<number>(FREE_CREDITS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const stored = await AsyncStorage.getItem(CREDITS_STORAGE_KEY);
      if (stored !== null) {
        setCredits(parseInt(stored, 10));
      } else {
        // First time user - give free credits
        await AsyncStorage.setItem(CREDITS_STORAGE_KEY, FREE_CREDITS.toString());
        setCredits(FREE_CREDITS);
      }
    } catch (error) {
      console.error('Failed to load credits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCredits = async (newCredits: number) => {
    try {
      await AsyncStorage.setItem(CREDITS_STORAGE_KEY, newCredits.toString());
    } catch (error) {
      console.error('Failed to save credits:', error);
    }
  };

  const addCredits = (amount: number) => {
    const newCredits = credits + amount;
    setCredits(newCredits);
    saveCredits(newCredits);
  };

  const useCredit = (): boolean => {
    if (credits <= 0) return false;
    const newCredits = credits - 1;
    setCredits(newCredits);
    saveCredits(newCredits);
    return true;
  };

  const refreshCredits = async () => {
    await loadCredits();
  };

  return (
    <CreditsContext.Provider
      value={{
        credits,
        isLoading,
        addCredits,
        useCredit,
        refreshCredits,
        hasCredits: credits > 0,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}
