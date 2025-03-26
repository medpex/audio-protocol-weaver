
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MainLayout from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import TranscriptionCard from '@/components/ui/TranscriptionCard';
import { useToast } from '@/hooks/use-toast';

const History = () => {
  const { transcriptions, deleteTranscription } = useAppContext();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    deleteTranscription(id);
    toast({
      title: "Item deleted",
      description: "The transcription has been removed from your history",
    });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="text-3xl font-semibold">History</h1>
          <p className="text-muted-foreground">
            Browse your past transcriptions and protocols
          </p>
        </div>
        
        {transcriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transcriptions.map((item) => (
              <TranscriptionCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <Alert className="bg-secondary/50 border-secondary">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No history found</AlertTitle>
            <AlertDescription>
              You haven't created any transcriptions or protocols yet.
              Go to the Dashboard to get started.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  );
};

export default History;
