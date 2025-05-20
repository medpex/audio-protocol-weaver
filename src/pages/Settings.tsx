
import React, { useState } from 'react';
import { DEFAULT_PROMPT } from '../constants';
import { Key, Wand2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import MainLayout from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { apiKey, setApiKey, customPrompt, setCustomPrompt } = useAppContext();
  const [apiKeyInput, setApiKeyInput] = useState<string>(apiKey);
  const [customPromptInput, setCustomPromptInput] = useState<string>(customPrompt);
  const { toast } = useToast();

  const handleSaveSettings = () => {
    setApiKey(apiKeyInput);
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
            Verwalten Sie Ihre API-Schlüssel und passen Sie das Protokollformat an
          </p>
        </div>
        
        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API-Schlüssel
              </CardTitle>
              <CardDescription>
                Geben Sie Ihren OpenAI API-Schlüssel ein, um die Transkriptions- und Protokollerstellungsdienste zu nutzen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenAI API-Schlüssel</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    className="glass-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ihr API-Schlüssel wird sicher im lokalen Speicher Ihres Browsers gespeichert und niemals an unsere Server gesendet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
