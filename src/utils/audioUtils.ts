
/**
 * Audio-Verarbeitungsutilitäten für die Transkription großer Dateien
 */

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// Globale Instanz von ffmpeg, um wiederholtes Laden zu vermeiden
const ffmpeg = createFFmpeg({ log: false });
let ffmpegLoaded = false;

const loadFFmpeg = async () => {
  if (!ffmpegLoaded) {
    await ffmpeg.load();
    ffmpegLoaded = true;
  }
};

/**
 * Teilt eine große Audiodatei in kleinere Chunks für die API-Verarbeitung
 * @param file Die zu teilende Audiodatei
 * @param maxSizeInMB Maximale Größe eines Chunks in MB (Standard: 24MB)
 * @returns Promise mit einem Array von Blob-Chunks
 */
export const splitAudioFile = async (
  file: File,
  maxDurationSec: number = 600 // ca. 10 Minuten pro Chunk
): Promise<Blob[]> => {
  // Für kleine Dateien keine Aufteilung nötig
  if (file.size <= 25 * 1024 * 1024) {
    return [file];
  }

  maxSizeInMB: number = 24.5
): Promise<Blob[]> => {
  if (file.size <= maxSizeInMB * 1024 * 1024) {
    return [file];
  }

  console.log(
    `Teile große Datei (${Math.round(file.size / (1024 * 1024))} MB) in Chunks unter ${maxSizeInMB} MB`
  );
  maxDurationSec: number = 600 // ca. 10 Minuten pro Chunk
): Promise<Blob[]> => {
  // Für kleine Dateien keine Aufteilung nötig
  if (file.size <= 25 * 1024 * 1024) {
    return [file];
  }

  console.log(`Teile große Datei (${Math.round(file.size / (1024 * 1024))} MB) in zeitbasierte Chunks`);

  await loadFFmpeg();

  ffmpeg.FS('writeFile', 'input.mp3', await fetchFile(file));

  await ffmpeg.run(
    '-i', 'input.mp3',
    '-f', 'segment',
    '-segment_time', String(maxDurationSec),
    '-c', 'copy',
    'chunk_%03d.mp3'
  );

  const chunks: Blob[] = [];
  let index = 0;
  while (true) {
    const name = `chunk_${index.toString().padStart(3, '0')}.mp3`;
    try {
      const data = ffmpeg.FS('readFile', name);
      chunks.push(new File([data.buffer], name, { type: 'audio/mpeg' }));
      ffmpeg.FS('unlink', name);
      index++;
    } catch {
      break;
    }
  let segmentTime = 600; // Starte mit 10 Minuten
  let attempts = 0;
  let chunks: File[] = [];

  while (attempts < 5) {
    await ffmpeg.run(
      '-i',
      'input.mp3',
      '-f',
      'segment',
      '-segment_time',
      String(segmentTime),
      '-c',
      'copy',
      'chunk_%03d.mp3'
    );

    chunks = [];
    let index = 0;
    let oversize = false;

    while (true) {
      const name = `chunk_${index.toString().padStart(3, '0')}.mp3`;
      try {
        const data = ffmpeg.FS('readFile', name);
        const chunkFile = new File([data.buffer], name, { type: 'audio/mpeg' });
        if (chunkFile.size > maxSizeInMB * 1024 * 1024) {
          oversize = true;
        }
        chunks.push(chunkFile);
        ffmpeg.FS('unlink', name);
        index++;
      } catch {
        break;
      }
    }

    if (!oversize) {
      break;
    }

    // Falls ein Chunk zu groß ist, verringere die Segmentdauer und versuche es erneut
    chunks.forEach((c) => {
      try {
        ffmpeg.FS('unlink', c.name);
      } catch {
        // ignore
      }
    });

    segmentTime = Math.max(Math.floor(segmentTime / 2), 60); // mindestens 1 Minute
    attempts++;
  await ffmpeg.run(
    '-i', 'input.mp3',
    '-f', 'segment',
    '-segment_time', String(maxDurationSec),
    '-c', 'copy',
    'chunk_%03d.mp3'
  );

  const chunks: Blob[] = [];
  let index = 0;
  while (true) {
    const name = `chunk_${index.toString().padStart(3, '0')}.mp3`;
    try {
      const data = ffmpeg.FS('readFile', name);
      chunks.push(new File([data.buffer], name, { type: 'audio/mpeg' }));
      ffmpeg.FS('unlink', name);
      index++;
    } catch {
      break;
    }
  }

  ffmpeg.FS('unlink', 'input.mp3');

  console.log(`Erfolgreich in ${chunks.length} Chunks aufgeteilt`);
  return chunks.length > 0 ? chunks : [file];
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
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > 500) {
    console.warn(`Sehr große Datei (${Math.round(fileSizeInMB)} MB) - Die Verarbeitung kann einige Zeit dauern`);
  }

  if (file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')) {
    return file;
  }

  await loadFFmpeg();

  ffmpeg.FS('writeFile', 'input', await fetchFile(file));
  await ffmpeg.run('-i', 'input', '-ar', '44100', 'output.mp3');
  const data = ffmpeg.FS('readFile', 'output.mp3');

  ffmpeg.FS('unlink', 'input');
  ffmpeg.FS('unlink', 'output.mp3');

  return new File([data.buffer], file.name.replace(/\.[^/.]+$/, '.mp3'), { type: 'audio/mpeg' });
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
