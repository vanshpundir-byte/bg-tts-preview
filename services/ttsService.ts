import { API_URL } from '../constants';
import { TTSRequest, TTSResponse } from '../types';

export const fileToBase64 = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g., "data:audio/wav;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateSpeech = async (payload: TTSRequest): Promise<string> => {
  // If language is English, use 'en'. Otherwise default to 'hi'.
  const queryLang = payload.lang === 'en' ? 'en' : 'hi';

  try {
    const response = await fetch(`${API_URL}?lang=${queryLang}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref_audio_base64: payload.ref_audio_base64,
        ref_text: payload.ref_text,
        gen_text: payload.gen_text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data: TTSResponse = await response.json();
    
    if (!data.audio_base64) {
      throw new Error("No audio data received from server");
    }

    // Convert base64 back to a blob URL for playback
    const binaryString = window.atob(data.audio_base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("TTS Generation failed:", error);
    throw error;
  }
};
