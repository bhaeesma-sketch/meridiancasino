import React from 'react';
import { useNavigate } from 'react-router-dom';
import PixelCard from '../components/PixelCard';
import { MeridianButton } from '../components/MeridianButton';

const GameRules: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Welcome Bonuses",
            icon: "celebration",
            color: "from-purple-500/20 to-blue-500/20",
            rules: [
                { label: "Standard Signup", value: "$10 Bonus", sub: "Automatic on registration" },
                { label: "Referral Signup", value: "$25 Bonus", sub: "Using a valid invite code" },
                { label: "Wagering Req.", value: "1.5x Multiplier", sub: "Must wager bonus amount before withdrawal" }
            ]
        },
        {
            title: "Referral Program",
            icon: "groups",
            color: "from-green-500/20 to-emerald-500/20",
            rules: [
                { label: "5+1 Payout", value: "$10 Real Cash", sub: "For every 5 depositing referrals" },
                { label: "Commission", value: "5% - 25%", sub: "Percentage of referred user's wagering" },
                { label: "Elite Tier", value: "25% Share", sub: "Maximum referral commission tier" }
            ]
        },
        {
            title: "Deposits",
            icon: "account_balance_wallet",
            color: "from-orange-500/20 to-yellow-500/20",
            rules: [
                { label: "Minimum Deposit", value: "10 USDT", sub: "TRC20, ERC20, or BEP20" },
                { label: "First Deposit", value: "+$10 Bonus", sub: "One-time extra bonus balance" },
                { label: "Processing", value: "Instant", sub: "Automatic credit after blockchain confirmation" }
            ]
        },
        {
            title: "Withdrawals",
            icon: "payments",
            color: "from-blue-500/20 to-cyan-500/20",
            rules: [
                { label: "Minimum Amount", value: "10 USDT", sub: "Standard for real balance" },
                { label: "Bonus Withdrawal", value: "$50 Goal", sub: "Requires $50 in total bonus winnings" },
                { label: "Approval Time", value: "2 - 24 Hours", sub: "Subject to security audit" }
            ]
        }
    ];

    return (
        <div className="flex-1 flex flex-col p-6 md:p-10 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">
                        Platform <span className="text-quantum-gold">Rules</span>
                    </h1>
                    <p className="text-white/50 font-mono text-sm mt-2 tracking-widest uppercase">
                        Protocol v2.0 // Quantum Legacy Compliance
                    </p>
                </div>
                <MeridianButton
                    variant="secondary"
                    onClick={() => navigate(-1)}
                    className="md:w-auto"
                >
                    <span className="material-symbols-outlined text-sm mr-2">arrow_back</span>
                    Return to previous
                </MeridianButton>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, idx) => (
                    <PixelCard key={idx} className={`relative overflow-hidden group`}>
                        {/* Background Glow */}
                        <div className={`absolute -inset-2 bg-gradient-to-br ${section.color} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        <div className="relative z-10 p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-quantum-gold text-2xl">
                                        {section.icon}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">
                                    {section.title}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {section.rules.map((rule, rIdx) => (
                                    <div key={rIdx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                                        <div>
                                            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                                {rule.label}
                                            </div>
                                            <div className="text-white font-bold group-hover:text-quantum-gold transition-colors">
                                                {rule.value}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-white/30 text-right uppercase italic">
                                            {rule.sub}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </PixelCard>
                ))}
            </div>

            {/* Terms Footer */}
            <div className="p-8 rounded-2xl bg-black/40 border border-white/5 text-center space-y-4 backdrop-blur-xl">
                <p className="text-white/40 text-xs leading-relaxed max-w-3xl mx-auto">
                    All bonuses and rewards are subject to anti-fraud verification. Multi-accounting, referral abuse, or automated wagering will result in permanent account termination and forfeiture of all balances. Withdrawals are processed according to the security protocols outlined in the withdrawal section.
                </p>
                <div className="flex items-center justify-center gap-6">
                    <button onClick={() => navigate('/terms')} className="text-white/30 hover:text-white/60 text-[10px] uppercase tracking-widest transition-colors font-bold underline">Terms of Service</button>
                    <button onClick={() => navigate('/privacy')} className="text-white/30 hover:text-white/60 text-[10px] uppercase tracking-widest transition-colors font-bold underline">Privacy Policy</button>
                </div>
            </div>
        </div>
    );
};

export default GameRules;
