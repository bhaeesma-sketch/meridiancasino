import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../App';
import { sounds } from '../services/soundService';
import { AnimatedLogo } from './AnimatedLogo';
import { Button } from './ui/Button';

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const context = React.useContext(AppContext) as AppContextType | null;

    if (!context || !context.isConnected) return null;
    const { user } = context;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 px-4 md:px-6 lg:px-10 flex items-center justify-between bg-space-black/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">

            {/* Logo */}
            <div
                className="flex items-center gap-3 cursor-pointer group/logo"
                onClick={() => {
                    sounds.playClick();
                    navigate('/lobby');
                }}
            >
                <AnimatedLogo className="scale-75 md:scale-100 origin-left" />
            </div>

            {/* Right Side: Wallet & User */}
            <div className="flex items-center gap-3 md:gap-6">

                {/* Wallet Display */}
                <div className="hidden md:flex flex-col items-end mr-2">
                    <div className="flex items-baseline gap-1 text-quantum-gold drop-shadow-sm font-mono">
                        <span className="text-xs opacity-70">$</span>
                        <span className="text-xl font-bold tracking-tight">{formatCurrency(user.real_balance).replace('$', '')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-white/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-green/50 animate-pulse"></span>
                        <span>Real Balance</span>
                        <span className="text-quantum-accent/70 ml-2">
                            + {formatCurrency(user.bonus_balance).replace('$', '')} Bonus
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="primary"
                        size="md"
                        className="hidden md:flex shadow-gold-glow animate-pulse-slow"
                        onClick={() => {
                            sounds.playClick();
                            navigate('/withdraw');
                        }}
                    >
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                        <span>Wallet</span>
                    </Button>

                    {/* Mobile Deposit (Icon Only) */}
                    <Button
                        variant="primary"
                        size="sm"
                        className="md:hidden !px-3"
                        onClick={() => {
                            sounds.playClick();
                            navigate('/withdraw');
                        }}
                    >
                        <span className="material-symbols-outlined">add</span>
                    </Button>

                    {/* User Avatar */}
                    <div
                        className="relative cursor-pointer group"
                        onClick={() => {
                            sounds.playClick();
                            navigate('/profile');
                        }}
                    >
                        <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-space-card border border-white/10 overflow-hidden relative group-hover:border-quantum-gold/50 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}&backgroundColor=1a1a2e`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Level Badge */}
                        <div className="absolute -bottom-1 -right-1 bg-space-black text-[9px] font-bold text-quantum-gold border border-quantum-gold/30 px-1 rounded-md">
                            LVL 1
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
