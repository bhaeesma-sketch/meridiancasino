import React, { useEffect, useState } from 'react';

export const AnimatedLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
    const [glitchActive, setGlitchActive] = useState(false);

    // Random glitch effect trigger
    useEffect(() => {
        const interval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 200);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`flex flex-col items-center select-none ${className}`}>
            {/* Top Line: MERIDIAN (Neon Pulse) */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <span className="relative font-heading font-black text-[10px] md:text-xs tracking-[0.5em] md:tracking-[0.8em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-purple-400 animate-pulse-slow uppercase pl-1">
                    Meridian
                </span>
            </div>

            {/* Main Line: CASINO CLASH */}
            <div className="relative flex items-center leading-none mt-0.5">
                {/* CASIN */}
                <span className="font-heading font-black text-xl md:text-3xl text-white tracking-tighter uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    CASIN
                </span>

                {/* O as Spinning Coin */}
                <div className="relative w-5 h-5 md:w-8 md:h-8 mx-0.5 perspective-1000">
                    <div className="w-full h-full relative preserve-3d animate-spin-y-slow">
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-400 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 shadow-[0_0_15px_rgba(255,215,0,0.6)] flex items-center justify-center after:content-['$'] after:text-yellow-100 after:font-bold after:text-[10px] md:after:text-sm"></div>
                    </div>
                </div>

                {/* CLASH (Energy Surge) */}
                <span className={`font-heading font-black text-xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 uppercase italic tracking-tighter ml-1 relative ${glitchActive ? 'animate-glitch' : ''}`}>
                    CLASH
                    {/* Particles/Sparks */}
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </span>
            </div>

            <style>{`
        @keyframes spin-y-slow {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .animate-spin-y-slow {
          animation: spin-y-slow 4s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        @keyframes glitch {
          0% { transform: translate(0); text-shadow: none; }
          20% { transform: translate(-2px, 2px); text-shadow: 2px 0 #ff00c1; }
          40% { transform: translate(2px, -2px); text-shadow: -2px 0 #00fff9; }
          60% { transform: translate(-2px, 0); }
          80% { transform: translate(2px, 0); }
          100% { transform: translate(0); text-shadow: none; }
        }
        .animate-glitch {
          animation: glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite;
          color: #fff;
        }
      `}</style>
        </div>
    );
};
