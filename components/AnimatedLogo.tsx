import React, { useEffect, useState } from 'react';

export const AnimatedLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [pulseActive, setPulseActive] = useState(false);

  // Mystical pulse effect trigger
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-start select-none ${className}`}>
      {/* Main Title: MERIDIAN */}
      <div className="relative group flex items-center gap-2">
        {/* Compass Rose Icon */}
        <div className="compass-rose w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
          <div className="relative w-full h-full">
            <span className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl animate-compass-spin">
              ✦
            </span>
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[8px] font-bold text-ice-electric font-heading">
              N
            </span>
          </div>
        </div>

        {/* MERIDIAN Text */}
        <div className="relative">
          <div className={`absolute -inset-2 bg-gradient-to-r from-gold-primary via-mystical-magenta to-ice-electric rounded-lg blur-md opacity-30 ${pulseActive ? 'opacity-60' : ''} transition-opacity duration-1000`}></div>
          <h1 className="relative meridian-title text-2xl md:text-4xl lg:text-5xl font-display font-black tracking-wider uppercase">
            MERIDIAN
          </h1>
        </div>
      </div>

      {/* Subtitle: CASINO CLASH */}
      <div className="relative flex items-center gap-2 mt-1 ml-10 md:ml-12">
        {/* Gear Decoration */}
        <span className="text-gold-antique/30 text-xs md:text-sm animate-gear-rotate">⚙</span>

        <h2 className="casino-clash-subtitle text-sm md:text-xl lg:text-2xl tracking-[0.3em] uppercase">
          CASINO CLASH
        </h2>

        {/* Dragon Breath Particle Effect */}
        <div className="flex gap-1 ml-2">
          <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-fire-bright shadow-fire-glow animate-particle-float"></span>
          <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-ice-electric shadow-ice-glow animate-particle-float" style={{ animationDelay: '0.5s' }}></span>
        </div>
      </div>

      <style>{`
                @keyframes spin-compass {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-compass-spin {
                    animation: spin-compass 20s linear infinite;
                    color: #FFD700;
                    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
                }
            `}</style>
    </div>
  );
};
