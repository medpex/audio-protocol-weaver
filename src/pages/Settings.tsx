
import React, { useState } from 'react';
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
      title: "Settings saved",
      description: "Your changes have been saved successfully",
    });
  };

  const resetToDefaultPrompt = () => {
    const defaultPrompt = "Transform this meeting transcription into a formal protocol. Include all main discussion points, decisions made, and action items with responsible persons. Format it in a professional structure with headers, date, attendees, and a clear summary.";
    
    setCustomPromptInput(defaultPrompt);
    toast({
      title: "Default prompt restored",
      description: "The custom prompt has been reset to the default value",
    });
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your API keys and customize the protocol format
          </p>
        </div>
        
        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Key
              </CardTitle>
              <CardDescription>
                Enter your OpenAI API key to use the transcription and protocol generation services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenAI API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    className="glass-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your API key is stored securely in your browser's local storage and is never sent to our servers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Custom Prompt
              </CardTitle>
              <CardDescription>
                Customize how the AI transforms transcriptions into protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customPrompt">Protocol Generation Prompt</Label>
                  <Textarea
                    id="customPrompt"
                    value={customPromptInput}
                    onChange={(e) => setCustomPromptInput(e.target.value)}
                    placeholder="Enter your custom prompt instructions..."
                    className="glass-input min-h-[160px]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resetToDefaultPrompt}
                    >
                      Reset to default
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
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
