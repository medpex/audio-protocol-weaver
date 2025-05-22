
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_PROMPT } from '../constants';

// Umgebungsvariable für den API-Schlüssel, falls verfügbar
const ENV_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

type TranscriptionStatus = 'idle' | 'uploading' | 'transcribing' | 'generating' | 'completed' | 'error';

export interface TranscriptionItem {
  id: string;
  fileName: string;
  dateCreated: Date;
  transcription: string;
  protocol: string;
  status: TranscriptionStatus;
  error?: string;
  chunkCount?: number;
  processedChunks?: number;
  progressMessage?: string;
  progressPercent?: number;
}

interface AppContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  transcriptions: TranscriptionItem[];
  addTranscription: (item: TranscriptionItem) => void;
  updateTranscription: (id: string, updates: Partial<TranscriptionItem>) => void;
  deleteTranscription: (id: string) => void;
  currentTranscription: TranscriptionItem | null;
  setCurrentTranscription: (item: TranscriptionItem | null) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    // Priorisiere die Umgebungsvariable, falls vorhanden
    const storedKey = localStorage.getItem('openai_api_key');
    return ENV_API_KEY || storedKey || '';
  });
  
  const [customPrompt, setCustomPrompt] = useState<string>(() => {
    return localStorage.getItem('custom_prompt') || DEFAULT_PROMPT;
  });

  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>(() => {
    const savedTranscriptions = localStorage.getItem('transcriptions');
    if (savedTranscriptions) {
      try {
        const parsed = JSON.parse(savedTranscriptions);
        // Konvertiere String-Datumswerte zurück zu Date-Objekten
        return parsed.map((item: any) => ({
          ...item,
          dateCreated: new Date(item.dateCreated)
        }));
      } catch (e) {
        console.error('Fehler beim Parsen der gespeicherten Transkriptionen:', e);
        return [];
      }
    }
    return [];
  });

  const [currentTranscription, setCurrentTranscription] = useState<TranscriptionItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Einstellungen im localStorage speichern
  useEffect(() => {
    // Speichere den API-Schlüssel nur, wenn er vom Benutzer geändert wurde
    // und nicht der voreingestellte Umgebungsvariablen-Schlüssel ist
    if (apiKey !== ENV_API_KEY) {
      localStorage.setItem('openai_api_key', apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('custom_prompt', customPrompt);
  }, [customPrompt]);

  useEffect(() => {
    localStorage.setItem('transcriptions', JSON.stringify(transcriptions));
  }, [transcriptions]);

  const addTranscription = (item: TranscriptionItem) => {
    setTranscriptions((prev) => [item, ...prev]);
  };

  const updateTranscription = (id: string, updates: Partial<TranscriptionItem>) => {
    setTranscriptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    
    // Aktualisiere auch das aktuelle Transkriptionsobjekt, wenn es dasselbe ist
    if (currentTranscription?.id === id) {
      setCurrentTranscription(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteTranscription = (id: string) => {
    setTranscriptions((prev) => prev.filter((item) => item.id !== id));
    if (currentTranscription?.id === id) {
      setCurrentTranscription(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setApiKey,
        customPrompt,
        setCustomPrompt,
        transcriptions,
        addTranscription,
        updateTranscription,
        deleteTranscription,
        currentTranscription,
        setCurrentTranscription,
        isProcessing,
        setIsProcessing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext muss innerhalb eines AppProviders verwendet werden');
  }
  return context;
};
