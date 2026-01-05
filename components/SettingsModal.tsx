import React, { useContext } from 'react';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';

const SettingsModal: React.FC = () => {
    const context = useContext(AppContext);
    if (!context || !context.isSettingsOpen) return null;

    const { setIsSettingsOpen, user } = context;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={() => setIsSettingsOpen(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-space-black border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-pop-in">
                <div className="absolute inset-0 bg-mesh opacity-5 pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-quantum-gold/10 border border-quantum-gold/30 flex items-center justify-center text-quantum-gold shadow-gold-glow-sm">
                            <span className="material-symbols-outlined">settings</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-black uppercase tracking-tighter">System Config</h2>
                            <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest flex items-center gap-1.5">
                                <span className="size-1 bg-green-500 rounded-full animate-pulse"></span>
                                Core Settings
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            sounds.playClick();
                            setIsSettingsOpen(false);
                        }}
                        className="size-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all hover:bg-white/10"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 relative z-10 max-h-[60vh] overflow-y-auto custom-scrollbar-hidden">

                    {/* Account Overview */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Profile Link</h3>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="size-14 rounded-xl bg-cover bg-center border border-white/10 shadow-holo-glow" style={{ backgroundImage: `url(${user.avatar})` }}></div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white transition-colors uppercase tracking-tight">{user.username}</div>
                                <div className="text-[10px] font-mono text-quantum-gold/70 mt-0.5">EST. 2026.01.05</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-mono font-bold text-green-400">${user.balance.toLocaleString()}</div>
                                <div className="text-[8px] text-white/30 uppercase tracking-widest mt-1">Available Credits</div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Preferences</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => sounds.playClick()}
                                className="flex flex-col gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-quantum-gold/30 transition-all text-left group"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="material-symbols-outlined text-quantum-gold text-2xl group-hover:scale-110 transition-transform">volume_up</span>
                                    <div className="size-4 rounded-full border border-quantum-gold/50 flex items-center justify-center p-0.5">
                                        <div className="size-full bg-quantum-gold rounded-full"></div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Audio Effects</span>
                            </button>

                            <button
                                onClick={() => sounds.playClick()}
                                className="flex flex-col gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-plasma-purple/30 transition-all text-left group"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="material-symbols-outlined text-plasma-purple text-2xl group-hover:scale-110 transition-transform">bolt</span>
                                    <div className="size-4 rounded-full border border-plasma-purple/50 flex items-center justify-center p-0.5">
                                        <div className="size-full bg-plasma-purple rounded-full"></div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Performance</span>
                            </button>
                        </div>
                    </div>

                    {/* Support & Links */}
                    <div className="grid grid-cols-3 gap-3 pt-4">
                        <button className="flex flex-col items-center gap-2 py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                            <span className="material-symbols-outlined text-white/50">support_agent</span>
                            <span className="text-[8px] font-black uppercase text-white/40">Support</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                            <span className="material-symbols-outlined text-white/50">shield</span>
                            <span className="text-[8px] font-black uppercase text-white/40">Safety</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                            <span className="material-symbols-outlined text-white/50">policy</span>
                            <span className="text-[8px] font-black uppercase text-white/40">Terms</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-black/20 text-center border-t border-white/5 relative z-10">
                    <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">Quantum OS v1.0.42_PROD</div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
