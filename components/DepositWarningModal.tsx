import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';

export const DepositWarningModal: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500"></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-meridian-midnight border border-quantum-gold/30 rounded-2xl p-8 shadow-2xl shadow-quantum-gold/20 animate-in zoom-in-95 duration-300 overflow-hidden">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-quantum-gold to-transparent opacity-50"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-quantum-gold/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-plasma-purple/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-quantum-gold/10 border border-quantum-gold/30 flex items-center justify-center mb-2 shadow-gold-glow animate-pulse-slow">
                        <span className="material-symbols-outlined text-3xl text-quantum-gold">lock</span>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            Active Player Status Required
                        </h2>
                        <div className="h-0.5 w-16 bg-quantum-gold/50 mx-auto rounded-full"></div>
                    </div>

                    {/* Description */}
                    <p className="text-white/70 text-sm leading-relaxed max-w-sm">
                        To ensure a premium gaming experience and access real-money tables, proper account activation is required.
                        <br /><br />
                        <span className="text-quantum-gold font-bold">Requirement:</span> Minimum deposit of <span className="text-white font-bold">$10.00</span>
                    </p>

                    {/* Actions */}
                    <div className="w-full space-y-3 pt-2">
                        <Button
                            variant="primary"
                            fullWidth
                            size="lg"
                            className="shadow-gold-glow"
                            onClick={() => navigate('/deposit', { state: { from: location } })}
                        >
                            <span className="material-symbols-outlined">payments</span>
                            Deposit Now
                        </Button>

                        <button
                            onClick={() => navigate('/lobby')}
                            className="text-xs text-white/40 hover:text-white uppercase tracking-widest font-bold transition-colors py-2"
                        >
                            Return to Lobby
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
