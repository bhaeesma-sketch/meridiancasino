import React, { useState, useEffect } from 'react';
import { NEW_USER_BONUS } from '../services/referralService';
import { sounds } from '../services/soundService';

interface DatastreamBonusModalProps {
    isOpen: boolean;
    onClaim: () => void;
    bonusAmount: number;
}

export const DatastreamBonusModal: React.FC<DatastreamBonusModalProps> = ({ isOpen, onClaim, bonusAmount }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            sounds.playClick(); // Initial sound
            const timers = [
                setTimeout(() => setStep(1), 500), // "Incoming Transmission"
                setTimeout(() => setStep(2), 1500), // "analyzing..."
                setTimeout(() => setStep(3), 2500), // Show reward
            ];
            return () => timers.forEach(clearTimeout);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-[500px] border border-neon-green/50 bg-[#050510] rounded-lg shadow-[0_0_50px_rgba(0,255,192,0.2)] overflow-hidden animate-pop-in">

                {/* Header Scanner Effect */}
                <div className="h-1 w-full bg-neon-green/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-neon-green animate-scanline"></div>
                </div>

                <div className="p-8 flex flex-col items-center text-center space-y-6">

                    {/* Icon / Status */}
                    <div className="size-20 bg-neon-green/10 rounded-full border border-neon-green flex items-center justify-center relative group">
                        <div className="absolute inset-0 border border-neon-green rounded-full animate-ping opacity-20"></div>
                        <span className={`material-symbols-outlined text-4xl text-neon-green transition-all duration-500 ${step >= 3 ? 'scale-110' : 'scale-100'}`}>
                            {step < 3 ? 'satellite_alt' : 'savings'}
                        </span>
                    </div>

                    {/* Text Sequence */}
                    <div className="h-24 flex flex-col items-center justify-center">
                        {step === 0 && (
                            <h2 className="text-xl font-mono text-neon-green font-bold animate-pulse">
                                ESTABLISHING UPLINK...
                            </h2>
                        )}
                        {step === 1 && (
                            <h2 className="text-xl font-mono text-neon-green font-bold typing-effect">
                                INCOMING SECURE PACKET
                            </h2>
                        )}
                        {step === 2 && (
                            <div className="space-y-2">
                                <h2 className="text-xl font-mono text-white font-bold">DECRYPTING ASSETS...</h2>
                                <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-neon-green animate-[width_1s_ease-out_forwards]" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                        )}
                        {step >= 3 && (
                            <div className="animate-deep-fade-up">
                                <h2 className="text-3xl font-heading font-black text-white mb-2 uppercase tracking-tighter">
                                    WELCOME BONUS
                                </h2>
                                <p className="text-neon-green font-mono text-lg font-bold tracking-widest animate-pulse">
                                    VALIDATED: ${bonusAmount.toFixed(2)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    {step >= 3 && (
                        <button
                            onClick={onClaim}
                            className="w-full py-4 bg-neon-green hover:bg-white text-black font-black font-heading uppercase tracking-widest text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,255,192,0.4)] hover:shadow-[0_0_40px_rgba(0,255,192,0.6)] rounded clip-button animate-bounce-subtle"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">download</span>
                                Claim Assets
                            </span>
                        </button>
                    )}
                </div>

                {/* Footer metadata */}
                <div className="bg-black/40 p-2 flex justify-between px-6 border-t border-white/5 text-[10px] font-mono text-white/30 uppercase">
                    <span>ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    <span>SECURE: TLS 1.3</span>
                </div>
            </div>
        </div>
    );
};
