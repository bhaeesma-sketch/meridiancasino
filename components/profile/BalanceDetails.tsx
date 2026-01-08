import React from 'react';

interface BalanceDetailsProps {
    realBalance: number;
    bonusBalance: number;
    totalDeposited: number;
    totalWagered: number;
}

export const BalanceDetails: React.FC<BalanceDetailsProps> = ({ realBalance, bonusBalance, totalDeposited, totalWagered }) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                {/* Real Balance Card */}
                <div className="bg-gradient-to-br from-quantum-gold/20 to-black border border-quantum-gold/50 rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-quantum-gold/10 material-symbols-outlined text-9xl group-hover:scale-110 transition-transform">account_balance_wallet</div>
                    <h4 className="text-quantum-gold font-heading text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="size-2 bg-quantum-gold rounded-full animate-pulse"></span>
                        Real Balance
                    </h4>
                    <p className="text-3xl font-black text-white relative z-10">${realBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <button className="mt-4 px-4 py-2 bg-quantum-gold text-black text-xs font-black uppercase rounded shadow-gold-glow hover:scale-105 transition-transform">
                        Deposit Funds
                    </button>
                </div>

                {/* Bonus Balance Card */}
                <div className="bg-gradient-to-br from-plasma-purple/20 to-black border border-plasma-purple/50 rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-plasma-purple/10 material-symbols-outlined text-9xl group-hover:scale-110 transition-transform">stars</div>
                    <h4 className="text-plasma-purple font-heading text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="size-2 bg-plasma-purple rounded-full animate-pulse"></span>
                        Bonus Balance
                    </h4>
                    <p className="text-3xl font-black text-white relative z-10">${bonusBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p className="mt-4 text-[10px] text-gray-400">
                        Wager Requirement: <span className="text-white font-bold">{(totalWagered * 0.1).toFixed(2)} / 5000.00</span>
                    </p>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-plasma-purple w-[25%]"></div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Total Deposited</span>
                    <span className="text-lg font-mono font-bold text-white">${totalDeposited.toLocaleString()}</span>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Total Wagered</span>
                    <span className="text-lg font-mono font-bold text-white">${totalWagered.toLocaleString()}</span>
                </div>
                {/* Placeholders for other stats */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">VIP Tier</span>
                    <span className="text-lg font-heading font-black text-quantum-gold">Platinum</span>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Cashback</span>
                    <span className="text-lg font-mono font-bold text-green-400">5.5%</span>
                </div>
            </div>
        </div>
    );
};
