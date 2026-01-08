import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext, AppContextType } from '../App';
import { sounds } from '../services/soundService';

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const context = React.useContext(AppContext) as AppContextType | null;

    if (!context || !context.isConnected) return null;
    const { user } = context;

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-20 px-6 lg:px-10 flex items-center justify-between bg-[var(--neo-glass-bg)] backdrop-blur-xl border-b border-[var(--neo-border-color)] shadow-[var(--neo-shadow-inset)] transition-all duration-300">
            {/* Logo Section */}
            <div
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => {
                    sounds.playClick();
                    navigate('/lobby');
                }}
            >
                <div className="size-10 bg-[var(--neo-glass-bg)] border border-neon-blue/50 rounded-[var(--neo-border-radius)] flex items-center justify-center text-neon-blue shadow-neon-blue group-hover:shadow-[0_0_15px_rgba(0,229,255,0.6)] transition-all">
                    <span className="material-symbols-outlined text-2xl animate-pulse-neon">token</span>
                </div>
                <h1 className="text-white text-2xl lg:text-3xl font-heading font-black tracking-tighter uppercase glitch-text drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" data-text="DATASTREAM">
                    DATASTREAM
                </h1>
            </div>

            {/* Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-2 bg-[var(--neo-glass-bg)] px-6 py-1.5 rounded-[var(--neo-border-radius)] border border-[var(--neo-border-color)] backdrop-blur-md shadow-[var(--neo-shadow-inset)]">
                {[
                    { name: 'Dashboards', path: '/lobby', color: 'neon-blue' },
                    { name: 'Analytics', path: '/history', color: 'neon-pink' },
                    { name: 'Alerts', path: '/notifications', color: 'neon-purple' }
                ].map((item) => (
                    <a
                        key={item.name}
                        onClick={() => navigate(item.path)}
                        className={`relative group/link px-4 py-2 cursor-pointer ${location.pathname === item.path ? `text-${item.color}` : 'text-white/70'}`}
                    >
                        <span className={`relative z-10 group-hover/link:text-${item.color} transition-colors font-refined font-bold text-xs uppercase tracking-widest`}>
                            {item.name}
                        </span>
                        <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-${item.color} transform scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300`}></span>
                    </a>
                ))}
            </nav>

            {/* Right Side: Wallet & Actions */}
            <div className="flex items-center gap-6">

                {/* Wallet Display */}
                <div className="hidden md:flex flex-col items-end border-r-[1px] border-[var(--neo-border-color)] pr-4">
                    <div className="flex items-center gap-2 text-neon-blue drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]">
                        <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                        <span className="font-mono text-lg font-bold tracking-tight">
                            {formatCurrency(user.real_balance)}
                        </span>
                    </div>
                    <span className="text-neon-pink/80 text-[10px] font-mono font-bold tracking-wider">
                        BONUS: {formatCurrency(user.bonus_balance)}
                    </span>
                </div>

                {/* Admin Button (Visible only to Admins) */}
                {user.isAdmin && (
                    <button
                        onClick={() => navigate('/admin-panel')}
                        className="bg-red-500/10 border border-red-500 text-red-500 h-10 px-4 font-refined font-bold text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.4)] rounded-[var(--neo-border-radius)] hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center gap-2 group ml-2"
                    >
                        <span className="material-symbols-outlined text-lg">security</span>
                        ADMIN
                    </button>
                )}

                {/* Configure / Deposit Button */}
                <button
                    onClick={() => navigate('/deposit')}
                    className="bg-[var(--neo-glass-bg)] hover:bg-neon-green/10 border border-neon-green text-neon-green h-10 px-6 font-refined font-bold text-xs uppercase tracking-wider shadow-neon-green rounded-[var(--neo-border-radius)] hover:text-black hover:bg-neon-green transition-all duration-300 flex items-center gap-2 group shadow-[var(--neo-shadow-inset)]"
                >
                    <span className="material-symbols-outlined text-lg group-hover:animate-spin">settings_motion_mode</span>
                    DEPOSIT
                </button>

                {/* User Avatar */}
                <div className="relative group cursor-pointer" onClick={() => navigate('/profile')}>
                    <div className="absolute inset-0 bg-neon-blue rounded-full blur-sm opacity-50 animate-pulse group-hover:opacity-80 transition-opacity"></div>
                    <div
                        className="relative size-10 rounded-[var(--neo-border-radius)] bg-cover bg-center border border-neon-blue hover:sepia transition-all"
                        style={{ backgroundImage: `url("https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}&backgroundColor=1a1a2e")` }}
                    ></div>
                </div>
            </div>
        </header>
    );
};
