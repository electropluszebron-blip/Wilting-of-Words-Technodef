import React from 'react';
import { BookOpen, Sparkles, Feather, Flame } from 'lucide-react';
import { NOVEL_META } from '../data/bookData';
import { KonarkSunWheelMandala } from './KonarkSunWheelMandala';

interface HeroCoverSectionProps {
  isDark: boolean;
  onStartReading: () => void;
}

export const HeroCoverSection: React.FC<HeroCoverSectionProps> = ({
  isDark,
  onStartReading
}) => {
  return (
    <section 
      id="hero-cover" 
      className="relative pt-6 sm:pt-10 pb-10 sm:pb-14 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col items-center justify-center overflow-hidden text-center"
    >
      {/* 
        SACRED ROTATING MANDALAS & SUN WHEELS (Konark & Bishnupur Style)
        SURROUNDING THE COVER PAGE:
        Multi-tiered concentric golden geometry, 16-petal and 24-petal lotus arrangements,
        radiant cosmic Bindu pulses, rotating in opposing gentle harmony.
      */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 flex items-center justify-center">
        {/* Outer Grand Konark Sun Wheel Aura (760px) */}
        <KonarkSunWheelMandala
          size={760}
          isDark={isDark}
          opacity={isDark ? 0.75 : 0.65}
          showBindu={false}
          className="scale-90 sm:scale-100 transition-transform duration-700"
        />

        {/* Inner Radiant Bishnupur Mandala Halo (480px) */}
        <div className="absolute">
          <KonarkSunWheelMandala
            size={480}
            isDark={isDark}
            opacity={isDark ? 0.85 : 0.75}
            showBindu={true}
            className="scale-75 sm:scale-100"
          />
        </div>

        {/* Ambient Warm Golden & Vermilion Cosmic Diffusion */}
        <div className="absolute w-[360px] sm:w-[540px] h-[360px] sm:h-[540px] rounded-full bg-gradient-to-tr from-[#E5A93C]/35 via-[#B93826]/25 to-[#D85A2A]/35 blur-3xl -z-10 animate-pulse" />
      </div>

      {/* Prominent Cover Showcase at Top */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        
        {/* Top Ribbon: Published by Technodef (Requirement 2) */}
        <div className="mb-4 sm:mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#D85A2A] text-white text-[11px] sm:text-xs font-cinzel font-bold tracking-widest uppercase shadow-xl border border-[#FFE58F]/60">
          <Flame className="w-3.5 h-3.5 text-amber-200" />
          <span>PUBLISHED BY TECHNODEF</span>
        </div>

        {/* The Official Book Cover with Dynamic Cultural Frame & Glowing Halo */}
        <div 
          onClick={onStartReading}
          className="group relative cursor-pointer transform hover:scale-[1.03] transition-all duration-500 max-w-[280px] sm:max-w-[340px] w-full"
        >
          {/* Glowing Outer Edge Halo */}
          <div className="absolute -inset-2.5 sm:-inset-3.5 rounded-3xl bg-gradient-to-tr from-[#D4AF37] via-[#B93826] to-[#E5A93C] opacity-75 group-hover:opacity-100 blur-lg transition-all duration-500 animate-pulse" />

          {/* Ornate Frame Container */}
          <div className="relative rounded-2xl p-2.5 sm:p-3 bg-[#18120D] border-2 border-[#E5A93C] shadow-2xl overflow-hidden">
            
            {/* Book Cover Image (Official Novel badge removed per Requirement 4) */}
            <div className="relative rounded-xl overflow-hidden border border-[#E5A93C]/40 bg-black">
              <img
                src="/cover.jpg"
                alt="Wilting of Words - Cover"
                className="w-full h-auto object-cover block shadow-2xl"
                loading="eager"
              />

              {/* Interactive Hover Overlay to Read (Requirement 5) */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                <div className="bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] text-white px-5 py-2.5 rounded-full font-cinzel text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xl scale-95 group-hover:scale-105 transition-transform duration-300 border border-white/30">
                  <BookOpen className="w-4 h-4" />
                  <span>Open E-Book</span>
                </div>
              </div>
            </div>

            {/* Bottom Subtitle Inside Cover Frame */}
            <div className="mt-2.5 px-2 flex items-center justify-between text-[11px] font-cinzel text-[#E5A93C] font-semibold tracking-wider uppercase">
              <span className="flex items-center gap-1">
                <Feather className="w-3 h-3 text-[#D85A2A]" />
                {NOVEL_META.authorName}
              </span>
              <span className="font-mono text-stone-400 text-[10px]">
                219 Pages
              </span>
            </div>

          </div>

        </div>

        {/* Primary Action Button directly under cover: Open E-Book (Requirement 5) */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <button
            onClick={onStartReading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 border border-[#FFE58F]/50"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open E-Book</span>
          </button>
        </div>

      </div>

    </section>
  );
};
