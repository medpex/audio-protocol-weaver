
import React, { createContext, useContext, useState, useEffect } from 'react';

type TranscriptionStatus = 'idle' | 'uploading' | 'transcribing' | 'generating' | 'completed' | 'error';

export interface TranscriptionItem {
  id: string;
  fileName: string;
  dateCreated: Date;
  transcription: string;
  protocol: string;
  status: TranscriptionStatus;
  error?: string;
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
    return localStorage.getItem('openai_api_key') || '';
  });
  
  const [customPrompt, setCustomPrompt] = useState<string>(() => {
    return localStorage.getItem('custom_prompt') || 
      'Transform this meeting transcription into a formal protocol. Include all main discussion points, decisions made, and action items with responsible persons. Format it in a professional structure with headers, date, attendees, and a clear summary.';
  });

  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>(() => {
    const savedTranscriptions = localStorage.getItem('transcriptions');
    return savedTranscriptions ? JSON.parse(savedTranscriptions) : [];
  });

  const [currentTranscription, setCurrentTranscription] = useState<TranscriptionItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('openai_api_key', apiKey);
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
  };

  const deleteTranscription = (id: string) => {
    setTranscriptions((prev) => prev.filter((item) => item.id !== id));
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
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
