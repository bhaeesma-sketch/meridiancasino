import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { sounds as soundService } from '../services/soundService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const LeftSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const context = React.useContext(AppContext);

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
        { name: 'Refer & Earn', path: 'profile?tab=referral', icon: 'groups' },
    ];

    const is3D = context.is3DMode;

    return (
        <aside className="hidden lg:flex w-20 xl:w-64 flex-col h-full transition-all py-4 pl-4">
            <Card variant="glass" padding="none" className="flex flex-col h-full relative group bg-space-card/50">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-quantum-gold/50 to-transparent opacity-50"></div>

                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar relative z-10 p-3">
                    {navItems.map((item) => {
                        const isActive = activeMode(item.path);
                        return (
                            <Button
                                key={item.path}
                                onClick={() => {
                                    soundService.playClick();
                                    navigate(`/${item.path}`);
                                }}
                                onMouseEnter={() => soundService.playHover()}
                                variant={isActive ? 'ghost' : 'ghost'}
                                className={`w-full justify-start ${isActive
                                    ? 'bg-quantum-gold/10 text-quantum-gold border border-quantum-gold/30 shadow-gold-glow'
                                    : 'text-white/50 hover:text-white'}`}
                                fullWidth
                            >
                                <span className={`material-symbols-outlined text-2xl ${isActive ? 'animate-pulse' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="hidden xl:block font-heading font-bold text-xs uppercase tracking-widest pl-2">
                                    {item.name}
                                </span>
                            </Button>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="p-3 border-t border-white/5 space-y-1">
                    {['FAQ', 'Rules', 'Terms', 'Privacy', 'Responsible Gaming'].map((label) => {
                        const slug = label.toLowerCase().replace(' ', '-');
                        const isResponsible = label === 'Responsible Gaming';
                        return (
                            <button
                                key={slug}
                                onClick={() => navigate(`/${slug}`)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${isResponsible ? 'text-white/40 hover:text-neon-green' : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">
                                    {label === 'FAQ' ? 'help' : label === 'Rules' ? 'gavel' : label === 'Terms' ? 'description' : label === 'Privacy' ? 'shield' : 'health_and_safety'}
                                </span>
                                <span className="hidden xl:block">{label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 3D Toggle & Settings */}
                <div className="p-3 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between px-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        <span className="hidden xl:inline">View Mode</span>
                        <span className={is3D ? 'text-quantum-gold' : 'text-plasma-blue'}>{is3D ? '3D' : '2D'}</span>
                    </div>

                    <Button
                        size="sm"
                        variant={is3D ? 'primary' : 'secondary'}
                        onClick={() => {
                            soundService.playClick();
                            context.setIs3DMode(!is3D);
                        }}
                        className={!is3D ? '!text-plasma-blue !border-plasma-blue/30 !bg-plasma-blue/10' : ''}
                        fullWidth
                    >
                        <span className="material-symbols-outlined text-lg">
                            {is3D ? '3d_rotation' : 'view_quilt'}
                        </span>
                        <span className="hidden xl:inline ml-2">{is3D ? 'Immersive' : 'Classic'}</span>
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            soundService.playClick();
                            context.setIsSettingsOpen(true);
                        }}
                        className="justify-start text-white/50 hover:text-white"
                        fullWidth
                    >
                        <span className="material-symbols-outlined text-xl">settings</span>
                        <span className="hidden xl:inline ml-2 font-heading text-xs uppercase tracking-widest">Settings</span>
                    </Button>
                </div>
            </Card>
        </aside>
    );
};

export const RightSidebar: React.FC = () => {
    const context = React.useContext(AppContext);
    if (!context || !context.isConnected) return null;

    return (
        <aside className="hidden xl:flex w-64 lg:w-72 flex-col h-full transition-all py-4 pr-4">
            <Card variant="glass" padding="md" className="flex flex-col h-full relative group bg-space-card/50">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-plasma-purple/10 rounded-full blur-[60px] group-hover:bg-plasma-purple/20 transition-colors pointer-events-none"></div>

                <h3 className="text-[10px] md:text-xs font-heading font-extrabold text-white uppercase tracking-widest mb-4 relative z-10 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-neon-green animate-pulse"></span>
                    Live Action
                </h3>

                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar relative z-10">
                    {context.history.length > 0 ? (
                        context.history.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-default group/item animate-fadeIn">
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-[11px] font-bold text-white truncate group-hover/item:text-quantum-gold transition-colors">
                                            {item.username}
                                        </span>
                                        <span className="text-[10px] font-mono font-bold text-neon-green group-hover/item:shadow-current transition-all">
                                            +${(item.payout * 45000).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="text-[9px] text-white/40 uppercase flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[10px]">bolt</span>
                                        {item.game}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/20 text-[10px] uppercase font-bold tracking-[0.2em] italic text-center gap-2">
                            <span className="material-symbols-outlined text-2xl opacity-20">radar</span>
                            <span>Scanning Quantum Field...</span>
                        </div>
                    )}
                </div>
            </Card>
        </aside>
    );
};
