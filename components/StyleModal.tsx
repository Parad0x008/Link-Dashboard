import React from 'react';
import { X, Palette, Type, Check, RefreshCw, Image as ImageIcon, Droplets } from 'lucide-react';
import { CustomTheme } from '../types';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: CustomTheme;
  onUpdate: (theme: CustomTheme) => void;
  onReset: () => void;
}

const FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif', label: 'Modern' },
  { name: 'Roboto', value: 'Roboto, sans-serif', label: 'Neutral' },
  { name: 'Poppins', value: 'Poppins, sans-serif', label: 'Geometric' },
  { name: 'Lora', value: 'Lora, serif', label: 'Elegant' },
];

const PRESET_COLORS = [
  '#7c3aed', // Purple (Default)
  '#2563eb', // Blue
  '#059669', // Emerald
  '#dc2626', // Red
  '#db2777', // Pink
  '#ea580c', // Orange
];

export const StyleModal: React.FC<StyleModalProps> = ({
  isOpen,
  onClose,
  theme,
  onUpdate,
  onReset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm shrink-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette size={18} className="text-primary" />
            Customize Style
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Primary Color Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <Palette size={14} />
                Accent Color
            </label>
            <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map(color => (
                    <button
                        key={color}
                        onClick={() => onUpdate({ ...theme, primaryColor: color })}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${theme.primaryColor === color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : ''}`}
                        style={{ backgroundColor: color }}
                    >
                        {theme.primaryColor === color && <Check size={16} className="text-white drop-shadow-md" />}
                    </button>
                ))}
                <div className="relative ml-2">
                     <input 
                        type="color" 
                        value={theme.primaryColor}
                        onChange={(e) => onUpdate({ ...theme, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-0 p-0 shadow-sm"
                        title="Custom Color"
                     />
                </div>
            </div>
          </div>

           {/* Background Section */}
           <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <ImageIcon size={14} />
                Background
            </label>
            
            <div className="space-y-3">
                <input
                    type="text"
                    value={theme.backgroundImage || ''}
                    onChange={(e) => onUpdate({ ...theme, backgroundImage: e.target.value })}
                    placeholder="Paste Image URL (e.g. Unsplash)..."
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-black focus:border-primary focus:outline-none text-sm transition-all"
                />
                <div className="text-[10px] text-gray-400">
                    Leave empty for default solid background.
                </div>
            </div>

            {theme.backgroundImage && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Droplets size={10}/> Overlay Opacity</span>
                        <span>{theme.backgroundOverlayOpacity || 80}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={theme.backgroundOverlayOpacity !== undefined ? theme.backgroundOverlayOpacity : 80}
                        onChange={(e) => onUpdate({ ...theme, backgroundOverlayOpacity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
            )}
          </div>

          {/* Font Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <Type size={14} />
                Font Family
            </label>
            <div className="grid grid-cols-2 gap-3">
                {FONTS.map(font => (
                    <button
                        key={font.name}
                        onClick={() => onUpdate({ ...theme, fontFamily: font.name })}
                        className={`
                            px-4 py-3 rounded-xl border text-left transition-all
                            ${theme.fontFamily === font.name 
                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'}
                        `}
                    >
                        <div className="font-bold text-sm" style={{ fontFamily: font.value }}>{font.name}</div>
                        <div className="text-xs opacity-60">{font.label}</div>
                    </button>
                ))}
            </div>
          </div>
        </div>

        <div className="p-6 pt-2 flex gap-3 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-[#1a1a1a]">
             <button
                onClick={onReset}
                className="px-4 py-3 rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
                <RefreshCw size={16} />
                Reset
            </button>
            <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};