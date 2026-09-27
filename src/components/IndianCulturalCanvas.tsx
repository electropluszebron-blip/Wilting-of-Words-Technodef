import React from 'react';
import { KonarkSunWheelMandala } from './KonarkSunWheelMandala';

interface IndianCulturalCanvasProps {
  isDark: boolean;
}

export const IndianCulturalCanvas: React.FC<IndianCulturalCanvasProps> = ({ isDark }) => {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none transition-colors duration-500 overflow-hidden -z-20 ${
        isDark ? 'bg-[#120E0B]' : 'bg-[#FAF8F5]'
      }`}
    >
      {/* Subtle Alpona Heritage Geometric Motif Grid */}
      <div 
        className={`absolute inset-0 opacity-[0.045] dark:opacity-[0.06] pointer-events-none bg-repeat`}
        style={{
          backgroundImage: `radial-gradient(${isDark ? '#D4AF37' : '#B93826'} 0.8px, transparent 0.8px)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* 
        SACRED ROTATING MANDALAS & SUN WHEELS (Konark & Bishnupur Style)
        THROUGHOUT THE MAIN PAGE:
        Multi-tiered concentric golden geometry, 16-petal and 24-petal sacred lotus arrangements,
        radiant cosmic Bindu pulses, explicitly visible & dynamic across page sections.
      */}

      {/* 1. Top Left Floating Konark Sun Wheel */}
      <div className="absolute -top-24 -left-24 sm:-top-16 sm:-left-16 transform-gpu">
        <KonarkSunWheelMandala
          size={380}
          isDark={isDark}
          opacity={isDark ? 0.35 : 0.28}
          showBindu={true}
        />
      </div>

      {/* 2. Top Right Floating Bishnupur Terracotta Mandala */}
      <div className="absolute -top-20 -right-20 sm:-top-12 sm:-right-12 transform-gpu">
        <KonarkSunWheelMandala
          size={350}
          isDark={isDark}
          opacity={isDark ? 0.32 : 0.25}
          showBindu={false}
        />
      </div>

      {/* 3. Mid-Page Sacred Mandala (Behind Reader Section) */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 transform-gpu">
        <KonarkSunWheelMandala
          size={640}
          isDark={isDark}
          opacity={isDark ? 0.25 : 0.18}
          showBindu={true}
        />
      </div>

      {/* 4. Lower-Page Left Sacred Sun Wheel (Behind Quotes & Reflections) */}
      <div className="absolute top-[72%] -left-28 sm:-left-16 transform-gpu">
        <KonarkSunWheelMandala
          size={420}
          isDark={isDark}
          opacity={isDark ? 0.3 : 0.22}
          showBindu={true}
        />
      </div>

      {/* 5. Lower-Page Right Sacred Bishnupur Mandala (Near Author & Footer) */}
      <div className="absolute top-[85%] -right-24 sm:-right-16 transform-gpu">
        <KonarkSunWheelMandala
          size={460}
          isDark={isDark}
          opacity={isDark ? 0.32 : 0.25}
          showBindu={true}
        />
      </div>
    </div>
  );
};
