
import React, { useState, useRef } from 'react';
import { FileAudio, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, disabled = false }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Erlaubte Audio-Dateitypen - inkl. webm
  const allowedTypes = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 
    'audio/x-wav', 'audio/x-m4a', 'audio/mp4', 'audio/aac',
    'audio/ogg', 'audio/webm', 'audio/flac', 'video/webm'
  ];

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Überprüfen, ob die Datei ein Audio/Video-Format ist
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte laden Sie eine Audiodatei hoch (MP3, WAV, M4A, WEBM, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Dateigrößenprüfung (1GB Limit für Uploadgröße, später werden große Dateien aufgeteilt)
    if (file.size > 1024 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Audiodatei muss kleiner als 1GB sein",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 700 * 1024 * 1024) {
      toast({
        title: "Sehr große Datei",
        description: "Die Verarbeitung kann einige Zeit dauern und mehr Ressourcen benötigen",
        variant: "warning"
      });
    }
    
    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  return (
    <div className="w-full">
      <div
        className={`drop-zone relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          isDragging ? 'active' : ''
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-secondary/50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !selectedFile && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          className="hidden"
          accept="audio/*,video/webm"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center justify-center gap-4">
          {selectedFile ? (
            <>
              <div className="relative flex items-center justify-center w-16 h-16 mb-2 bg-primary/10 rounded-full">
                <FileAudio className="w-8 h-8 text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-medium">{selectedFile.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                  {selectedFile.size > 500 * 1024 * 1024 && (
                    <span className="ml-2 text-amber-500">(Große Datei)</span>
                  )}
                </span>
              </div>
              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="mt-2 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="relative flex items-center justify-center w-16 h-16 mb-2 bg-primary/10 rounded-full animate-float">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Drag & drop deine Audiodatei</h3>
              <p className="text-muted-foreground text-sm mb-2">
                oder klicke, um eine Datei auszuwählen
              </p>
              <p className="text-xs text-muted-foreground">
                Unterstützt MP3, WAV, M4A, WEBM und andere Audioformate (max 1GB)
              </p>
              <p className="text-xs text-amber-500 mt-2">
                Hinweis: Große Dateien (>700MB) werden automatisch aufgeteilt und können eine längere Verarbeitungszeit benötigen
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
