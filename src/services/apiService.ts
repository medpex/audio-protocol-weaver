
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
    const formData = new FormData();
    formData.append('file', file);
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
      throw new Error(errorData.error?.message || `Error: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
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
      throw new Error(errorData.error?.message || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No content returned';
  } catch (error) {
    console.error('Protocol generation error:', error);
    throw error;
  }
};

export { generateId };
