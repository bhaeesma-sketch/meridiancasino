import React, { useState } from 'react';
import { getReferralMultiplier, getPremiumReferralBonus } from '../../services/referralService';

interface ReferralSectionProps {
    user: any; // Using any for simplicity as User type isn't uniform across context yet, or I should import User type
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({ user }) => {
    const [copied, setCopied] = useState(false);

    const referralCode = user.referralCode || 'GENERATING...';
    const referralEarnings = user.referralEarnings || 0;
    const referralCount = user.referralCount || 0;
    const activeReferrals = user.activeReferrals || 0;
    const referralMultiplier = getReferralMultiplier(user.tier);
    const premiumBonus = getPremiumReferralBonus(user.tier);
    const isPremium = ['VIP Platinum', 'Diamond', 'Elite'].includes(user.tier);
    const referralUrl = `clash.gg/ref/${referralCode}`;

    const handleCopyReferral = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                    <span className="material-symbols-outlined text-plasma">hub</span> Referral Empire
                </h3>
                {isPremium && (
                    <span className="px-3 py-1 bg-quantum-gold/20 border border-quantum-gold text-quantum-gold text-xs font-bold uppercase rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                        Premium Benefits
                    </span>
                )}
            </div>
            <div className="bg-black/40 p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col gap-6 md:gap-8">
                {/* Premium Badge Overlay */}
                {isPremium && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-quantum-gold/20 border border-quantum-gold/50 text-quantum-gold text-[10px] font-bold uppercase rounded-full">
                        {referralMultiplier * 100}% Commission
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Earnings</p>
                        <p className="text-2xl md:text-3xl font-bold text-primary">${referralEarnings.toFixed(2)}</p>
                        {isPremium && (
                            <p className="text-[10px] text-quantum-gold mt-1">+{premiumBonus.wageringBonus * 100}% per wager</p>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Referrals</p>
                        <p className="text-2xl md:text-3xl font-bold">{referralCount}</p>
                        <p className="text-[10px] text-green-400 mt-1">{activeReferrals} active</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Commission Rate</p>
                        <p className="text-2xl md:text-3xl font-bold text-plasma">{Math.round(referralMultiplier * 100)}%</p>
                        {isPremium && (
                            <p className="text-[10px] text-quantum-gold mt-1">Premium Tier</p>
                        )}
                    </div>
                </div>

                {/* Premium Benefits Display */}
                {isPremium && (
                    <div className="bg-gradient-to-r from-quantum-gold/10 to-yellow-500/5 border border-quantum-gold/30 rounded-xl p-4 md:p-6">
                        <h4 className="text-sm font-bold text-quantum-gold mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">workspace_premium</span>
                            Premium Referral Benefits
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-quantum-gold text-base">check_circle</span>
                                <span>${premiumBonus.signupBonus} per signup</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-quantum-gold text-base">check_circle</span>
                                <span>{premiumBonus.wageringBonus * 100}% wagering bonus</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-quantum-gold text-base">check_circle</span>
                                <span>Monthly bonuses</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-quantum-gold text-base">check_circle</span>
                                <span>Exclusive rewards</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Social Share Buttons (Simplified) */}
                <div className="flex gap-2 flex-wrap">
                    <a
                        href={`https://twitter.com/intent/tweet?text=Join%20me%20on%20Clash&url=${encodeURIComponent(referralUrl)}`}
                        target="_blank"
                        className="px-4 py-2 bg-[#1DA1F2]/20 text-[#1DA1F2] border border-[#1DA1F2]/50 font-bold rounded-lg text-xs hover:bg-[#1DA1F2]/30 transition-all flex items-center gap-2"
                    >
                        Tweet
                    </a>
                    {/* Can add more here later */}
                </div>


                {/* Referral Link */}
                <div className="bg-black/60 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
                    <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">link</span>
                        Your Referral Link
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl font-mono text-sm md:text-base text-gray-300 truncate flex items-center">
                            {referralUrl}
                        </div>
                        <button
                            onClick={handleCopyReferral}
                            className="bg-primary text-black font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
