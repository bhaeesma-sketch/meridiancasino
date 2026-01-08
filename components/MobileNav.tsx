import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AppContext } from '../App';

export const MobileNav: React.FC = () => {
    const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext) || {};
    const location = useLocation();

    // Hide if not logged in (handled by parent usually, but safe check)
    // Actually Auth screen might need to hide this.
    // Assuming this is only rendered inside authenticated view or handled by layout.

    if (location.pathname === '/' || location.pathname === '/auth') return null;

    const navItems = [
        { name: 'Lobby', icon: 'grid_view', path: '/lobby' },
        { name: 'Wallet', icon: 'account_balance_wallet', path: '/deposit' }, // Or withdraw, or a modal
        { name: 'Profile', icon: 'person', path: '/profile' },
        { name: 'Rewards', icon: 'military_tech', path: '/rewards' },
    ];

    return (
        <div className="md:hidden fixed bottom-10 left-0 right-0 h-16 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-around px-2 pb-2 safe-area-bottom">
            {navItems.map(item => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive ? 'text-quantum-gold' : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <span className={`material-symbols-outlined text-2xl ${location.pathname === item.path ? 'fill-current' : ''}`}>
                        {item.icon}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide mt-1">{item.name}</span>
                </NavLink>
            ))}

            <button
                onClick={() => setIsSettingsOpen?.(!isSettingsOpen)}
                className="flex flex-col items-center justify-center p-2 text-gray-500 hover:text-gray-300 transition-all"
            >
                <span className="material-symbols-outlined text-2xl">settings</span>
                <span className="text-[10px] font-bold uppercase tracking-wide mt-1">Settings</span>
            </button>
        </div>
    );
};
