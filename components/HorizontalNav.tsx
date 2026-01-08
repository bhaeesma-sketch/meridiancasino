import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext, AppContextType } from '../App';
import { sounds as soundService } from '../services/soundService';

export const HorizontalNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const context = React.useContext(AppContext) as AppContextType | null;

    if (!context || !context.isConnected) return null;

    const path = location.pathname.substring(1) || 'lobby';
    const activeMode = (targetPath: string) => path === targetPath;

    const navItems = [
        { name: 'Lobby', path: 'lobby', icon: 'home' },
        { name: 'Market Trends', path: 'dice', icon: 'trending_up' },
        { name: 'User Activity', path: 'roulette', icon: 'person' },
        { name: 'Network Traffic', path: 'blackjack', icon: 'wifi_tethering' },
        { name: 'System Logs', path: 'plinko', icon: 'description' },
        { name: 'Uplink Velocity', path: 'limbo', icon: 'speed' },
    ];

    const is3D = context.is3DMode;

    return (
        <div className="w-full bg-meridian-charcoal/80 backdrop-blur-md border-b border-gold-antique/20 px-4 md:px-6 lg:px-10 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Game Navigation */}
                <div className="flex items-center gap-2 flex-1 overflow-x-auto custom-scrollbar-hidden">
                    {navItems.map((item) => {
                        const isActive = activeMode(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    soundService.playClick();
                                    navigate(`/${item.path}`);
                                }}
                                onMouseEnter={() => soundService.playHover()}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-heading text-sm uppercase tracking-wider transition-all whitespace-nowrap ${isActive
                                    ? 'bg-gold-metallic text-meridian-navy shadow-gold-glow font-black'
                                    : 'bg-meridian-midnight/50 text-white/60 hover:text-white hover:bg-meridian-midnight border border-white/10 hover:border-gold-antique/30'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-xl ${isActive ? 'animate-pulse' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="hidden sm:inline">{item.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Utility Links */}
                <div className="hidden xl:flex items-center gap-1 mr-4 border-r border-white/10 pr-4">
                    {['FAQ', 'Terms', 'Privacy', 'Responsible Gaming'].map((label) => {
                        const slug = label.toLowerCase().replace(' ', '-');
                        return (
                            <button
                                key={slug}
                                onClick={() => navigate(`/${slug}`)}
                                className="text-[10px] uppercase font-bold text-white/30 hover:text-quantum-gold transition-colors px-2 py-1"
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                    {/* 3D Toggle */}
                    <button
                        onClick={() => {
                            soundService.playClick();
                            context.setIs3DMode(!is3D);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl font-heading text-xs uppercase tracking-wider transition-all ${is3D
                            ? 'bg-gold-metallic text-meridian-navy shadow-gold-glow'
                            : 'bg-ice-electric/20 text-ice-electric border border-ice-electric/30'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {is3D ? '3d_rotation' : 'view_quilt'}
                        </span>
                        <span className="hidden md:inline">{is3D ? '3D' : '2D'}</span>
                    </button>

                    {/* Settings */}
                    <button
                        onClick={() => {
                            soundService.playClick();
                            context.setIsSettingsOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-meridian-midnight/50 text-white/60 hover:text-white hover:bg-meridian-midnight border border-white/10 hover:border-gold-antique/30 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
