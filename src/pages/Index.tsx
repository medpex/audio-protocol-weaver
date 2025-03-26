
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
import MainLayout from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { generateId, transcribeAudio, generateProtocol } from '@/services/apiService';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcriptionText, setTranscriptionText] = useState<string>('');
  const [protocolText, setProtocolText] = useState<string>('');
  const [processingStep, setProcessingStep] = useState<'idle' | 'transcribing' | 'generating' | 'completed'>('idle');
  
  const { 
    apiKey, 
    customPrompt, 
    addTranscription, 
    setCurrentTranscription 
  } = useAppContext();
  
  const { toast } = useToast();

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    
    // Reset everything when a new file is selected
    setTranscriptionText('');
    setProtocolText('');
    setProcessingStep('idle');
  };

  const handleTranscribe = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload an audio file first",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your OpenAI API key in the Settings tab",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingStep('transcribing');
      
      const transcription = await transcribeAudio(selectedFile, apiKey);
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
        title: "Transcription completed",
        description: "Audio has been successfully transcribed",
      });
      
      setProcessingStep('idle');
    } catch (error) {
      console.error('Transcription error:', error);
      setProcessingStep('idle');
      
      toast({
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleGenerateProtocol = async () => {
    if (!transcriptionText) {
      toast({
        title: "No transcription",
        description: "Please transcribe an audio file first",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your OpenAI API key in the Settings tab",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingStep('generating');
      
      const protocol = await generateProtocol(transcriptionText, customPrompt, apiKey);
      setProtocolText(protocol);
      
      // Update the current item with the generated protocol
      if (selectedFile) {
        const updatedItem = {
          id: generateId(),
          fileName: selectedFile.name,
          dateCreated: new Date(),
          transcription: transcriptionText,
          protocol: protocol,
          status: 'completed' as const,
        };
        
        addTranscription(updatedItem);
        setCurrentTranscription(updatedItem);
      }
      
      toast({
        title: "Protocol generated",
        description: "Meeting protocol has been created successfully",
      });
      
      setProcessingStep('completed');
    } catch (error) {
      console.error('Protocol generation error:', error);
      setProcessingStep('idle');
      
      toast({
        title: "Protocol generation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!protocolText) {
      toast({
        title: "No protocol",
        description: "Please generate a protocol first",
        variant: "destructive",
      });
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([protocolText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `protocol-${selectedFile?.name || 'meeting'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download started",
      description: "Your protocol is being downloaded",
    });
  };

  // Helper to render the correct buttons based on the current state
  const renderActionButtons = () => {
    if (processingStep === 'transcribing') {
      return (
        <Button disabled className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Transcribing...
        </Button>
      );
    }
    
    if (processingStep === 'generating') {
      return (
        <Button disabled className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating Protocol...
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
          Start Transcription
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
            Generate Protocol
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
            Download Protocol
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
            Please add your OpenAI API key in the Settings tab to use the transcription service.
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
          <h1 className="text-3xl font-semibold">Meeting Protocol Generator</h1>
          <p className="text-muted-foreground">
            Upload an audio recording of your meeting to generate a professional written protocol
          </p>
        </div>
        
        <Card className="glass-panel overflow-hidden">
          <CardContent className="p-6">
            <FileUploader 
              onFileSelected={handleFileSelected} 
              disabled={processingStep === 'transcribing' || processingStep === 'generating'} 
            />
            
            {renderApiKeyWarning()}
            
            <div className="mt-6 flex justify-center">
              {renderActionButtons()}
            </div>
            
            {protocolText && (
              <div className="mt-8 p-4 bg-secondary/30 rounded-lg max-h-80 overflow-y-auto subtle-scrollbar">
                <h3 className="text-xl font-semibold mb-2">Generated Protocol</h3>
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
