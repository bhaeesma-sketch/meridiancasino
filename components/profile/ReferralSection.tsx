import React, { useState } from 'react';
import { getReferralMultiplier, getPremiumReferralBonus } from '../../services/referralService';

interface ReferralSectionProps {
    user: any;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({ user }) => {
    const [copied, setCopied] = useState(false);

    const referralCode = user.referralCode || 'GENERATING...';
    // const referralEarnings = user.referralEarnings || 0; 
    // const referralCount = user.referralCount || 0;
    // const activeReferrals = user.activeReferrals || 0; // Keeping functional logic, just visual update
    const referralUrl = `clash.gg/ref/${referralCode}`;

    const handleCopyReferral = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-6 animate-deep-fade-up" style={{ animationDelay: '0.2s' }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neon-green/30 pb-4">
                <div>
                    <h3 className="text-xl font-heading font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-neon-green animate-pulse">hub</span>
                        Network Expansion Protocol
                    </h3>
                    <p className="text-neo-text-muted text-[10px] font-mono mt-1">
                        &gt;&gt; EXPAND THE GRID. EARN REWARDS.
                    </p>
                </div>
                <div className="px-3 py-1 bg-neon-green/10 border border-neon-green text-neon-green text-[10px] font-bold font-mono tracking-widest rounded animate-pulse-glow">
                    STATUS: ACTIVE
                </div>
            </div>

            {/* Main Visual / Stats Container */}
            <div className="relative overflow-hidden rounded-[var(--neo-border-radius)] border border-[var(--neo-border-color)] bg-[var(--neo-glass-bg)] shadow-[var(--neo-shadow-inset)] group">
                {/* Visual Background */}
                <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://as2.ftcdn.net/v2/jpg/02/85/02/76/1000_F_285027663_Ka8w9c2f6y8y2y2y2y2y2y2y2y2y.jpg')] bg-cover mix-blend-screen pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#050510] via-transparent to-[#050510] z-0"></div>

                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">

                    {/* Visual Node Graph (CSS Representation) */}
                    <div className="relative size-32 md:size-40 flex-shrink-0 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-neon-blue/30 animate-spin-slow"></div>
                        <div className="absolute inset-2 rounded-full border border-dashed border-neon-pink/30 animate-spin-reverse-slower"></div>
                        <div className="size-16 rounded-full bg-neon-blue/10 border border-neon-blue flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)] animate-pulse">
                            <span className="material-symbols-outlined text-4xl text-neon-blue">share</span>
                        </div>
                        {/* Nodes */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 size-3 bg-neon-green rounded-full shadow-[0_0_10px_#00FFC0]"></div>
                        <div className="absolute bottom-4 right-2 size-2 bg-neon-purple rounded-full shadow-[0_0_10px_#4FD1C5]"></div>
                        <div className="absolute bottom-4 left-2 size-2 bg-neon-yellow rounded-full shadow-[0_0_10px_#A7ECEE]"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 w-full space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border border-white/5 bg-black/40 rounded">
                                <div className="text-[10px] text-gray-500 font-mono uppercase">Total Earnings</div>
                                <div className="text-xl font-bold text-neon-green font-heading">$ {user.referralEarnings?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div className="p-3 border border-white/5 bg-black/40 rounded">
                                <div className="text-[10px] text-gray-500 font-mono uppercase">Network Size</div>
                                <div className="text-xl font-bold text-white font-heading">{user.referralCount || 0} nodes</div>
                            </div>
                        </div>

                        {/* Link Copy */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-neon-blue font-mono uppercase">Unique Uplink Access Code</label>
                            <div className="flex gap-0">
                                <div className="flex-1 bg-black/60 border border-neon-blue/30 border-r-0 rounded-l p-3 font-mono text-sm text-gray-300 truncate tracking-wider">
                                    {referralUrl}
                                </div>
                                <button
                                    onClick={handleCopyReferral}
                                    className="bg-neon-blue/10 border border-neon-blue text-neon-blue px-6 font-bold uppercase text-xs tracking-widest hover:bg-neon-blue hover:text-black transition-all rounded-r flex items-center gap-2 group/btn"
                                >
                                    {copied ? (
                                        <>
                                            <span className="material-symbols-outlined text-sm">check</span>
                                            COPIED
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm group-hover/btn:animate-bounce">content_copy</span>
                                            COPY
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Promo Banner */}
            <div className="relative p-4 rounded border border-neon-purple/30 bg-neon-purple/5 flex items-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="size-10 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple">
                    <span className="material-symbols-outlined">diamond</span>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm uppercase tracking-wider">Premium Access</h4>
                    <p className="text-xs text-gray-400">Upgrade to VIP to earn 2x network rewards.</p>
                </div>
            </div>
        </div>
    );
};
