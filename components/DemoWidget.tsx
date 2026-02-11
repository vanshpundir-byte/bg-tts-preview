import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Loader2, FileAudio, Zap, Globe, ChevronDown, Check, X, RefreshCw } from 'lucide-react';
import { generateSpeech, fileToBase64 } from '../services/ttsService';
import { transcribeAudio } from '../services/transcriptionService';
import { LANGUAGE_DEMOS } from '../constants';
import { BharatGenVoice } from '../types';
import LogoVisualizer from './LogoVisualizer';


const DemoWidget: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'clone' | 'bharatgen'>('clone');
  const [selectedLang, setSelectedLang] = useState(LANGUAGE_DEMOS[0]);
  const [selectedDemoIdx, setSelectedDemoIdx] = useState(0);
  const [cloneSelectedLang, setCloneSelectedLang] = useState(LANGUAGE_DEMOS[0]);
  const [cloneSelectedDemoIdx, setCloneSelectedDemoIdx] = useState(0);
  const [cloneRefFile, setCloneRefFile] = useState<File | null>(null);
  const [cloneRefText, setCloneRefText] = useState('');
  const [cloneRefSource] = useState<'upload'>('upload');
  const [cloneUploadFile, setCloneUploadFile] = useState<File | null>(null);
  const [bharatgenVoices, setBharatgenVoices] = useState<BharatGenVoice[]>([]);
  const [bharatgenError, setBharatgenError] = useState<string | null>(null);
  const [bharatgenSelectedId, setBharatgenSelectedId] = useState<string | null>(null);
  const [bharatgenRefFile, setBharatgenRefFile] = useState<File | null>(null);
  const [bharatgenRefText, setBharatgenRefText] = useState('');
  const [genText, setGenText] = useState(LANGUAGE_DEMOS[0].demos[0].actual_text);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [autoGeneratePending, setAutoGeneratePending] = useState(false);
  const [refPreviewUrl, setRefPreviewUrl] = useState<string | null>(null);
  const [isRefPlaying, setIsRefPlaying] = useState(false);
  const [generationMs, setGenerationMs] = useState<number | null>(null);
  const generateStartRef = useRef<number | null>(null);
  
  // UI State
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isBharatgenOpen, setIsBharatgenOpen] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const refPreviewRef = useRef<HTMLAudioElement>(null);
  const activeRefFile = activeTab === 'clone' ? cloneRefFile : bharatgenRefFile;
  const activeRefText = activeTab === 'clone' ? cloneRefText : bharatgenRefText;
  const activeRefSource = activeTab === 'clone' ? cloneRefSource : 'bharatgen';

  // Effects
  useEffect(() => {
    setGenText(selectedLang.demos[selectedDemoIdx].actual_text);
  }, [selectedLang, selectedDemoIdx]);

  const resolveAssetUrl = (url: string) => {
    if (/^https?:\/\//.test(url)) return url;
    const base = (import.meta as any).env?.BASE_URL || '/';
    return `${base}${url.replace(/^\//, '')}`;
  };

  const loadAudioAsFile = async (url: string, filename: string) => {
    const resolvedUrl = resolveAssetUrl(url);
    const response = await fetch(resolvedUrl);
    if (!response.ok) {
      throw new Error(`Audio not found (${response.status})`);
    }
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || 'audio/wav' });
  };

  useEffect(() => {
    if (activeTab !== 'clone') return;
    setCloneSelectedLang(selectedLang);
    setCloneSelectedDemoIdx(selectedDemoIdx);
  }, [activeTab, selectedLang, selectedDemoIdx]);

  useEffect(() => {
    if (activeTab !== 'clone') return;
    setSelectedLang(cloneSelectedLang);
    setSelectedDemoIdx(cloneSelectedDemoIdx);
  }, [activeTab, cloneSelectedLang, cloneSelectedDemoIdx]);


  useEffect(() => {
    let isActive = true;
    const loadVoices = async () => {
      try {
        setBharatgenError(null);
        const response = await fetch(resolveAssetUrl('/bharatgen-voices.json'));
        if (!response.ok) {
          throw new Error(`Failed to load voices (${response.status})`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid voices data');
        }
        if (!isActive) return;
        setBharatgenVoices(data as BharatGenVoice[]);
        if (!bharatgenSelectedId && data.length > 0) {
          setBharatgenSelectedId(data[0].id);
        }
      } catch (err: any) {
        if (!isActive) return;
        setBharatgenError(err?.message || 'Failed to load BharatGen voices');
      }
    };
    loadVoices();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!bharatgenSelectedId) return;
    const selected = bharatgenVoices.find((voice) => voice.id === bharatgenSelectedId);
    if (!selected) return;

    let isActive = true;
    const loadVoice = async () => {
      try {
        setBharatgenError(null);
        setBharatgenRefText(selected.refText || '');
        const file = await loadAudioAsFile(selected.audioUrl, `${selected.id}.wav`);
        if (!isActive) return;
        setBharatgenRefFile(file);
      } catch (err: any) {
        if (!isActive) return;
        setBharatgenError(err?.message || 'Failed to load voice');
      }
    };
    loadVoice();

    if (activeTab === 'bharatgen') {
      const matchingLang = LANGUAGE_DEMOS.find((lang) => lang.id === selected.languageId);
      if (matchingLang) {
        setSelectedLang(matchingLang);
        setSelectedDemoIdx(0);
      }
    }

    return () => {
      isActive = false;
    };
  }, [bharatgenSelectedId, bharatgenVoices, activeTab]);

  // Auto-play when audio is generated
  useEffect(() => {
    if (generatedAudioUrl && audioRef.current) {
        audioRef.current.play().catch(() => {
            // Auto-play might be blocked by browser
        });
        setIsPlaying(true);
    }
  }, [generatedAudioUrl]);

  useEffect(() => {
    if (!activeRefFile) {
      setRefPreviewUrl(null);
      setIsRefPlaying(false);
      return;
    }
    const url = URL.createObjectURL(activeRefFile);
    setRefPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [activeRefFile]);

  useEffect(() => {
    if (!autoGeneratePending) return;
    if (isTranscribing || isLoading) return;
    if (activeTab !== 'clone') return;
    if (!activeRefFile || !activeRefText.trim()) return;
    setAutoGeneratePending(false);
    handleGenerate();
  }, [autoGeneratePending, isTranscribing, isLoading, activeRefFile, activeRefText, activeTab]);

  useEffect(() => {
    if (!isLoading) return;
    const start = generateStartRef.current ?? performance.now();
    generateStartRef.current = start;
    const tick = () => setGenerationMs(performance.now() - start);
    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setActiveTab('clone');
      setCloneRefFile(file);
      setCloneUploadFile(file);
      setCloneRefText('');
      setTranscriptionError(null);
      setError(null);
      setAutoGeneratePending(true);

      setIsTranscribing(true);
      transcribeAudio(file, selectedLang.id)
        .then((text) => {
          setCloneRefText(text || '');
        })
        .catch((err: any) => {
          setTranscriptionError(err?.message || 'Transcription failed');
          setAutoGeneratePending(false);
        })
        .finally(() => {
          setIsTranscribing(false);
        });
    }
  };

  const handleGenerate = async () => {
    if (activeTab === 'clone' && isTranscribing) {
        setError("Transcription in progress");
        return;
    }
    if (!activeRefFile) {
        setError(activeTab === 'bharatgen' ? "Select a BharatGen voice first" : "Upload a voice sample first");
        return;
    }
    if (!activeRefText.trim()) {
        setError("Reference text is required");
        return;
    }
    if (!genText.trim()) {
        setError("Enter text to generate");
        return;
    }

    setError(null);
    setIsLoading(true);
    setGenerationMs(0);
    generateStartRef.current = performance.now();
    // Stop current audio if playing
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    setGeneratedAudioUrl(null);

    try {
      const audioBase64 = await fileToBase64(activeRefFile);
      const url = await generateSpeech({
        ref_audio_base64: audioBase64,
        ref_text: activeRefText,
        gen_text: genText,
        lang: selectedLang.id
      });
      setGeneratedAudioUrl(url);
      if (generateStartRef.current) {
        setGenerationMs(performance.now() - generateStartRef.current);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate speech.");
      setIsLoading(false);
    } finally {
        if (!generatedAudioUrl) setIsLoading(false); // Only set loading false here if error, otherwise wait for audio load
    }
  };

  const onAudioLoadStart = () => setIsLoading(true);
  const onAudioLoadedData = () => setIsLoading(false);

  const togglePlay = () => {
    if (!audioRef.current || !generatedAudioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const toggleRefPlay = () => {
    if (!refPreviewRef.current || !refPreviewUrl) return;
    if (isRefPlaying) {
      refPreviewRef.current.pause();
    } else {
      refPreviewRef.current.play();
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (refPreviewRef.current) {
      refPreviewRef.current.pause();
      refPreviewRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsRefPlaying(false);
  };

  const handleTabChange = (tab: 'clone' | 'bharatgen') => {
    if (tab === activeTab) return;
    stopPlayback();
    setActiveTab(tab);
    setError(null);
    setTranscriptionError(null);
    setIsLangOpen(false);
    setIsBharatgenOpen(false);
    setAutoGeneratePending(false);
  };

  const isGenerateDisabled =
    isLoading || (activeTab === 'clone' && isTranscribing) || !activeRefFile;

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[600px] bg-white">
        
      {/* --- LEFT COLUMN: INPUT CANVAS --- */}
      <div className="flex-1 flex flex-col p-6 md:p-10 relative">
        
        {/* Top Tabs */}
        <div className="flex items-center gap-2 mb-6">
            <button
                onClick={() => handleTabChange('clone')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'clone'
                    ? 'bg-[color:rgb(var(--brand-blue)/0.12)] text-[color:rgb(var(--brand-blue))] shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:text-[color:rgb(var(--brand-blue))]'
                }`}
            >
                <Zap size={14} className="text-[color:rgb(var(--brand-orange))] fill-[color:rgb(var(--brand-orange))]" />
                Voice Cloning
            </button>
            <button
                onClick={() => handleTabChange('bharatgen')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === 'bharatgen'
                    ? 'bg-[color:rgb(var(--brand-orange)/0.12)] text-[color:rgb(var(--brand-orange))] shadow-sm'
                    : 'bg-slate-50 text-slate-500 hover:text-[color:rgb(var(--brand-orange))]'
                }`}
            >
                BharatGen Voices
            </button>
        </div>

        {/* Text Input Area */}
        <div className="relative group">
            <textarea
                value={genText}
                onChange={(e) => setGenText(e.target.value)}
                placeholder="Type something here to generate speech..."
                className="w-full h-[120px] md:h-[140px] lg:h-[150px] resize-none text-base md:text-lg font-light text-slate-800 placeholder:text-slate-300 outline-none bg-transparent leading-relaxed"
                maxLength={300}
                spellCheck={false}
            />
            {/* Character Count */}
            <div className="absolute bottom-0 right-0 text-xs text-slate-300 font-medium">
                {genText.length}/300
            </div>
        </div>

        {/* Visualizer */}
        <div className="mt-12 mb-10 flex flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center px-2 py-1 rounded-full">
                <div
                    className="absolute inset-0 rounded-full blur-3xl opacity-70 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(var(--brand-orange), 0.35) 0%, rgba(var(--brand-blue), 0.28) 45%, rgba(255,255,255,0) 72%)'
                    }}
                />
            <div className="relative">
                <LogoVisualizer audioElementRef={audioRef} isPlaying={isLoading || isPlaying} />
            </div>
        </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                <div className="flex flex-col gap-2">
                    {error ? (
                        <div className="text-red-500 text-sm font-medium px-4 py-2 bg-red-50 rounded-lg animate-fade-in">
                            {error}
                        </div>
                    ) : (
                        <div className="text-slate-400 text-sm flex items-center gap-2">
                           {generatedAudioUrl && <Check size={16} className="text-green-500" />}
                           {isLoading
                             ? "Generating audio..."
                             : generatedAudioUrl
                               ? "Audio generated successfully"
                               : "Ready to generate"}
                           {(isLoading || generatedAudioUrl) && generationMs !== null && (
                             <span className="text-[11px] text-slate-400 flex items-center gap-1">
                               ⚡ { (generationMs / 1000).toFixed(2) }s
                             </span>
                           )}
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        {generatedAudioUrl && (
                            <button 
                                onClick={togglePlay}
                                className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors flex items-center gap-2"
                            >
                                {isPlaying ? "Pause" : "Replay"}
                            </button>
                        )}
                        {!generatedAudioUrl && !isLoading && (
                             <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                Waiting for input
                             </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerateDisabled}
                    className={`
                        group relative px-8 py-4 rounded-full font-bold text-white shadow-lg transition-all duration-300
                        flex items-center gap-3 overflow-hidden
                        ${isGenerateDisabled 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                            : 'bg-gradient-to-r from-[color:rgb(var(--brand-orange))] to-[color:rgb(var(--brand-blue))] hover:scale-105 hover:shadow-[0_20px_40px_-20px_rgb(var(--brand-orange)/0.6)]'}
                    `}
                >
                    {/* Gradient animation overlay */}
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    
                    {isLoading ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                        <div className="bg-white rounded-full p-1">
                             <Play size={12} className="text-[color:rgb(var(--brand-orange))] fill-[color:rgb(var(--brand-orange))] translate-x-0.5" />
                        </div>
                    )}
                    <span>Generate Speech</span>
                </button>
            </div>

            <audio 
                ref={audioRef}
                src={generatedAudioUrl || undefined}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onLoadStart={onAudioLoadStart}
                onLoadedData={onAudioLoadedData}
                onError={() => {
                    setIsLoading(false);
                    setError('Failed to load generated audio');
                }}
            />
            <audio
                ref={refPreviewRef}
                src={refPreviewUrl || undefined}
                onPlay={() => setIsRefPlaying(true)}
                onPause={() => setIsRefPlaying(false)}
                onEnded={() => setIsRefPlaying(false)}
            />
        </div>
      </div>


      {/* --- RIGHT COLUMN: SETTINGS SIDEBAR --- */}
      <div className="w-full lg:w-[400px] bg-slate-50/50 border-l border-slate-100 p-6 md:p-8 flex flex-col gap-8">

        {/* Settings Form */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {activeTab === 'clone' ? 'Reference Voice' : 'BharatGen Voices'}
                </label>
            </div>

            {activeTab === 'clone' ? (
                <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Custom Upload</label>
                        {!cloneUploadFile ? (
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    accept=".wav"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="h-20 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 group-hover:bg-[color:rgb(var(--brand-orange)/0.12)] group-hover:border-[color:rgb(var(--brand-orange)/0.4)] transition-all flex flex-col items-center justify-center gap-1">
                                    <Upload className="text-slate-400 group-hover:text-[color:rgb(var(--brand-orange))] transition-colors" size={20} />
                                    <span className="text-xs font-medium text-slate-500 group-hover:text-[color:rgb(var(--brand-orange))]">Upload Reference Voice (.wav)</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-white border border-[color:rgb(var(--brand-orange)/0.4)] rounded-xl shadow-sm flex items-center justify-between gap-3">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-full bg-[color:rgb(var(--brand-orange)/0.16)] flex items-center justify-center text-[color:rgb(var(--brand-orange))]">
                                         <FileAudio size={20} />
                                     </div>
                                     <div className="flex flex-col">
                                         <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">
                                            {cloneUploadFile.name}
                                         </span>
                                         <span className="text-[10px] text-slate-400">
                                            Custom Voice
                                         </span>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    {refPreviewUrl && (
                                        <button
                                            onClick={toggleRefPlay}
                                            className="h-7 w-7 rounded-full bg-[color:rgb(var(--brand-blue)/0.12)] text-[color:rgb(var(--brand-blue))] flex items-center justify-center hover:bg-[color:rgb(var(--brand-blue)/0.2)] transition-colors"
                                            title={isRefPlaying ? 'Pause reference' : 'Play reference'}
                                        >
                                            {isRefPlaying ? <Pause size={12} /> : <Play size={12} className="translate-x-[1px]" />}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                          setCloneUploadFile(null);
                                          setCloneRefFile(null);
                                          setCloneRefText('');
                                        }}
                                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                         <X size={16} />
                                    </button>
                                 </div>
                            </div>
                        )}
                </div>
            ) : (
                <div className="space-y-3">
                    {bharatgenError && (
                        <div className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                            {bharatgenError}
                        </div>
                    )}
                    <div className="relative">
                        <button
                            onClick={() => setIsBharatgenOpen((prev) => !prev)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between hover:border-[color:rgb(var(--brand-blue))] transition-colors"
                        >
                            <div className="text-left">
                                <div className="text-sm font-bold text-slate-700">
                                    {bharatgenVoices.find((voice) => voice.id === bharatgenSelectedId)?.name || 'Select a voice'}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    {bharatgenVoices.find((voice) => voice.id === bharatgenSelectedId)?.languageName || 'Select language'}
                                </div>
                            </div>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isBharatgenOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isBharatgenOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto p-1">
                                {bharatgenVoices.map((voice) => {
                                    const isSelected = voice.id === bharatgenSelectedId;
                                    return (
                                        <button
                                            key={voice.id}
                                            onClick={() => {
                                                setBharatgenSelectedId(voice.id);
                                                setIsBharatgenOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                                                isSelected
                                                  ? 'bg-[color:rgb(var(--brand-blue)/0.12)] text-[color:rgb(var(--brand-blue))]'
                                                  : 'hover:bg-slate-50 text-slate-600'
                                            }`}
                                        >
                                            <span className="font-semibold">{voice.name}</span>
                                            <span className="text-[10px] text-slate-400">{voice.languageName}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    {activeRefSource === 'bharatgen' && refPreviewUrl && (
                        <button
                            onClick={toggleRefPlay}
                            className="mt-1 inline-flex items-center gap-2 text-[11px] text-[color:rgb(var(--brand-blue))] hover:text-[color:rgb(var(--brand-orange))] transition-colors"
                        >
                            {isRefPlaying ? <Pause size={12} /> : <Play size={12} />}
                            Preview selected voice
                        </button>
                    )}
                </div>
            )}

            {/* Transcript Input */}
            <div className="pt-2">
                <input 
                    type="text"
                    value={activeRefText}
                    onChange={(e) => {
                        if (activeTab === 'clone') {
                            setCloneRefText(e.target.value);
                        } else {
                            setBharatgenRefText(e.target.value);
                        }
                    }}
                    placeholder={activeTab === 'clone' ? 'Transcription will appear here...' : 'Reference transcript'}
                    disabled={activeTab === 'clone' && isTranscribing}
                    className="w-full text-xs bg-slate-100 border-none rounded-lg px-3 py-2 text-slate-600 focus:ring-1 focus:ring-[color:rgb(var(--brand-orange))] placeholder-slate-400 disabled:opacity-70"
                />
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 pl-1">
                    <span>*Required for accurate cloning style matching</span>
                    {activeTab === 'clone' && isTranscribing && (
                        <span className="text-[color:rgb(var(--brand-blue))]">Transcribing with Whisper...</span>
                    )}
                    {activeTab === 'clone' && !isTranscribing && transcriptionError && (
                        <span className="text-red-500">{transcriptionError}</span>
                    )}
                    {activeTab === 'bharatgen' && (
                        <span>Preset transcript</span>
                    )}
                </div>
            </div>

            {/* 2. Language Selector */}
            {activeTab === 'clone' ? (
                <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Output Language</label>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between hover:border-[color:rgb(var(--brand-blue))] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[color:rgb(var(--brand-blue)/0.12)] text-[color:rgb(var(--brand-blue))] flex items-center justify-center">
                                    <Globe size={16} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-slate-700">{selectedLang.name}</div>
                                    <div className="text-[10px] text-slate-400">{selectedLang.scriptLabel}</div>
                                </div>
                            </div>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {isLangOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto p-1">
                                {LANGUAGE_DEMOS.map((lang) => (
                                    <button
                                        key={lang.id}
                                        onClick={() => {
                                            setSelectedLang(lang);
                                            setSelectedDemoIdx(0);
                                            setIsLangOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${selectedLang.id === lang.id ? 'bg-[color:rgb(var(--brand-blue)/0.12)] text-[color:rgb(var(--brand-blue))]' : 'hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <span>{lang.name}</span>
                                        {selectedLang.id === lang.id && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Preset Chips */}
                    <div className="flex flex-wrap gap-2 pt-1">
                        {selectedLang.demos.map((demo, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedDemoIdx(idx)}
                                className={`
                                    text-[10px] font-medium px-2 py-1 rounded-md border transition-all flex items-center gap-1
                                    ${selectedDemoIdx === idx 
                                        ? 'bg-[color:rgb(var(--brand-orange)/0.12)] border-[color:rgb(var(--brand-orange)/0.35)] text-[color:rgb(var(--brand-orange))]' 
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}
                                `}
                            >
                                {demo.type === 'Code-Mix' && <RefreshCw size={8} />}
                                {demo.title}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-[10px] text-slate-400">
                    Output language is locked to the selected speaker.
                </div>
            )}

        </div>

      </div>
    </div>
  );
};

export default DemoWidget;
