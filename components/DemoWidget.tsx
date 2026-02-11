import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Loader2, FileAudio, Zap, Globe, Languages, ChevronDown, Check, X, RefreshCw } from 'lucide-react';
import { generateSpeech, fileToBase64 } from '../services/ttsService';
import { LANGUAGE_DEMOS } from '../constants';
import LogoVisualizer from './LogoVisualizer';

const DemoWidget: React.FC = () => {
  // State
  const [selectedLang, setSelectedLang] = useState(LANGUAGE_DEMOS[0]);
  const [selectedDemoIdx, setSelectedDemoIdx] = useState(0);
  const [refFile, setRefFile] = useState<File | null>(null);
  const [refText, setRefText] = useState("इन्हें, केवल बड़े दूरदर्शकों की सहायता से ही देखा जा सकता है");
  const [genText, setGenText] = useState(LANGUAGE_DEMOS[0].demos[0].actual_text);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);

  // Effects
  useEffect(() => {
    setGenText(selectedLang.demos[selectedDemoIdx].actual_text);
  }, [selectedLang, selectedDemoIdx]);

  // Auto-play when audio is generated
  useEffect(() => {
    if (generatedAudioUrl && audioRef.current) {
        audioRef.current.play().catch(() => {
            // Auto-play might be blocked by browser
        });
        setIsPlaying(true);
    }
  }, [generatedAudioUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRefFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!refFile) {
        setError("Upload a voice sample first");
        return;
    }
    if (!genText.trim()) {
        setError("Enter text to generate");
        return;
    }

    setError(null);
    setIsLoading(true);
    // Stop current audio if playing
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    setGeneratedAudioUrl(null);

    try {
      const audioBase64 = await fileToBase64(refFile);
      const url = await generateSpeech({
        ref_audio_base64: audioBase64,
        ref_text: refText,
        gen_text: genText,
        lang: selectedLang.id === 'hi' ? 'hi' : 'en'
      });
      setGeneratedAudioUrl(url);
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

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[600px] bg-white">
        
      {/* --- LEFT COLUMN: INPUT CANVAS --- */}
      <div className="flex-1 flex flex-col p-6 md:p-10 relative">
        
        {/* Top Controls (Task Selector Look-alike) */}
        <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1.5 bg-slate-100 rounded-full text-sm font-semibold text-slate-600 flex items-center gap-2">
                <Zap size={14} className="text-orange-500 fill-orange-500" />
                Text to Speech
            </div>
            <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-sm font-medium text-slate-500">
                Sooktam v1
            </div>
        </div>

        {/* Text Input Area */}
        <div className="flex-1 relative group">
            <textarea
                value={genText}
                onChange={(e) => setGenText(e.target.value)}
                placeholder="Type something here to generate speech..."
                className="w-full h-full resize-none text-2xl md:text-3xl font-light text-slate-800 placeholder:text-slate-300 outline-none bg-transparent leading-relaxed"
                spellCheck={false}
            />
            {/* Character Count */}
            <div className="absolute bottom-0 right-0 text-xs text-slate-300 font-medium">
                {genText.length} chars
            </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
            {error ? (
                <div className="text-red-500 text-sm font-medium px-4 py-2 bg-red-50 rounded-lg animate-fade-in">
                    {error}
                </div>
            ) : (
                <div className="text-slate-400 text-sm flex items-center gap-2">
                   {generatedAudioUrl && <Check size={16} className="text-green-500" />}
                   {generatedAudioUrl ? "Audio generated successfully" : "Ready to generate"}
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={isLoading || !refFile}
                className={`
                    group relative px-8 py-4 rounded-full font-bold text-white shadow-lg transition-all duration-300
                    flex items-center gap-3 overflow-hidden
                    ${isLoading || !refFile 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-orange-500 to-blue-600 hover:scale-105 hover:shadow-orange-500/25'}
                `}
            >
                {/* Gradient animation overlay */}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                
                {isLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                    <div className="bg-white rounded-full p-1">
                         <Play size={12} className="text-orange-500 fill-orange-500 translate-x-0.5" />
                    </div>
                )}
                <span>Generate Speech</span>
            </button>
        </div>
      </div>


      {/* --- RIGHT COLUMN: SETTINGS SIDEBAR --- */}
      <div className="w-full lg:w-[400px] bg-slate-50/50 border-l border-slate-100 p-6 md:p-8 flex flex-col gap-8">
        
        {/* Visualizer & Playback (Top) */}
        <div className="flex flex-col items-center justify-center min-h-[180px] bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
            <LogoVisualizer audioElementRef={audioRef} isPlaying={isPlaying} />
            
            <audio 
                ref={audioRef}
                src={generatedAudioUrl || undefined}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onLoadStart={onAudioLoadStart}
                onLoadedData={onAudioLoadedData}
            />

            {generatedAudioUrl && (
                <button 
                    onClick={togglePlay}
                    className="mt-4 px-6 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors flex items-center gap-2"
                >
                    {isPlaying ? "Pause" : "Replay"}
                </button>
            )}
            
            {!generatedAudioUrl && !isLoading && (
                 <p className="mt-4 text-xs text-slate-400 text-center font-medium uppercase tracking-wider">
                    Waiting for input
                 </p>
            )}
        </div>

        {/* Settings Form */}
        <div className="space-y-6">
            
            {/* 1. Voice Source */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voice Source</label>
                
                {!refFile ? (
                    <div className="relative group">
                        <input 
                            type="file" 
                            accept=".wav"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="h-20 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 group-hover:bg-orange-50 group-hover:border-orange-300 transition-all flex flex-col items-center justify-center gap-1">
                            <Upload className="text-slate-400 group-hover:text-orange-500 transition-colors" size={20} />
                            <span className="text-xs font-medium text-slate-500 group-hover:text-orange-600">Upload Reference Voice (.wav)</span>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 bg-white border border-orange-200 rounded-xl shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                 <FileAudio size={20} />
                             </div>
                             <div className="flex flex-col">
                                 <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{refFile.name}</span>
                                 <span className="text-[10px] text-slate-400">Custom Voice</span>
                             </div>
                         </div>
                         <button onClick={() => setRefFile(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                             <X size={16} />
                         </button>
                    </div>
                )}
                
                {/* Transcript Input (Collapsible look) */}
                <div className="pt-2">
                    <input 
                        type="text"
                        value={refText}
                        onChange={(e) => setRefText(e.target.value)}
                        placeholder="Transcript of the uploaded audio..."
                        className="w-full text-xs bg-slate-100 border-none rounded-lg px-3 py-2 text-slate-600 focus:ring-1 focus:ring-orange-500 placeholder-slate-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 pl-1">
                        *Required for accurate cloning style matching
                    </p>
                </div>
            </div>

            {/* 2. Language Selector */}
            <div className="space-y-2 relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Language</label>
                
                <div className="relative">
                    <button 
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between hover:border-blue-400 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
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
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${selectedLang.id === lang.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
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
                                    ? 'bg-orange-50 border-orange-200 text-orange-600' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}
                            `}
                        >
                            {demo.type === 'Code-Mix' && <RefreshCw size={8} />}
                            {demo.title}
                        </button>
                    ))}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default DemoWidget;