
import React, { useState } from 'react';
import { Clock, Download, FileText, Trash2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TranscriptionItem } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TranscriptionCardProps {
  item: TranscriptionItem;
  onDelete: (id: string) => void;
}

const TranscriptionCard: React.FC<TranscriptionCardProps> = ({ item, onDelete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contentType, setContentType] = useState<'transcription' | 'protocol'>('protocol');

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const downloadContent = (content: string, fileName: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="glass-panel hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center gap-2">
          <span className="truncate">{item.fileName}</span>
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>{formatDate(item.dateCreated)}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.protocol.substring(0, 150)}...
        </p>
      </CardContent>
      <CardFooter className="pt-4 flex justify-between gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="h-4 w-4" />
              View
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
            <DialogHeader className="mb-2">
              <DialogTitle className="flex items-center gap-2 font-medium">
                <span>{item.fileName}</span>
              </DialogTitle>
              <div className="flex justify-center mt-4 space-x-2 border-b">
                <button
                  onClick={() => setContentType('protocol')}
                  className={`pb-2 px-4 text-sm font-medium relative ${
                    contentType === 'protocol' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  Protocol
                </button>
                <button
                  onClick={() => setContentType('transcription')}
                  className={`pb-2 px-4 text-sm font-medium relative ${
                    contentType === 'transcription' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  Raw Transcription
                </button>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 bg-secondary/30 rounded-lg subtle-scrollbar">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {contentType === 'protocol' ? item.protocol : item.transcription}
              </pre>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button
                variant="outline"
                onClick={() => downloadContent(
                  contentType === 'protocol' ? item.protocol : item.transcription,
                  `${contentType === 'protocol' ? 'protocol' : 'transcription'}-${item.fileName}.txt`
                )}
                className="gap-1"
              >
                <Download className="h-4 w-4" />
                Download {contentType === 'protocol' ? 'Protocol' : 'Transcription'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => downloadContent(item.protocol, `protocol-${item.fileName}.txt`)}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TranscriptionCard;
