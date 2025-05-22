
import React, { useState, useEffect } from 'react';
import { DEFAULT_PROMPT } from '../constants';
import { Wand2, Save, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import MainLayout from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

// Prüfe, ob eine Umgebungsvariable für den API-Schlüssel gesetzt ist
const ENV_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

const Settings = () => {
  const { customPrompt, setCustomPrompt } = useAppContext();
  const [customPromptInput, setCustomPromptInput] = useState<string>(customPrompt);
  const { toast } = useToast();

  const handleSaveSettings = () => {
    setCustomPrompt(customPromptInput);
    
    toast({
      title: "Einstellungen gespeichert",
      description: "Ihre Änderungen wurden erfolgreich gespeichert",
    });
  };

  const resetToDefaultPrompt = () => {
    setCustomPromptInput(DEFAULT_PROMPT);
    toast({
      title: "Standardaufforderung wiederhergestellt",
      description: "Die benutzerdefinierte Aufforderung wurde auf den Standardwert zurückgesetzt",
    });
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="text-3xl font-semibold">Einstellungen</h1>
          <p className="text-muted-foreground">
            Passen Sie das Protokollformat an
          </p>
        </div>
        
        <div className="space-y-6">
          {ENV_API_KEY && (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  API-Schlüssel Status
                </CardTitle>
                <CardDescription>
                  Ihr OpenAI API-Schlüssel ist konfiguriert
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">API-Schlüssel aus Umgebungsvariable</p>
                    <p>Ein API-Schlüssel wurde über die Umgebungsvariable VITE_OPENAI_API_KEY konfiguriert und wird automatisch verwendet.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Benutzerdefinierte Anweisung
              </CardTitle>
              <CardDescription>
                Passen Sie an, wie die KI Transkriptionen in Protokolle umwandelt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customPrompt">Anweisung zur Protokollerstellung</Label>
                  <Textarea
                    id="customPrompt"
                    value={customPromptInput}
                    onChange={(e) => setCustomPromptInput(e.target.value)}
                    placeholder="Geben Sie Ihre benutzerdefinierten Anweisungen ein..."
                    className="glass-input min-h-[160px]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resetToDefaultPrompt}
                    >
                      Auf Standard zurücksetzen
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings} 
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Einstellungen speichern
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
