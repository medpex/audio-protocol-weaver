
import { splitAudioFile, processAudioFile, combineTranscriptions, calculateProgress } from '@/utils/audioUtils';
import { TranscriptionItem } from '@/context/AppContext';

// Helper for generating a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Process audio file and get transcription from OpenAI Whisper API
export const transcribeAudio = async (
  file: File,
  apiKey: string,
  onProgressUpdate?: (progress: number, status: string) => void
): Promise<string> => {
  try {
    console.log('Starte Transkription für:', file.name, 'Größe:', Math.round(file.size / (1024 * 1024)), 'MB');

    // Verarbeite die Audiodatei (Konvertierung etc. falls nötig)
    if (onProgressUpdate) onProgressUpdate(5, 'Datei wird in MP3 umgewandelt...');
    const processedFile = await processAudioFile(file);
    if (onProgressUpdate) onProgressUpdate(8, processedFile === file ? 'Dateiformat ist kompatibel' : 'Umwandlung abgeschlossen');

    // Teile die Datei in kleinere Stücke, falls sie zu groß ist
    if (onProgressUpdate) onProgressUpdate(10, 'Teile Datei in Chunks...');
    const audioChunks = await splitAudioFile(processedFile);
    if (onProgressUpdate) onProgressUpdate(12, `Datei in ${audioChunks.length} Chunks getrennt`);
    
    console.log(`Datei in ${audioChunks.length} Teile aufgeteilt`);
    
    // Wenn nur ein Chunk, führe normale Transkription durch
    if (audioChunks.length === 1) {
      if (onProgressUpdate) onProgressUpdate(50, 'Transkribiere Audio...');
      return await transcribeChunk(audioChunks[0], apiKey);
    }
    
    // Andernfalls transkribiere jeden Chunk einzeln und kombiniere die Ergebnisse
    const results: string[] = [];
    let completedChunks = 0;
    
    // Sequentielles Transkribieren der Chunks, um Speicher zu sparen und API-Ratenlimits zu beachten
    for (let i = 0; i < audioChunks.length; i++) {
      if (onProgressUpdate) {
        const progress = 10 + calculateProgress(i, audioChunks.length) * 0.8; // 10-90% Fortschritt
        onProgressUpdate(progress, `Transkribiere Teil ${i + 1}/${audioChunks.length}...`);
      }
      
      console.log(`Transkribiere Teil ${i + 1}/${audioChunks.length}...`);
      const chunkResult = await transcribeChunk(audioChunks[i], apiKey);
      results.push(chunkResult);
      completedChunks++;
      
      // Gib Speicher frei zwischen den Chunks
      if (i < audioChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (onProgressUpdate) onProgressUpdate(95, 'Kombiniere Transkriptionen...');
    const combined = combineTranscriptions(results);
    if (onProgressUpdate) onProgressUpdate(100, 'Transkription abgeschlossen');
    return combined;
    
  } catch (error) {
    console.error('Transkriptionsfehler:', error);
    throw error;
  }
};

// Transkribiert einen einzelnen Audio-Chunk mit Wiederholungsversuchen
const transcribeChunk = async (audioChunk: Blob, apiKey: string, retries = 3): Promise<string> => {
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      const formData = new FormData();
      
      // Konvertiere Blob zu File, wenn es ein Blob ist
      const chunkFile = audioChunk instanceof File
        ? audioChunk
        : new File([audioChunk], 'chunk.mp3', { type: audioChunk.type });
      
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
        if (response.status === 429 && attempt < retries - 1) {
          // Rate limit erreicht, warte und versuche es erneut
          attempt++;
          const waitTime = 2000 * Math.pow(2, attempt); // Exponentielles Backoff
          console.log(`Rate limit erreicht. Warte ${waitTime/1000} Sekunden und versuche es erneut...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error(errorData.error?.message || `Fehler: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Chunk-Transkriptionsfehler (Versuch ${attempt + 1}/${retries}):`, error);
      if (attempt >= retries - 1) throw error;
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('Maximale Anzahl an Wiederholungsversuchen überschritten.');
};

// Generate meeting protocol from transcription text
export const generateProtocol = async (
  transcription: string,
  customPrompt: string,
  apiKey: string
): Promise<string> => {
  try {
    // Für sehr lange Transkriptionen, teilen wir den Text auf und verarbeiten ihn in mehreren Anfragen
    const maxTokens = 100000; // Zeichen-Grenze für eine API-Anfrage
    
    if (transcription.length <= maxTokens) {
      // Standard-Anfrage für normale Textlänge
      return await generateProtocolChunk(transcription, customPrompt, apiKey);
    } else {
      // Für sehr lange Transkriptionen, teilen und zusammenfassen
      console.log(`Transkription ist sehr lang (${transcription.length} Zeichen), teile in mehrere Anfragen auf`);
      
      // Teile Text in Absätze und dann in Chunks
      const paragraphs = transcription.split(/\n\n+/);
      const chunks: string[] = [];
      let currentChunk = '';
      
      for (const paragraph of paragraphs) {
        if ((currentChunk + paragraph).length > maxTokens) {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = paragraph;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
      }
      
      if (currentChunk) chunks.push(currentChunk);
      
      // Generiere ein Protokoll für jeden Chunk und kombiniere sie
      const chunkResults: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Verarbeite Chunk ${i + 1}/${chunks.length}...`);
        const chunkPrompt = `${customPrompt}\n\nDies ist Teil ${i + 1} von ${chunks.length} der Transkription. Bitte erstelle ein Teilprotokoll für diesen Abschnitt.`;
        const chunkResult = await generateProtocolChunk(chunks[i], chunkPrompt, apiKey);
        chunkResults.push(chunkResult);
      }
      
      // Kombiniere die Ergebnisse und erstelle eine finale Zusammenfassung
      if (chunks.length > 1) {
        const combinedResults = chunkResults.join('\n\n--- Nächster Abschnitt ---\n\n');
        const finalPrompt = `${customPrompt}\n\nHier ist eine zusammengesetzte Version mehrerer Protokollteile. Bitte erstelle ein zusammenhängendes, finales Protokoll daraus und entferne Wiederholungen oder inkonsistente Formatierung.`;
        return await generateProtocolChunk(combinedResults, finalPrompt, apiKey);
      } else {
        return chunkResults[0];
      }
    }
  } catch (error) {
    console.error('Protokollgenerierungsfehler:', error);
    throw error;
  }
};

// Generate protocol for a single chunk of text
const generateProtocolChunk = async (
  text: string,
  prompt: string,
  apiKey: string
): Promise<string> => {
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
          content: prompt 
        },
        { 
          role: 'user', 
          content: text 
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
};

export { generateId };
