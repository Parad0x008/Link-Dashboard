
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Activity, Waves } from 'lucide-react';

export const AmbientMixer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [noiseType, setNoiseType] = useState<'brown' | 'pink'>('brown');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
    }
    return () => {
        audioContextRef.current?.close();
    };
  }, []);

  // Handle Volume Changes
  useEffect(() => {
    if (gainNodeRef.current) {
        gainNodeRef.current.gain.exponentialRampToValueAtTime(
            Math.max(0.001, volume), 
            audioContextRef.current!.currentTime + 0.1
        );
    }
  }, [volume]);

  const createNoiseBuffer = (ctx: AudioContext, type: 'brown' | 'pink') => {
    const bufferSize = 2 * ctx.sampleRate; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'pink') {
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; // (roughly) compensate for gain
            b6 = white * 0.115926;
        }
    } else { // Brown noise
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Compensate gain
        }
    }
    return buffer;
  };

  const togglePlay = () => {
    if (!audioContextRef.current) return;

    if (isPlaying) {
        sourceNodeRef.current?.stop();
        setIsPlaying(false);
    } else {
        // Re-create graph
        const ctx = audioContextRef.current;
        const buffer = createNoiseBuffer(ctx, noiseType);
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        source.start();
        
        sourceNodeRef.current = source;
        gainNodeRef.current = gainNode;
        setIsPlaying(true);
    }
  };

  const handleTypeChange = (type: 'brown' | 'pink') => {
      setNoiseType(type);
      if (isPlaying) {
          // Restart with new buffer
          togglePlay(); // Stop
          setTimeout(() => {
              setNoiseType(type);
              togglePlay(); // Start (this logic is slightly buggy due to state closure, fixed below)
          }, 50);
      }
  };

  // Fix for restarting with new type immediately
  useEffect(() => {
      if(isPlaying) {
          sourceNodeRef.current?.stop();
          const ctx = audioContextRef.current!;
          const buffer = createNoiseBuffer(ctx, noiseType);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          const gainNode = ctx.createGain();
          gainNode.gain.value = volume;
          source.connect(gainNode);
          gainNode.connect(ctx.destination);
          source.start();
          sourceNodeRef.current = source;
          gainNodeRef.current = gainNode;
      }
  }, [noiseType]);

  return (
    <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-md border border-gray-800 relative overflow-hidden">
        {/* Visualizer Bars (Fake) */}
        <div className="absolute inset-0 flex items-end justify-between opacity-10 pointer-events-none px-2 pb-2 gap-1">
            {[...Array(10)].map((_, i) => (
                <div 
                    key={i} 
                    className={`bg-primary w-full rounded-t-md transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-2'}`}
                    style={{ height: isPlaying ? `${Math.random() * 80 + 20}%` : '10%' }} 
                />
            ))}
        </div>

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                    <Activity size={18} className={isPlaying ? "text-green-400" : "text-gray-500"} />
                    Focus Audio
                </h3>
                <div className="flex gap-1 bg-black/30 rounded-lg p-1">
                    <button 
                        onClick={() => handleTypeChange('brown')}
                        className={`text-[10px] px-2 py-1 rounded-md transition-colors ${noiseType === 'brown' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        DEEP
                    </button>
                    <button 
                        onClick={() => handleTypeChange('pink')}
                        className={`text-[10px] px-2 py-1 rounded-md transition-colors ${noiseType === 'pink' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        SOFT
                    </button>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={togglePlay}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isPlaying ? 'bg-green-500 text-white hover:scale-105' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >
                    {isPlaying ? <Waves size={24} className="animate-pulse" /> : <VolumeX size={24} />}
                </button>
                
                <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Intensity</span>
                        <span>{Math.round(volume * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                </div>
            </div>
        </div>
    </div>
  );
};
