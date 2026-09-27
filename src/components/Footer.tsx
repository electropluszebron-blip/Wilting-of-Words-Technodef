import React from 'react';
import { BookOpen, ArrowUp, Sparkles, MapPin } from 'lucide-react';
import { NOVEL_META } from '../data/bookData';

interface FooterProps {
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  isDark
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`mt-20 border-t transition-colors duration-300 ${
      isDark 
        ? 'bg-[#100D0A] border-[#2A1F17] text-[#D8C7B5]' 
        : 'bg-[#F4EDE2] border-[#E2D4C0] text-[#554131]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-black/10 dark:border-white/10 text-center md:text-left">
          
          {/* Brand & Subtitle */}
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#8B3A1C] text-white flex items-center justify-center shadow-md">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-cinzel text-lg font-bold tracking-wider">
                {NOVEL_META.title}
              </span>
            </div>
            <p className="text-xs font-serif opacity-75 max-w-md">
              A poignant literary narrative exploring voice, resilience, and identity of Aratrika.
            </p>
          </div>

          {/* Publisher & Author Credits (Chakdaha per Requirement 10) */}
          <div className="flex flex-col items-center md:items-end gap-1 text-xs">
            <span className="font-cinzel font-semibold text-[#D4AF37]">
              PUBLISHED BY {NOVEL_META.publisher.toUpperCase()}
            </span>
            <span className="opacity-80 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#B93826]" />
              Author: {NOVEL_META.authorName} • Chakdaha, Nadia
            </span>
            <span className="text-[11px] opacity-60">
              Digital Literary Edition • All Rights Reserved
            </span>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] opacity-65">
          <p>© {new Date().getFullYear()} Wilting of Words. Published by Technodef & Pratyay Saha • Chakdaha.</p>
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
