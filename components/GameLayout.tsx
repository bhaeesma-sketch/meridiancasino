import React, { ReactNode, useState, useEffect } from 'react';

interface GameLayoutProps {
    title: string;
    gameVisuals: ReactNode;
    controls: ReactNode;
    history?: ReactNode; // Optional history sidebar/component
    stats?: ReactNode;   // Optional stats bar
}

// Hook to detect screen orientation/size
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
        isLandscape: typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : true,
        isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
                isLandscape: window.innerWidth > window.innerHeight,
                isMobile: window.innerWidth < 768
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

export const GameLayout: React.FC<GameLayoutProps> = ({ title, gameVisuals, controls, history, stats }) => {
    const { isMobile, isLandscape } = useWindowSize();

    // Mobile Portrait: Stacked (Visuals take priority)
    if (isMobile && !isLandscape) {
        return (
            <div className="flex flex-col h-full w-full overflow-hidden bg-black/20 backdrop-blur-sm relative">
                {/* Header - Compact */}
                <div className="flex-none h-12 flex items-center justify-between px-4 border-b border-white/5 bg-black/40 z-30">
                    <h2 className="text-quantum-gold font-heading font-black text-sm uppercase tracking-widest">{title}</h2>
                    {/* Optional: Add mini-stats or balance here if needed, but App.tsx handles nav */}
                </div>

                {/* Game Visuals - Flex Grow (Takes remaining space) */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 z-10">
                    <div className="w-full h-full relative flex items-center justify-center">
                        {gameVisuals}
                    </div>
                </div>

                {/* Controls - Fixed Bottom Sheet tyle or Just Bottom Section */}
                <div className="flex-none bg-black/60 border-t border-white/10 backdrop-blur-xl p-4 z-30 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                    {controls}
                </div>
            </div>
        );
    }

    // Mobile Landscape: Side-by-Side (Controls Left, Game Right)
    if (isMobile && isLandscape) {
        return (
            <div className="flex h-full w-full overflow-hidden bg-black/20 backdrop-blur-sm">
                {/* Controls Sidebar */}
                <div className="flex-none w-[320px] h-full overflow-y-auto custom-scrollbar bg-black/40 border-r border-white/10 p-4 flex flex-col justify-center">
                    <h2 className="text-quantum-gold font-heading font-black text-xs uppercase tracking-widest mb-4 absolute top-4 left-4">{title}</h2>
                    {controls}
                </div>

                {/* Game Visuals */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-black/20">
                    {gameVisuals}
                </div>
            </div>
        );
    }

    // Desktop: 3-Column or Center Focus
    return (
        <div className="flex h-full w-full overflow-hidden gap-4 p-4">
            {/* Left Panel: Controls */}
            <div className="flex-none w-[350px] flex flex-col gap-4">
                <div className="flex-1 glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col">
                    <h1 className="text-2xl font-black font-heading text-white mb-6 uppercase tracking-wider">{title}</h1>
                    <div className="flex-1 flex flex-col justify-center">
                        {controls}
                    </div>
                </div>
            </div>

            {/* Center Panel: Game Visuals */}
            <div className="flex-1 glass-panel rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center bg-black/40 shadow-inner">
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
                {gameVisuals}
            </div>

            {/* Right Panel: History / Stats (Optional, can be collapsible) */}
            {history && (
                <div className="flex-none w-[250px] hidden xl:flex flex-col gap-4">
                    <div className="flex-1 glass-panel p-4 rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Live Feed</h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {history}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
