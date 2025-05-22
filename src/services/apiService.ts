
import { splitAudioFile, processAudioFile, combineTranscriptions } from '@/utils/audioUtils';

// Helper for generating a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Process audio file and get transcription from OpenAI Whisper API
export const transcribeAudio = async (
  file: File,
  apiKey: string
): Promise<string> => {
  try {
    console.log('Starte Transkription für:', file.name, 'Größe:', Math.round(file.size / (1024 * 1024)), 'MB');
    
    // Verarbeite die Audiodatei (Konvertierung etc. falls nötig)
    const processedFile = await processAudioFile(file);
    
    // Teile die Datei in kleinere Stücke, wenn sie zu groß ist (max. 25MB pro Stück für OpenAI API)
    const audioChunks = await splitAudioFile(processedFile, 24);
    
    console.log(`Datei in ${audioChunks.length} Teile aufgeteilt`);
    
    // Wenn nur ein Chunk, führe normale Transkription durch
    if (audioChunks.length === 1) {
      return await transcribeChunk(audioChunks[0], apiKey);
    }
    
    // Andernfalls transkribiere jeden Chunk einzeln und kombiniere die Ergebnisse
    const transcriptionPromises = audioChunks.map((chunk, index) => {
      console.log(`Transkribiere Teil ${index + 1}/${audioChunks.length}...`);
      return transcribeChunk(chunk, apiKey);
    });
    
    const chunkTranscriptions = await Promise.all(transcriptionPromises);
    return combineTranscriptions(chunkTranscriptions);
    
  } catch (error) {
    console.error('Transkriptionsfehler:', error);
    throw error;
  }
};

// Transkribiert einen einzelnen Audio-Chunk
const transcribeChunk = async (audioChunk: Blob, apiKey: string): Promise<string> => {
  const formData = new FormData();
  
  // Konvertiere Blob zu File, wenn es ein Blob ist
  const chunkFile = audioChunk instanceof File 
    ? audioChunk 
    : new File([audioChunk], 'chunk.webm', { type: audioChunk.type });
  
  formData.append('file', chunkFile);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'text');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Fehler: ${response.status} ${response.statusText}`);
  }

  return await response.text();
};

// Generate meeting protocol from transcription text
export const generateProtocol = async (
  transcription: string,
  customPrompt: string,
  apiKey: string
): Promise<string> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: customPrompt 
          },
          { 
            role: 'user', 
            content: transcription 
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Fehler: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Kein Inhalt zurückgegeben';
  } catch (error) {
    console.error('Protokollgenerierungsfehler:', error);
    throw error;
  }
};

export { generateId };
