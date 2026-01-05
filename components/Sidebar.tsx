import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';
import { GameMode } from '../types';

export const LeftSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const context = useContext(AppContext);

    if (!context || !context.isConnected) return null;

    const path = location.pathname.substring(1) || 'lobby';
    const activeMode = (targetPath: string) => path === targetPath;

    const navItems = [
        { name: 'Lobby', path: 'lobby', icon: 'home' },
        { name: 'Dice', path: 'dice', icon: 'casino' },
        { name: 'Roulette', path: 'roulette', icon: 'incomplete_circle' },
        { name: 'Blackjack', path: 'blackjack', icon: 'playing_cards' },
        { name: 'Plinko', path: 'plinko', icon: 'apps' },
        { name: 'Limbo', path: 'limbo', icon: 'trending_up' },
    ];

    return (
        <aside className="hidden lg:flex w-20 xl:w-64 flex-col h-full transition-all">
            <div className="bg-glass-panel border border-white/10 rounded-2xl xl:rounded-3xl p-2 xl:p-5 flex flex-col h-full shadow-2xl relative overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar relative z-10">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                sounds.playClick();
                                navigate(`/${item.path}`);
                            }}
                            onMouseEnter={() => sounds.playHover()}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeMode(item.path)
                                ? 'bg-quantum-gold/20 border border-quantum-gold/30 text-quantum-gold shadow-gold-glow-sm'
                                : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-2xl drop-shadow-sm ${activeMode(item.path) ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`}>
                                {item.icon}
                            </span>
                            <span className="hidden xl:block font-heading font-bold text-xs uppercase tracking-widest">
                                {item.name}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Policy Links Footer */}
                <div className="pt-4 border-t border-white/5 relative z-10 space-y-1">
                    <button
                        onClick={() => navigate('/faq')}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-white/40 hover:text-white text-[10px] uppercase tracking-wider transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">help</span>
                        <span className="hidden xl:block">FAQ</span>
                    </button>
                    <button
                        onClick={() => navigate('/terms')}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-white/40 hover:text-white text-[10px] uppercase tracking-wider transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">description</span>
                        <span className="hidden xl:block">Terms</span>
                    </button>
                    <button
                        onClick={() => navigate('/privacy')}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-white/40 hover:text-white text-[10px] uppercase tracking-wider transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">shield</span>
                        <span className="hidden xl:block">Privacy</span>
                    </button>
                    <button
                        onClick={() => navigate('/responsible-gaming')}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-white/40 hover:text-green-400 text-[10px] uppercase tracking-wider transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">health_and_safety</span>
                        <span className="hidden xl:block">Responsible Gaming</span>
                    </button>
                </div>

                {/* Settings Button */}
                <div className="pt-4 border-t border-white/5 relative z-10">
                    <button
                        onClick={() => {
                            sounds.playClick();
                            context.setIsSettingsOpen(true);
                        }}
                        onMouseEnter={() => sounds.playHover()}
                        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all group text-white/50 hover:bg-white/5 hover:text-white border border-transparent"
                    >
                        <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-500">
                            settings
                        </span>
                        <span className="hidden xl:block font-heading font-bold text-xs uppercase tracking-widest">
                            Settings
                        </span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export const RightSidebar: React.FC = () => {
    const context = useContext(AppContext);
    if (!context || !context.isConnected) return null;

    return (
        <aside className="hidden xl:flex w-64 lg:w-72 flex-col h-full transition-all">
            <div className="bg-glass-panel border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-5 flex flex-col h-full shadow-2xl relative overflow-hidden group/sidebar">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-plasma-purple/10 rounded-full blur-[60px] group-hover/sidebar:bg-plasma-purple/20 transition-colors"></div>

                <h3 className="text-[10px] md:text-xs font-heading font-extrabold text-white uppercase tracking-widest mb-3 md:mb-4 relative z-10 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Live Action
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar relative z-10">
                    {context.history.length > 0 ? (
                        context.history.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 md:gap-2.5 p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-default group/item animate-deep-fade-up">
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[10px] md:text-[11px] font-bold text-white truncate group-hover/item:text-quantum-gold transition-colors">{item.username}</span>
                                        <span className="text-[8px] md:text-[9px] font-mono font-bold text-green-400 group-hover/item:drop-shadow-[0_0_5px_rgba(74,222,128,0.5)] transition-all">
                                            +{item.payout.toFixed(3)} BTC
                                        </span>
                                    </div>
                                    <div className="text-[8px] md:text-[9px] text-white/50 uppercase mt-0.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[8px] md:text-[9px]">bolt</span>
                                        {item.game}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center text-white/20 text-[10px] uppercase font-bold tracking-[0.2em] italic">
                            Scanning Quantum Field...
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
