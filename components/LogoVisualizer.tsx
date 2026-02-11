import React, { useEffect, useRef, useState } from 'react';
import { LOGO_URL } from '../constants';

interface LogoVisualizerProps {
  audioElementRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

const LogoVisualizer: React.FC<LogoVisualizerProps> = ({ audioElementRef, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const initAudioContext = () => {
      if (!audioElementRef.current || audioContextRef.current) return;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64; 
      analyserRef.current = analyser;

      try {
        const source = ctx.createMediaElementSource(audioElementRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        
        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
      } catch (e) {
        console.warn("MediaElementSource already connected or CORS issue", e);
      }
    };

    if (isPlaying) {
      if (!audioContextRef.current) initAudioContext();
      if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
      animate();
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setScale(1);
      clearCanvas();
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
  }

  const animate = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    let sum = 0;
    const data = dataArrayRef.current;
    // Calculate volume average
    for (let i = 0; i < data.length; i++) {
        sum += data[i];
    }
    const average = sum / data.length;
    
    // Scale logo slightly
    const targetScale = 1 + (average / 256) * 0.15; 
    setScale(prev => prev + (targetScale - prev) * 0.2);

    drawRings(average);
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const drawRings = (intensity: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Don't draw if silent
    if (intensity < 5) return;

    // Outer Ring (Blue)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 55 + (intensity / 4), 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(37, 99, 235, ${(intensity / 255) * 0.5})`; // Blue-600 with opacity
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner Ring (Orange)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50 + (intensity / 3), 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(249, 115, 22, ${(intensity / 255) * 0.8})`; // Orange-500
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  return (
    <div className="relative flex items-center justify-center w-[120px] h-[120px]">
      <canvas 
        ref={canvasRef} 
        width={200} 
        height={200} 
        className="absolute inset-[-40px] z-0 pointer-events-none"
      />
      
      {/* The Logo */}
      <div 
        className="relative z-10 transition-transform duration-75 ease-out rounded-full bg-white shadow-sm p-1"
        style={{ transform: `scale(${scale})` }}
      >
        <img 
            src={LOGO_URL} 
            alt="Logo" 
            className="w-16 h-16 object-contain"
        />
      </div>
    </div>
  );
};

export default LogoVisualizer;