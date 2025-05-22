
/**
 * Audio-Verarbeitungsutilitäten für die Transkription großer Dateien
 */

/**
 * Teilt eine große Audiodatei in kleinere Chunks für die API-Verarbeitung
 * @param file Die zu teilende Audiodatei
 * @param maxSizeInMB Maximale Größe eines Chunks in MB (Standard: 24MB)
 * @returns Promise mit einem Array von Blob-Chunks
 */
export const splitAudioFile = async (
  file: File,
  maxSizeInMB: number = 24
): Promise<Blob[]> => {
  // Wenn die Datei bereits klein genug ist, direkt zurückgeben
  if (file.size <= maxSizeInMB * 1024 * 1024) {
    return [file];
  }

  // Fortgeschrittene Audioverarbeitung für sehr große Dateien
  console.log(`Teile große Datei (${Math.round(file.size / (1024 * 1024))} MB) in ${maxSizeInMB}MB-Chunks`);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const chunkSize = maxSizeInMB * 1024 * 1024;
    const chunks: Blob[] = [];
    
    // Teile die Datei in Stücke der maximalen Größe
    for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
      const chunk = arrayBuffer.slice(i, Math.min(i + chunkSize, arrayBuffer.byteLength));
      chunks.push(new Blob([chunk], { type: file.type }));
      
      // Gib Speicher frei, um Out-of-Memory-Fehler zu vermeiden
      if (i % (10 * chunkSize) === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`Erfolgreich in ${chunks.length} Chunks aufgeteilt`);
    return chunks;
  } catch (error) {
    console.error('Fehler beim Aufteilen der Audiodatei:', error);
    throw new Error('Die Audiodatei konnte nicht verarbeitet werden. Bitte versuchen Sie eine kleinere Datei oder ein anderes Format.');
  }
};

/**
 * Schätzt die Transkriptionszeit für eine Audiodatei
 * @param fileSizeInMB Dateigröße in MB
 * @returns Geschätzte Zeit in Minuten
 */
export const estimateProcessingTime = (fileSizeInMB: number): number => {
  // Ungefähre Schätzung: 1 Minute Verarbeitungszeit pro 5 MB Audio
  // Diese Werte können basierend auf tatsächlichen Leistungsdaten angepasst werden
  return Math.ceil(fileSizeInMB / 5);
};

/**
 * Verarbeitet eine WEBM-Datei und konvertiert sie ggf. in ein Format, 
 * das von der Whisper API besser unterstützt wird (falls nötig)
 */
export const processAudioFile = async (file: File): Promise<File> => {
  // Die Whisper API unterstützt WEBM-Dateien nativ, daher ist keine Konvertierung erforderlich
  // In einer vollständigen Produktionsimplementierung könnte hier eine Qualitätsoptimierung oder
  // Formatkonvertierung stattfinden, falls bestimmte WEBM-Codecs nicht optimal unterstützt werden
  
  // Überprüfe auf extrem große Dateien und warne den Benutzer
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > 500) {
    console.warn(`Sehr große Datei (${Math.round(fileSizeInMB)} MB) - Die Verarbeitung kann einige Zeit dauern`);
  }
  
  return file;
};

/**
 * Kombiniert Transkriptionen mehrerer Audio-Chunks
 */
export const combineTranscriptions = (transcriptions: string[]): string => {
  // Einfache Zusammenführung mit Leerzeichen
  // In einer fortgeschritteneren Implementation könnte man hier Sätze 
  // intelligenter zusammenfügen oder Duplikate an den Übergängen entfernen
  return transcriptions.join(' ');
};

/**
 * Berechnet den Fortschritt der Chunk-Verarbeitung
 */
export const calculateProgress = (processedChunks: number, totalChunks: number): number => {
  if (totalChunks === 0) return 100;
  return Math.round((processedChunks / totalChunks) * 100);
};
