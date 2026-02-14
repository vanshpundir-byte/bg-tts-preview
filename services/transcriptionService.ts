const blobToBase64 = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const transcribeAudio = async (
  file: Blob,
  languageHint?: string
): Promise<string> => {
  const apiUrl = (import.meta.env.VITE_WHISPER_API_URL as string | undefined) || '/api/whisper';

  const audioBase64 = await blobToBase64(file);
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audio_base64: audioBase64,
      language: languageHint || 'auto'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Whisper API error: ${response.status}`);
  }

  const data = await response.json();
  return (data?.text || '').trim();
};
