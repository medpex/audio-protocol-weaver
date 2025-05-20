# AudioProtokoll

AudioProtokoll ist eine kleine Webanwendung zum Erstellen von Besprechungsprotokollen. Sie lädt eine Audiodatei hoch, transkribiert sie über den OpenAI Whisper‑Dienst und generiert daraus ein strukturiertes Protokoll mit Hilfe von GPT‑4.

## Installation

1. Repository klonen und Abhängigkeiten installieren
   ```bash
   npm install
   ```
2. Entwicklungsserver starten
   ```bash
   npm run dev
   ```
   Anschließend ist die Anwendung unter `http://localhost:5173` erreichbar.

## OpenAI API‑Schlüssel

Der benötigte OpenAI API‑Schlüssel wird im Einstellungsmenü eingegeben und im `localStorage` Ihres Browsers gespeichert. Achten Sie darauf, diesen Schlüssel vertraulich zu behandeln und nicht mit anderen zu teilen.

## Anwendung bauen

Für eine Produktionsversion führen Sie aus:

```bash
npm run build
```

Das gebaute Projekt befindet sich anschließend im Ordner `dist` und kann von einem beliebigen Webserver ausgeliefert werden.

## Hinweise zum Datenschutz

Alle Transkriptionen und generierten Protokolle verbleiben in Ihrem Browser. Es werden keine Daten an andere Server als die OpenAI‑API gesendet. Der API‑Schlüssel wird lokal gespeichert und kann jederzeit über die Einstellungen gelöscht werden.
