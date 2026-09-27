import React, { useState, useEffect } from 'react';
import { Sun, Moon, Volume2, VolumeX, User, LogOut, Sparkles } from 'lucide-react';
import { audioSynth } from '../services/audioSynth';
import { AuthUser } from './AuthPortal';

interface HeaderProps {
  isDark: boolean;
  setIsDark: (d: boolean) => void;
  onJumpToSection?: (sectionId: string) => void;
  user?: AuthUser | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  setIsDark,
  onJumpToSection,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => audioSynth.getIsPlaying());

  useEffect(() => {
    const unsub = audioSynth.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  const handleToggleSpeaker = () => {
    audioSynth.togglePlay();
  };

  const handleScrollTo = (id: string) => {
    if (onJumpToSection) {
      onJumpToSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className={`w-full sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 border-b ${
      isDark 
        ? 'bg-[#14100D]/95 border-[#D4AF37]/30 text-[#FAF7F2]' 
        : 'bg-[#FAF8F5]/95 border-[#D4AF37]/30 text-[#2C2117]'
    } px-3 sm:px-8 py-3 shadow-md overflow-x-hidden`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Left: Sun Mandala Icon + Title */}
        <div 
          onClick={() => handleScrollTo('hero-cover')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
        >
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full border border-[#D4AF37]/80 flex items-center justify-center p-1 sm:p-1.5 shrink-0 bg-[#FFFDF9]/60 dark:bg-[#201813] group-hover:scale-105 transition-transform duration-300 shadow-sm">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#C89B4C] stroke-current fill-none" strokeWidth="3">
              <circle cx="50" cy="50" r="42" strokeDasharray="3,3" />
              <circle cx="50" cy="50" r="28" />
              <circle cx="50" cy="50" r="14" fill="#C89B4C" fillOpacity="0.25" />
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="8"
                  x2="50"
                  y2="20"
                  transform={`rotate(${i * 30} 50 50)`}
                  strokeWidth="2.5"
                />
              ))}
            </svg>
          </div>

          <h1 className="font-cinzel text-xs sm:text-lg md:text-xl font-black tracking-wider uppercase leading-none text-[#1A1410] dark:text-[#FAF7F2] group-hover:text-[#D4AF37] transition-colors truncate">
            WILTING OF WORDS
          </h1>
        </div>

        {/* Right Actions: Prominent Top Speaker Music Controller + Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* TOP SPEAKER BUTTON - Exclusive Background Music Controller */}
          <button
            type="button"
            data-speaker-toggle="true"
            onClick={handleToggleSpeaker}
            title={isPlaying ? 'Pause Background Music' : 'Play Background Music'}
            className={`px-3 sm:px-4 py-2 rounded-xl border transition-all text-xs sm:text-sm font-cinzel font-bold flex items-center gap-2 shadow-sm shrink-0 ${
              isPlaying
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-black border-[#D4AF37] shadow-md shadow-[#D4AF37]/30 ring-2 ring-[#D4AF37]/40 scale-105'
                : 'bg-[#FAF7F2] dark:bg-[#1E1712] border-[#D4AF37]/60 text-stone-800 dark:text-stone-200 hover:border-[#D4AF37] hover:scale-105'
            }`}
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-4 h-4 text-black animate-pulse shrink-0" />
                <span className="font-bold text-black text-xs sm:text-sm">Music ON</span>
                {/* Audio wave equalizer bars */}
                <div className="flex items-end gap-0.5 h-3 ml-0.5">
                  <span className="w-0.5 bg-black h-2 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-0.5 bg-black h-3 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-0.5 bg-black h-1.5 animate-bounce" />
                </div>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[#B93826] dark:text-[#E5A93C] shrink-0" />
                <span className="text-xs sm:text-sm">Play Music</span>
              </>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            title="Toggle theme"
            className="p-2 sm:p-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs text-[#6C5441] dark:text-[#D5C7B8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Reader Badge / Sign In */}
          {user ? (
            <div className="flex items-center gap-1 bg-[#FFFDF9]/80 dark:bg-[#1E1712] border border-[#D4AF37]/50 rounded-xl px-2 sm:px-3 py-1.5 shadow-sm text-xs">
              <User className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
              <span className="font-cinzel font-bold text-stone-800 dark:text-[#FFD778] max-w-[80px] sm:max-w-[120px] truncate">
                {user.name}
              </span>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Sign Out of Archives"
                  className="ml-1 p-1 hover:text-red-400 text-stone-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-black font-cinzel font-bold text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )
          )}

        </div>

      </div>
    </header>
  );
};
