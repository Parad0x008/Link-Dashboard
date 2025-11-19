
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Wind, Play, Pause, RotateCcw, Save } from 'lucide-react';
import { AmbientMixer } from './AmbientMixer';

export const Widgets: React.FC = () => {
  // --- Weather Mock ---
  const [weather] = useState({ temp: 72, condition: 'Partly Cloudy', humidity: 45 });

  // --- Pomodoro ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isWorkMode, setIsWorkMode] = useState(true); // true = 25min, false = 5min

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert(isWorkMode ? "Focus time over! Take a break." : "Break over! Back to work.");
      setIsWorkMode(!isWorkMode);
      setTimeLeft(isWorkMode ? 5 * 60 : 25 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWorkMode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setIsWorkMode(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Notepad ---
  const [note, setNote] = useState(() => localStorage.getItem('dashboard_note') || '');
  
  useEffect(() => {
    const handler = setTimeout(() => {
        localStorage.setItem('dashboard_note', note);
    }, 1000);
    return () => clearTimeout(handler);
  }, [note]);

  return (
    <div className="flex flex-col gap-6 h-full p-1">
      
      {/* Ambient Generator (New Power Feature) */}
      <AmbientMixer />

      {/* Weather Widget */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden group border border-white/10">
        <div className="absolute -right-4 -top-4 text-white/10 group-hover:scale-110 transition-transform duration-500">
            <Sun size={100} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-wider opacity-80 uppercase">San Francisco</span>
                <Cloud size={16} />
            </div>
            <div className="text-4xl font-bold mb-1">{weather.temp}°</div>
            <div className="text-sm opacity-90 mb-4 font-medium">{weather.condition}</div>
            <div className="flex gap-4 text-xs opacity-75 border-t border-white/20 pt-3">
                <div className="flex items-center gap-1">
                    <Wind size={12} />
                    <span>8 mph</span>
                </div>
                <div className="flex items-center gap-1">
                    <Sun size={12} />
                    <span>UV: 4</span>
                </div>
            </div>
        </div>
      </div>

      {/* Pomodoro Widget */}
      <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Focus Timer</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isWorkMode ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {isWorkMode ? 'WORK' : 'BREAK'}
            </span>
        </div>
        <div className="text-5xl font-mono font-bold text-center text-gray-800 dark:text-white mb-6 tracking-tighter">
            {formatTime(timeLeft)}
        </div>
        <div className="flex gap-2 justify-center">
            <button 
                onClick={toggleTimer}
                className={`flex-1 py-3 rounded-xl text-white shadow-lg transition-all active:scale-95 flex justify-center ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary-hover'}`}
            >
                {isActive ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button 
                onClick={resetTimer}
                className="px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <RotateCcw size={20} />
            </button>
        </div>
      </div>

      {/* Quick Notes */}
      <div className="bg-yellow-50 dark:bg-[#2a2a2a] p-0 rounded-2xl shadow-md border border-yellow-100 dark:border-gray-800 flex-1 flex flex-col overflow-hidden relative min-h-[200px]">
        <div className="p-4 border-b border-yellow-100 dark:border-gray-700 flex justify-between items-center bg-yellow-100/50 dark:bg-white/5">
            <h3 className="font-bold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wide">Scratchpad</h3>
            <Save size={14} className="text-gray-400" />
        </div>
        <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="// Type quick notes here..."
            className="flex-1 w-full bg-transparent p-4 resize-none focus:outline-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed custom-scrollbar font-mono"
        />
      </div>
    </div>
  );
};
