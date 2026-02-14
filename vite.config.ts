import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const ttsTarget = env.TTS_API_TARGET || 'http://https://822d-65-1-235-80.ngrok-free.app';
    const whisperTarget = env.WHISPER_API_TARGET || 'http://localhost:8001';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: [
          'difference-bell-alternate-columnists.trycloudflare.com',
        ],
        proxy: {
          '/api/tts': {
            target: ttsTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api\/tts/, '/v1/tts'),
          },
          '/api/whisper': {
            target: whisperTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api\/whisper/, '/transcribe'),
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
