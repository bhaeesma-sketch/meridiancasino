import React, { useState } from 'react';
import { getReferralMultiplier, NEW_USER_BONUS } from '../../services/referralService';

interface ReferralSectionProps {
    user: any;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({ user }) => {
    const [copied, setCopied] = useState(false);

    // Ensure we use the correct property name from the User object
    const referralCode = user.referralCode || user.referral_code || '...';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const referralUrl = `${baseUrl}/#/auth?ref=${referralCode}`;
    const progress = (user.valid_referral_count || 0) % 5;
    const nextReward = 5 - progress;

    const handleCopyReferral = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareSocial = (platform: 'twitter' | 'telegram') => {
        const text = `Join me on Casino Clash and get a $25 Welcome Bonus! 🎰 Use my link: ${referralUrl}`;
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(text)}`
        };
        window.open(urls[platform], '_blank');
    };

    return (
        <div className="flex flex-col gap-6 animate-deep-fade-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neon-green/30 pb-4">
                <div>
                    <h3 className="text-xl font-heading font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-neon-green animate-pulse">hub</span>
                        NETWORK EXPANSION PROTOCOL
                    </h3>
                    <p className="text-neo-text-muted text-[10px] font-mono mt-1">
                        &gt;&gt; ESTABLISH NEW NODES. SECURE CAPITAL.
                    </p>
                </div>
                <div className="px-3 py-1 bg-neon-green/10 border border-neon-green text-neon-green text-[10px] font-bold font-mono tracking-widest rounded animate-pulse-glow">
                    STATUS: ACTIVE
                </div>
            </div>

            {/* Main Stats & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Your Referral Progress */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Expansion Progress</h4>
                            <p className="text-xs text-white/40 font-refined mt-1">Secure 5 confirmed nodes to unlock a $10 credit.</p>
                        </div>
                        <div className="size-10 bg-neon-green/10 rounded-full flex items-center justify-center text-neon-green border border-neon-green/30 tracking-tighter font-black">
                            {progress}/5
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="h-4 w-full bg-black/40 rounded-full border border-white/5 p-1 relative overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-neon-green via-white to-neon-green bg-[length:200%_auto] animate-shimmer rounded-full transition-all duration-1000"
                                style={{ width: `${(progress / 5) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-neon-green/60 px-1">
                            <span>{user.valid_referral_count || 0} TOTAL CONFIRMED</span>
                            <span>{nextReward} MORE FOR $10 REWARD</span>
                        </div>
                    </div>

                    {/* Quick Rules */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="material-symbols-outlined text-neon-yellow">loyalty</span>
                            <div>
                                <div className="text-[10px] font-bold text-white/80 uppercase">Friend Bonus</div>
                                <div className="text-sm font-bold text-neon-yellow">$25.00 STARTUP</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="material-symbols-outlined text-neon-blue">monetization_on</span>
                            <div>
                                <div className="text-[10px] font-bold text-white/80 uppercase">Your Reward</div>
                                <div className="text-sm font-bold text-neon-blue">$10.00 PER 5 NODES</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Uplink Control */}
                <div className="relative overflow-hidden rounded-2xl border border-neon-blue/30 bg-neon-blue/5 p-6 flex flex-col gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neon-blue font-mono uppercase tracking-[0.2em]">Unique Uplink Address</label>
                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-sm text-center tracking-wider text-neon-blue break-all">
                            {referralUrl}
                        </div>
                        <button
                            onClick={handleCopyReferral}
                            className={`w-full py-3 rounded-xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${copied ? 'bg-neon-green text-black' : 'bg-neon-blue text-black hover:scale-105'}`}
                        >
                            <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                            {copied ? 'UPLINK COPIED' : 'COPY ACCESS URL'}
                        </button>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => shareSocial('twitter')}
                            className="flex-1 py-3 bg-white/5 border border-white/10 hover:border-white/30 text-white rounded-xl flex items-center justify-center transition-all hover:-translate-y-1"
                        >
                            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" /></svg>
                        </button>
                        <button
                            onClick={() => shareSocial('telegram')}
                            className="flex-1 py-3 bg-white/5 border border-white/10 hover:border-white/30 text-white rounded-xl flex items-center justify-center transition-all hover:-translate-y-1"
                        >
                            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0C5.346 0 0 5.346 0 11.944c0 10.61 11.832 23.336 12 23.51a.997.997 0 00.56.24.99.99 0 00.673-.242C13.8 35.28 24 22.518 24 11.944 24 5.346 18.654 0 11.944 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" /><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701-.332 4.981c.488 0 .704-.223.977-.485l2.344-2.279 4.875 3.597c.897.494 1.543.24 1.768-.832l3.193-15.046c.328-1.312-.497-1.907-1.353-1.503z" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Referral Info / History Table placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Node Activity Log */}
                <div className="glass-panel rounded-2xl border border-white/5 p-6 bg-white/5 flex flex-col">
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[.3em] mb-4">Node Activity Log</h4>
                    <div className="space-y-3 flex-1">
                        {user.referralCount > 0 ? (
                            <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded bg-neon-green/20 flex items-center justify-center text-neon-green text-xs font-mono">ID</div>
                                    <div>
                                        <div className="text-xs font-bold text-white">SECURE_NODE_01</div>
                                        <div className="text-[10px] text-white/40 uppercase font-mono">STATUS: VALIDATED</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-neon-green">+$25.00</div>
                                    <div className="text-[10px] text-white/40 uppercase font-mono">CREDITED</div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-white/5 rounded-2xl flex-1">
                                <span className="material-symbols-outlined text-white/10 text-5xl">radar</span>
                                <div className="text-white/20 font-bold uppercase tracking-widest text-xs">No active nodes detected in your subnet.</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Promo Asset */}
                <div className="glass-panel rounded-2xl border border-quantum-gold/30 p-6 bg-quantum-gold/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3">
                        <span className="px-2 py-1 bg-quantum-gold text-black text-[8px] font-black rounded uppercase tracking-tighter shadow-gold-glow">4K ASSET</span>
                    </div>
                    <h4 className="text-[10px] font-bold text-quantum-gold uppercase tracking-[.3em] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">image</span>
                        PROMOTIONAL UPLINK MEDIA
                    </h4>

                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group-hover:border-quantum-gold/50 transition-all">
                        <img
                            src="/assets/promo/referral_bonus_4k.png"
                            alt="Referral Bonus Promo"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                            <div className="text-[10px] text-white font-black uppercase tracking-widest drop-shadow-lg">
                                Casino Clash <span className="text-neon-blue">Referral</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                        <div className="flex gap-3">
                            <a
                                href="/assets/promo/referral_bonus_4k.png"
                                download="CasinoClash_Referral_4K.png"
                                className="flex-1 py-2.5 bg-quantum-gold text-black rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-gold-glow"
                            >
                                <span className="material-symbols-outlined text-sm">download</span>
                                Download Image
                            </a>
                            <button
                                onClick={() => window.open('/assets/promo/referral_bonus_4k.png', '_blank')}
                                className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                            </button>
                        </div>

                        <button
                            onClick={handleCopyReferral}
                            className={`w-full py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all ${copied ? 'bg-neon-green text-black' : 'bg-white/10 text-white border border-white/10 hover:border-quantum-gold/50'}`}
                        >
                            <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'link'}</span>
                            {copied ? 'UPLINK COPIED' : 'COPY REFERRAL LINK'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
