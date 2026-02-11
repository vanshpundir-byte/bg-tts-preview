import React, { useEffect, useId, useRef, useState } from 'react';

const ORB_SHAPES = [
  "M 100 600 q 0 -500, 500 -500 t 500 500 t -500 500 T 100 600 z",
  "M 100 600 q -50 -400, 500 -500 t 450 550 t -500 500 T 100 600 z",
  "M 100 600 q 0 -400, 500 -500 t 400 500 t -500 500 T 100 600 z",
  "M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z",
  "M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z",
  "M 100 600 q 100 -600, 500 -500 t 400 500 t -500 500 T 100 600 z"
];
const ORB_VALUES = ORB_SHAPES.map((_, index) => {
  const rotated = [
    ...ORB_SHAPES.slice(index),
    ...ORB_SHAPES.slice(0, index),
    ORB_SHAPES[index]
  ];
  return rotated.join(';');
});

interface LogoVisualizerProps {
  audioElementRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

const LogoVisualizer: React.FC<LogoVisualizerProps> = ({ audioElementRef, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number>(0);
  const brandColorsRef = useRef({ blue: '5, 83, 156', orange: '245, 146, 34' });
  const pulseRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const glowRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const [orbColors, setOrbColors] = useState({
    blue: '5, 83, 156',
    blueSoft: '43, 93, 137',
    orange: '245, 146, 34',
    silver: '214, 221, 232'
  });
  const orbIdRaw = useId();
  const orbId = orbIdRaw.replace(/[^a-zA-Z0-9_-]/g, '');
  const lastFrameRef = useRef<{
    energy: number;
    data: Uint8Array;
    time: number;
    pulse: number;
    scale: number;
  } | null>(null);
  const fadeStartRef = useRef<number | null>(null);
  const fadeDurationRef = useRef(550);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const styles = getComputedStyle(document.documentElement);
      const normalize = (value: string) =>
        value ? value.trim().replace(/\s+/g, ', ') : '';
      const blue = normalize(styles.getPropertyValue('--brand-blue'));
      const blueSoft = normalize(styles.getPropertyValue('--brand-blue-2'));
      const orange = normalize(styles.getPropertyValue('--brand-orange'));
      if (blue) brandColorsRef.current.blue = blue;
      if (orange) brandColorsRef.current.orange = orange;
      setOrbColors((prev) => ({
        ...prev,
        blue: blue || prev.blue,
        blueSoft: blueSoft || prev.blueSoft,
        orange: orange || prev.orange
      }));
    }
  }, []);

  useEffect(() => {
    const initAudioContext = () => {
      if (!audioElementRef.current || audioContextRef.current) return;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128; 
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

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (isPlaying) {
      if (!audioContextRef.current) initAudioContext();
      if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
      lastTimeRef.current = performance.now();
      animate();
    } else {
      startFadeOut();
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const setGlow = (value: number) => {
    if (!glowRef.current) return;
    const clamped = Math.max(0, Math.min(1, value));
    glowRef.current.style.opacity = clamped.toFixed(3);
  };

  const setShine = (value: number) => {
    if (!shineRef.current) return;
    const clamped = Math.max(0, Math.min(1, value));
    shineRef.current.style.opacity = clamped.toFixed(3);
  };

  const setOrb = (scale: number, opacity: number) => {
    if (!orbRef.current) return;
    const clamped = Math.max(0, Math.min(1, opacity));
    orbRef.current.style.opacity = clamped.toFixed(3);
    orbRef.current.style.transform = `scale(${scale.toFixed(3)})`;
  };

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

    const data = dataArrayRef.current;
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        const weight = 0.6 + (i / data.length);
        sum += data[i] * weight;
    }
    const average = sum / data.length;
    const rawEnergy = Math.min(1, average / 200);

    const now = performance.now();
    const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000 || 0.016);
    lastTimeRef.current = now;

    const idleEnergy = 0.08 + 0.04 * Math.sin(now * 0.002);
    const energy = Math.max(rawEnergy, idleEnergy);

    const stiffness = 12;
    const damping = 0.82;
    velocityRef.current += (energy - pulseRef.current) * stiffness * dt;
    velocityRef.current *= Math.pow(damping, dt * 60);
    pulseRef.current += velocityRef.current;

    const targetScale = 1;

    const playingDim = 0.8;
    const glow = 0.12 + energy * 0.7 + pulseRef.current * 0.1;
    setGlow(glow * playingDim);
    setShine((0.12 + energy * 0.65 + pulseRef.current * 0.1) * playingDim);
    setOrb(0.95 + energy * 0.55 + pulseRef.current * 0.22, (0.3 + energy * 0.6) * playingDim);

    lastFrameRef.current = {
      energy,
      data: new Uint8Array(data),
      time: now,
      pulse: pulseRef.current,
      scale: targetScale
    };

    drawParticles(energy, data, now, pulseRef.current, playingDim);
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const startFadeOut = () => {
    if (!lastFrameRef.current) {
      pulseRef.current = 0;
      velocityRef.current = 0;
      setGlow(0);
      setShine(0);
      setOrb(1, 0.12);
      clearCanvas();
      return;
    }

    fadeStartRef.current = performance.now();
    const fadeLoop = () => {
      if (!fadeStartRef.current || !lastFrameRef.current) return;
      const now = performance.now();
      const elapsed = now - fadeStartRef.current;
      const progress = Math.min(1, elapsed / fadeDurationRef.current);
      const alpha = 1 - progress;

      const frame = lastFrameRef.current;
      drawParticles(frame.energy, frame.data, now, frame.pulse, alpha);
      setGlow((0.12 + frame.energy * 0.7 + frame.pulse * 0.1) * alpha);
      setShine((0.12 + frame.energy * 0.65 + frame.pulse * 0.1) * alpha);
      setOrb(
        0.95 + frame.energy * 0.55 + frame.pulse * 0.22,
        (0.3 + frame.energy * 0.6) * alpha
      );

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(fadeLoop);
      } else {
        fadeStartRef.current = null;
        pulseRef.current = 0;
        velocityRef.current = 0;
        setGlow(0);
        setShine(0);
        setOrb(1, 0.12);
        clearCanvas();
      }
    };

    fadeLoop();
  };

  const drawParticles = (energy: number, data: Uint8Array, time: number, pulse: number, alpha = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const { blue, orange } = brandColorsRef.current;
    const parseRgb = (value: string) =>
      value.split(',').map((v) => Number(v.trim()));
    const [br, bg, bb] = parseRgb(blue);
    const [or, og, ob] = parseRgb(orange);

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.lineCap = 'round';

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const particles = 120;
    const base = 140 + energy * 28 + pulse * 10;
    const drift = 10 + energy * 16;
    for (let i = 0; i < particles; i++) {
      const t = i / particles;
      const angle = t * Math.PI * 2 + time * 0.0011;
      const dataIndex = Math.floor(t * data.length);
      const amp = data[dataIndex] / 255;
      const radius = base + amp * (26 + energy * 24) + Math.sin(time * 0.001 + i) * drift;
      const jitter = Math.sin(time * 0.002 + i * 1.7) * 2;
      const x = centerX + Math.cos(angle) * radius + Math.cos(angle * 3) * jitter;
      const y = centerY + Math.sin(angle) * radius + Math.sin(angle * 2) * jitter;
      const mix = (Math.sin(angle + time * 0.0008) + 1) / 2;
      const r = Math.round(br + (or - br) * mix);
      const g = Math.round(bg + (og - bg) * mix);
      const b = Math.round(bb + (ob - bb) * mix);
      const size = 1.6 + amp * 3.2;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.14 + amp * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  };

  return (
    <div className="relative flex items-center justify-center w-[256px] h-[256px]">
      <canvas 
        ref={canvasRef} 
        width={576} 
        height={576} 
        className="absolute inset-[-160px] z-0 pointer-events-none"
      />
      
      {/* Wave gradients + mood orb */}
      <div className="relative z-10 w-full h-full">
        <div
          ref={orbRef}
          className="absolute inset-[-30%] pointer-events-none"
          style={{ opacity: 0.18, transform: 'scale(1)' }}
        >
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 1200 1200"
            role="presentation"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id={`orb-core-${orbId}`} cx="50%" cy="42%" r="60%">
                <stop offset="0%" stopColor={`rgba(${orbColors.blue}, 0.9)`} />
                <stop offset="55%" stopColor={`rgba(${orbColors.blueSoft}, 0.55)`} />
                <stop offset="100%" stopColor={`rgba(${orbColors.orange}, 0.3)`} />
              </radialGradient>
              <radialGradient id={`orb-glow-${orbId}`} cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor={`rgba(${orbColors.blue}, 0.28)`} />
                <stop offset="55%" stopColor={`rgba(${orbColors.blueSoft}, 0.55)`} />
                <stop offset="100%" stopColor={`rgba(${orbColors.orange}, 0.35)`} />
              </radialGradient>
              <radialGradient id={`orb-sheen-${orbId}`} cx="42%" cy="38%" r="35%">
                <stop offset="0%" stopColor={`rgba(${orbColors.silver}, 0.95)`} />
                <stop offset="60%" stopColor={`rgba(${orbColors.silver}, 0.15)`} />
                <stop offset="100%" stopColor={`rgba(${orbColors.silver}, 0)`} />
              </radialGradient>
              <filter id={`orb-blur-lg-${orbId}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
              <filter id={`orb-blur-md-${orbId}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
              <filter id={`orb-blur-sm-${orbId}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            <g opacity="0.95">
              <path
                fill={`url(#orb-glow-${orbId})`}
                filter={`url(#orb-blur-lg-${orbId})`}
              >
                <animate attributeName="d" dur="14s" repeatCount="indefinite" values={ORB_VALUES[0]} />
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 600 600"
                  to="360 600 600"
                  dur="36s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
            <g opacity="0.9">
              <path
                fill={`rgba(${orbColors.blueSoft}, 0.82)`}
                filter={`url(#orb-blur-md-${orbId})`}
              >
                <animate attributeName="d" dur="11s" repeatCount="indefinite" values={ORB_VALUES[2]} />
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 600 600"
                  to="-360 600 600"
                  dur="28s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
            <g opacity="0.88">
              <path
                fill={`rgba(${orbColors.orange}, 0.78)`}
                filter={`url(#orb-blur-sm-${orbId})`}
              >
                <animate attributeName="d" dur="9s" repeatCount="indefinite" values={ORB_VALUES[4]} />
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 600 600"
                  to="360 600 600"
                  dur="22s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
            <g opacity="0.75" style={{ mixBlendMode: 'screen' }}>
              <circle
                cx="540"
                cy="420"
                r="270"
                fill={`url(#orb-sheen-${orbId})`}
              />
            </g>
          </svg>
        </div>
        <div
          ref={glowRef}
          className="absolute inset-[-8%] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(220,225,235,0.7) 0%, rgba(200,205,215,0.35) 40%, rgba(160,170,185,0.12) 70%, rgba(160,170,185,0) 100%)',
            filter: 'blur(12px)',
            opacity: 0
          }}
        />
        <div
          ref={shineRef}
          className="absolute inset-[-25%] rounded-full pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(255,255,255,0) 0%, rgba(150,190,255,0.25) 25%, rgba(255,255,255,0.55) 40%, rgba(255,255,255,0) 60%, rgba(150,190,255,0.2) 80%, rgba(255,255,255,0) 100%)',
            filter: 'blur(20px)',
            opacity: 0
          }}
        />
      </div>
    </div>
  );
};

export default LogoVisualizer;
