import React from 'react';
import { sounds } from '../services/soundService';

interface BetControlsProps {
    betAmount: number;
    setBetAmount: (amount: number) => void;
    balance: number;
    minBet?: number;
    maxBet?: number;
    disabled?: boolean;
}

export const BetControls: React.FC<BetControlsProps> = ({
    betAmount,
    setBetAmount,
    balance,
    minBet = 0.1,
    maxBet = 10000,
    disabled = false
}) => {

    const handleAdjustBet = (type: 'half' | 'double' | 'max' | 'min') => {
        if (disabled) return;
        let newBet = betAmount;

        switch (type) {
            case 'half':
                newBet = Math.max(minBet, betAmount / 2);
                break;
            case 'double':
                newBet = Math.min(maxBet, Math.min(balance, betAmount * 2));
                break;
            case 'max':
                newBet = Math.min(maxBet, balance);
                break;
            case 'min':
                newBet = minBet;
                break;
        }

        // Round to 2 decimals to avoid floating point weirdness
        newBet = Math.round(newBet * 100) / 100;

        if (newBet !== betAmount) {
            setBetAmount(newBet);
            sounds.playHover();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            setBetAmount(val);
        }
    };

    return (
        <div className="bg-black/60 border border-white/10 rounded-xl p-3 flex flex-col gap-2 relative group focus-within:border-quantum-gold/50 transition-colors">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-gray-500">
                <label>Bet Amount</label>
                <span className={betAmount > balance ? 'text-red-500' : 'text-gray-500'}>
                    Max: ${balance.toFixed(2)}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-quantum-gold font-bold">$</span>
                    <input
                        type="number"
                        min={minBet}
                        max={maxBet}
                        value={betAmount}
                        onChange={handleInputChange}
                        disabled={disabled}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-7 pr-2 text-white font-mono font-bold focus:outline-none focus:bg-white/10 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-1 mt-1">
                <button
                    onClick={() => handleAdjustBet('min')}
                    disabled={disabled}
                    className="py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-mono font-bold text-white/60 hover:text-white transition-all uppercase"
                >
                    Min
                </button>
                <button
                    onClick={() => handleAdjustBet('half')}
                    disabled={disabled}
                    className="py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-mono font-bold text-white/60 hover:text-white transition-all uppercase"
                >
                    1/2
                </button>
                <button
                    onClick={() => handleAdjustBet('double')}
                    disabled={disabled}
                    className="py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-mono font-bold text-white/60 hover:text-white transition-all uppercase"
                >
                    2x
                </button>
                <button
                    onClick={() => handleAdjustBet('max')}
                    disabled={disabled}
                    className="py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-mono font-bold text-quantum-gold hover:text-white transition-all uppercase"
                >
                    Max
                </button>
            </div>
        </div>
    );
};
