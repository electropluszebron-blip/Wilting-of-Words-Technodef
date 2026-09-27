import React, { useState } from 'react';
import { audioSynth } from '../services/audioSynth';

interface EntranceGateProps {
  onEnter: () => void;
}

export const EntranceGate: React.FC<EntranceGateProps> = ({ onEnter }) => {
  const [isFading, setIsFading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const handleEnter = () => {
    try {
      audioSynth.playNow();
      const el = document.getElementById('exclusive-bg-music-player') as HTMLAudioElement | null;
      if (el) {
        el.muted = false;
        el.volume = 1.0;
        el.play().catch(() => {});
      }
    } catch (e) {
      console.warn('Playback trigger warning:', e);
    }

    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onEnter();
    }, 700);
  };

  const handleScreenTouch = () => {
    try {
      audioSynth.attemptAutoPlay();
      const el = document.getElementById('exclusive-bg-music-player') as HTMLAudioElement | null;
      if (el) {
        el.muted = false;
        el.volume = 1.0;
        if (el.paused) {
          el.play().catch(() => {});
        }
      }
    } catch (e) {}
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleScreenTouch}
      onTouchStart={handleScreenTouch}
      onPointerDown={handleScreenTouch}
      className={`fixed inset-0 w-full max-w-[100vw] h-full max-h-[100dvh] z-[90] flex flex-col items-center justify-center bg-[#070605] text-[#FAF7F2] overflow-hidden select-none transition-opacity duration-700 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 
        ==================================================================
        EXPLICITLY VISIBLE ROTATING DIYA ART ANIMATION IN BACKGROUND
        - Positioned in background (z-0) so NO text or buttons are overlapped
        - Features traditional earthen Diya lamps, luminous flames (jyoti),
          and radiant celestial rays clearly framing the cover and scene.
        ==================================================================
      */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none overflow-hidden z-0">
        
        {/* Soft Golden Ambient Halo */}
        <div className="absolute w-[450px] sm:w-[580px] h-[450px] sm:h-[580px] rounded-full bg-gradient-to-b from-[#F59E0B]/20 via-[#D97706]/10 to-transparent blur-3xl animate-pulse" />

        {/* Master Rotating Diya Art Mandala */}
        <div className="relative w-[min(94vw,480px)] h-[min(94vw,480px)] sm:w-[620px] sm:h-[620px] md:w-[700px] md:h-[700px] aspect-square flex items-center justify-center -translate-y-4 opacity-80 shrink-0">
          <svg
            className="w-full h-full text-[#E5A93C] animate-[spin_70s_linear_infinite] drop-shadow-[0_0_20px_rgba(229,169,60,0.4)]"
            viewBox="0 0 500 500"
            fill="none"
          >
            {/* Outer dotted and double celestial orbits */}
            <circle cx="250" cy="250" r="238" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.55"/>
            <circle cx="250" cy="250" r="222" stroke="currentColor" strokeWidth="1.5" opacity="0.75"/>
            <circle cx="250" cy="250" r="195" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" opacity="0.45"/>
            <circle cx="250" cy="250" r="160" stroke="currentColor" strokeWidth="1.8" opacity="0.8"/>

            {/* 24 Radiant Sun & Flame Rays */}
            {Array.from({ length: 24 }).map((_, i) => {
              const deg = i * 15;
              const isLong = i % 2 === 0;
              return (
                <line
                  key={deg}
                  x1="250"
                  y1={isLong ? 50 : 75}
                  x2="250"
                  y2="105"
                  stroke="currentColor"
                  strokeWidth={isLong ? 2 : 1.2}
                  strokeLinecap="round"
                  transform={`rotate(${deg} 250 250)`}
                  opacity={isLong ? 0.9 : 0.6}
                />
              );
            })}

            {/* 4 Traditional Earthen Diya Lamps at Cardinal Points */}
            {[0, 90, 180, 270].map((deg) => (
              <g key={`diya-${deg}`} transform={`rotate(${deg} 250 250)`}>
                {/* Diya Bowl (Earthen lamp) */}
                <path
                  d="M 215 130 C 220 152, 280 152, 285 130 C 275 140, 225 140, 215 130 Z"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  fill="rgba(229, 169, 60, 0.18)"
                />
                {/* Diya Rim Highlight */}
                <path
                  d="M 218 131 Q 250 142 282 131"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  opacity="0.85"
                />
                {/* Diya Flame (Jyoti / Teardrop) */}
                <path
                  d="M 250 90 C 235 110, 235 125, 250 130 C 265 125, 265 110, 250 90 Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="rgba(245, 158, 11, 0.28)"
                />
                {/* Inner Flame Core */}
                <path
                  d="M 250 102 C 242 114, 242 122, 250 126 C 258 122, 258 114, 250 102 Z"
                  stroke="#FFD778"
                  strokeWidth="1.4"
                  fill="rgba(255, 215, 120, 0.45)"
                />
                <circle cx="250" cy="115" r="18" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.6"/>
              </g>
            ))}

            {/* Central Sacred Diya & Botanical Motif */}
            <g transform="translate(0, 0)">
              <path
                d="M 190 270 C 195 320, 305 320, 310 270 C 295 285, 205 285, 190 270 Z"
                stroke="currentColor"
                strokeWidth="2.8"
                fill="rgba(229, 169, 60, 0.15)"
              />
              <path
                d="M 250 180 C 215 225, 215 260, 250 270 C 285 260, 285 225, 250 180 Z"
                stroke="currentColor"
                strokeWidth="2.6"
                fill="rgba(245, 158, 11, 0.22)"
              />
              <path
                d="M 250 205 C 232 230, 232 250, 250 258 C 268 250, 268 230, 250 205 Z"
                stroke="#FFD778"
                strokeWidth="1.8"
                fill="rgba(255, 215, 120, 0.35)"
              />
              <circle cx="250" cy="250" r="110" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
              <circle cx="250" cy="250" r="80" stroke="currentColor" strokeWidth="1.2" opacity="0.65"/>
            </g>
          </svg>
        </div>
      </div>

      {/* 
        ==================================================================
        FOREGROUND CONTENT (Layered strictly above animation at z-20)
        Guarantees that NO text or button is overlapped by the animation!
        ==================================================================
      */}
      <div className="relative z-20 flex flex-col items-center justify-center px-4 max-w-sm w-full">
        
        {/* Book Cover with Refined Thin Golden Border */}
        <div className="w-[190px] sm:w-[215px] md:w-[225px] aspect-[1/1.42] rounded-2xl border-2 border-[#D4AF37] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.9)] bg-[#0d0b09] transform hover:scale-[1.01] transition-transform duration-300">
          <img
            src="/cover.jpg"
            alt="Wilting of Words Book Cover"
            className="w-full h-full object-cover select-none"
          />
        </div>

        {/* Title & Subtitle Block with Clean Spatial Hierarchy */}
        <div className="flex flex-col items-center mt-7 sm:mt-8 space-y-2">
          {/* Main Story Title */}
          <h1 
            className="text-[27px] sm:text-[32px] md:text-[34px] font-cinzel font-bold tracking-[0.14em] text-[#FFFDF8] text-center drop-shadow-[0_2px_15px_rgba(0,0,0,0.85)] leading-none"
          >
            WILTING OF WORDS
          </h1>

          {/* Subtitle */}
          <p className="text-[11px] sm:text-[12px] font-sans font-semibold tracking-[0.32em] text-[#E5A93C] text-center uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            PRATYAY SAHA &bull; TECHNODEF
          </p>
        </div>

        {/* Enter Website Button */}
        <div className="mt-6 sm:mt-7">
          <button
            onClick={handleEnter}
            className="px-8 py-2.5 rounded-full font-sans font-bold text-xs sm:text-sm tracking-[0.15em] bg-gradient-to-r from-[#F59E0B] via-[#EA580C] to-[#D97706] hover:brightness-110 active:scale-95 text-[#070605] shadow-[0_4px_22px_rgba(245,158,11,0.35)] hover:shadow-[0_4px_28px_rgba(245,158,11,0.5)] uppercase transition-all duration-200 cursor-pointer"
          >
            ENTER WEBSITE
          </button>
        </div>

      </div>
    </div>
  );
};
