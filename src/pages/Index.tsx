
import React, { useState } from 'react';
import { 
  PlayCircle, 
  FileText, 
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import FileUploader from '@/components/ui/FileUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import MainLayout from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { generateId, transcribeAudio, generateProtocol } from '@/services/apiService';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcriptionText, setTranscriptionText] = useState<string>('');
  const [protocolText, setProtocolText] = useState<string>('');
  const [processingStep, setProcessingStep] = useState<'idle' | 'transcribing' | 'generating' | 'completed'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };
  
  const { 
    apiKey, 
    customPrompt,
    addTranscription,
    updateTranscription,
    currentTranscription,
    setCurrentTranscription
  } = useAppContext();
  
  const { toast } = useToast();

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);

    // Reset everything when a new file is selected
    setTranscriptionText('');
    setProtocolText('');
    setProcessingStep('idle');
    setProgress(0);
    setLogs([]);
    addLog(`Datei hochgeladen: ${file.name} (${(file.size / (1024*1024)).toFixed(2)} MB)`);
  };

  const handleTranscribe = async () => {
    if (!selectedFile) {
      toast({
        title: "Keine Datei ausgewählt",
        description: "Bitte laden Sie zuerst eine Audiodatei hoch",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API-Schlüssel erforderlich",
        description: "Bitte fügen Sie Ihren OpenAI API-Schlüssel in den Einstellungen hinzu",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingStep('transcribing');
      addLog('Starte Transkription...');

      const transcription = await transcribeAudio(selectedFile, apiKey, (prog, msg) => {
        setProgress(prog);
        addLog(msg);
      });
      setTranscriptionText(transcription);
      
      // Create a new item with the transcription
      const newItem = {
        id: generateId(),
        fileName: selectedFile.name,
        dateCreated: new Date(),
        transcription: transcription,
        protocol: '',
        status: 'transcribing' as const,
      };
      
      addTranscription(newItem);
      setCurrentTranscription(newItem);
      
      toast({
        title: "Transkription abgeschlossen",
        description: "Die Audio wurde erfolgreich transkribiert",
      });

      addLog('Transkription abgeschlossen');
      setProcessingStep('idle');
    } catch (error) {
      console.error('Transkriptionsfehler:', error);
      setProcessingStep('idle');
      
      toast({
        title: "Transkription fehlgeschlagen",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive",
      });
      addLog('Transkription fehlgeschlagen');
    }
  };

  const handleGenerateProtocol = async () => {
    if (!transcriptionText) {
      toast({
        title: "Keine Transkription",
        description: "Bitte transkribieren Sie zuerst eine Audiodatei",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API-Schlüssel erforderlich",
        description: "Bitte fügen Sie Ihren OpenAI API-Schlüssel in den Einstellungen hinzu",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingStep('generating');
      addLog('Erstelle Protokoll...');

      const protocol = await generateProtocol(transcriptionText, customPrompt, apiKey);
      setProtocolText(protocol);
      
      // Update the current item with the generated protocol
      if (currentTranscription) {
        const updates = {
          protocol,
          status: 'completed' as const,
        };
        updateTranscription(currentTranscription.id, updates);
        setCurrentTranscription({ ...currentTranscription, ...updates });
      }
      
      toast({
        title: "Protokoll erstellt",
        description: "Das Besprechungsprotokoll wurde erfolgreich erstellt",
      });

      addLog('Protokoll erstellt');
      setProcessingStep('completed');
    } catch (error) {
      console.error('Fehler bei der Protokollerstellung:', error);
      setProcessingStep('idle');
      
      toast({
        title: "Protokollerstellung fehlgeschlagen",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive",
      });
      addLog('Protokollerstellung fehlgeschlagen');
    }
  };

  const handleDownload = () => {
    if (!protocolText) {
      toast({
        title: "Kein Protokoll",
        description: "Bitte erstellen Sie zuerst ein Protokoll",
        variant: "destructive",
      });
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([protocolText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `protokoll-${selectedFile?.name || 'besprechung'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download gestartet",
      description: "Ihr Protokoll wird heruntergeladen",
    });
  };

  // Helper to render the correct buttons based on the current state
  const renderActionButtons = () => {
    if (processingStep === 'transcribing') {
      return (
        <Button disabled className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Transkribiere...
        </Button>
      );
    }
    
    if (processingStep === 'generating') {
      return (
        <Button disabled className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Erstelle Protokoll...
        </Button>
      );
    }
    
    if (!transcriptionText) {
      return (
        <Button 
          onClick={handleTranscribe} 
          disabled={!selectedFile || !apiKey}
          className="gap-2"
        >
          <PlayCircle className="h-4 w-4" />
          Transkription starten
        </Button>
      );
    }
    
    if (transcriptionText && !protocolText) {
      return (
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateProtocol}
            disabled={!apiKey}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Protokoll erstellen
          </Button>
        </div>
      );
    }
    
    if (protocolText) {
      return (
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Protokoll herunterladen
          </Button>
        </div>
      );
    }
    
    return null;
  };

  // Display appropriate message based on API key status
  const renderApiKeyWarning = () => {
    if (!apiKey) {
      return (
        <div className="flex items-center gap-2 p-3 mt-6 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Bitte fügen Sie Ihren OpenAI API-Schlüssel in den Einstellungen hinzu, um den Transkriptionsdienst nutzen zu können.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="text-3xl font-semibold">Besprechungsprotokoll-Generator</h1>
          <p className="text-muted-foreground">
            Laden Sie eine Audioaufnahme Ihrer Besprechung hoch, um ein professionelles schriftliches Protokoll zu erstellen
          </p>
        </div>
        
        <Card className="glass-panel overflow-hidden">
          <CardContent className="p-6">
            <FileUploader
              onFileSelected={handleFileSelected}
              disabled={processingStep === 'transcribing' || processingStep === 'generating'}
            />

            {renderApiKeyWarning()}

            {progress > 0 && (
              <div className="mt-4">
                <Progress value={progress} />
              </div>
            )}

            <div className="mt-6 flex justify-center">
              {renderActionButtons()}
            </div>

            {logs.length > 0 && (
              <div className="mt-6 bg-black text-green-300 rounded-md p-3 h-40 overflow-y-auto font-mono text-xs">
                {logs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            )}

            {transcriptionText && !protocolText && (
              <div className="mt-8 space-y-2">
                <h3 className="text-xl font-semibold">Transkription bearbeiten</h3>
                <Textarea
                  value={transcriptionText}
                  onChange={(e) => setTranscriptionText(e.target.value)}
                  className="min-h-[160px] subtle-scrollbar"
                />
              </div>
            )}

            {protocolText && (
              <div className="mt-8 p-4 bg-secondary/30 rounded-lg max-h-80 overflow-y-auto subtle-scrollbar">
                <h3 className="text-xl font-semibold mb-2">Erstelltes Protokoll</h3>
                <div className="whitespace-pre-line">
                  {protocolText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Index;
