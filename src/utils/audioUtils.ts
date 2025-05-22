
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

  // Hier kommt in einem realen Szenario komplexere Audioverarbeitung mit Web Audio API
  // In dieser vereinfachten Version teilen wir die Datei nach Größe
  // Für eine vollständige Implementierung würde man die Audiodatei an sinnvollen Stellen teilen
  
  const arrayBuffer = await file.arrayBuffer();
  const chunkSize = maxSizeInMB * 1024 * 1024;
  const chunks: Blob[] = [];
  
  // Teile die Datei in Stücke der maximalen Größe
  for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
    const chunk = arrayBuffer.slice(i, Math.min(i + chunkSize, arrayBuffer.byteLength));
    chunks.push(new Blob([chunk], { type: file.type }));
  }
  
  return chunks;
};

/**
 * Verarbeitet eine WEBM-Datei und konvertiert sie ggf. in ein Format, 
 * das von der Whisper API besser unterstützt wird (falls nötig)
 */
export const processAudioFile = async (file: File): Promise<File> => {
  // In einer vollständigen Implementierung würde hier die Konvertierung stattfinden
  // Da die WebM-Dateien von der Whisper API unterstützt werden, geben wir sie vorerst unverändert zurück
  return file;
};

/**
 * Kombiniert Transkriptionen mehrerer Audio-Chunks
 */
export const combineTranscriptions = (transcriptions: string[]): string => {
  return transcriptions.join(' ');
};
