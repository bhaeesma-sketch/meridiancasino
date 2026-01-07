import * as React from 'react';
import { useEffect, useState } from 'react';
import { MeridianButton } from './MeridianButton';
import { Card } from './ui/Card';

export type SecurityEventType = 'LOCK' | 'SUSPENDED' | 'DEPOSIT_REQUIRED' | 'WARNING';

interface SecurityModalProps {
    type: SecurityEventType;
    message: string;
    description?: string;
    onAcknowledge: () => void;
    onAction?: () => void;
    actionLabel?: string;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
    type,
    message,
    description,
    onAcknowledge,
    onAction,
    actionLabel
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Configuration based on type
    const config = {
        LOCK: {
            icon: 'lock_clock',
            color: 'text-red-500',
            bg: 'from-red-900/40 to-black',
            borderColor: 'border-red-500/50',
            title: 'SECURITY LOCKOUT'
        },
        SUSPENDED: {
            icon: 'gpp_bad',
            color: 'text-red-500',
            bg: 'from-red-900/40 to-black',
            borderColor: 'border-red-500/50',
            title: 'ACCOUNT SUSPENDED'
        },
        DEPOSIT_REQUIRED: {
            icon: 'account_balance_wallet',
            color: 'text-quantum-gold',
            bg: 'from-yellow-900/40 to-black',
            borderColor: 'border-quantum-gold/50',
            title: 'DEPOSIT REQUIRED'
        },
        WARNING: {
            icon: 'warning',
            color: 'text-orange-500',
            bg: 'from-orange-900/40 to-black',
            borderColor: 'border-orange-500/50',
            title: 'SECURITY WARNING'
        }
    }[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with heavy blur */}
            <div
                className={`absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full max-w-md transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10'
                    }`}
            >
                <div className={`relative bg-space-black rounded-2xl border ${config.borderColor} shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden`}>

                    {/* Animated Background Mesh */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${config.bg} opacity-50`} />
                    <div className="absolute inset-0 bg-mesh opacity-20" />

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-repeat-y opacity-10 animate-scanline pointer-events-none" />

                    <div className="relative p-8 flex flex-col items-center text-center">

                        {/* Icon with Ring */}
                        <div className="relative mb-6 group">
                            <div className={`absolute inset-0 rounded-full blur-xl opacity-40 ${config.bg.replace('from-', 'bg-').replace('/40', '')} animate-pulse`} />
                            <div className={`w-20 h-20 rounded-full border-2 ${config.borderColor} bg-black/50 flex items-center justify-center relative z-10 shadow-xl`}>
                                <span className={`material-symbols-outlined text-4xl ${config.color} drop-shadow-[0_0_10px_currentColor] animate-bounce-slight`}>
                                    {config.icon}
                                </span>
                            </div>
                            {/* Rotating Ring */}
                            <div className={`absolute -inset-2 rounded-full border border-dashed ${config.borderColor} opacity-40 animate-spin-slow`} />
                        </div>

                        {/* Text Content */}
                        <h2 className={`font-display text-2xl font-black tracking-wider mb-2 ${config.color} drop-shadow-md uppercase`}>
                            {config.title}
                        </h2>

                        <p className="text-white font-bold text-lg mb-2">
                            {message}
                        </p>

                        {description && (
                            <p className="text-white/60 text-sm font-mono mb-8 leading-relaxed">
                                {description}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3 w-full">
                            {onAction && (
                                <MeridianButton
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={onAction}
                                    className="animate-pulse-slow"
                                >
                                    {actionLabel || 'RESOLVE NOW'}
                                </MeridianButton>
                            )}

                            <MeridianButton
                                variant="ghost"
                                size="md"
                                fullWidth
                                onClick={onAcknowledge}
                                className="opacity-80 hover:opacity-100"
                            >
                                <span className="text-xs tracking-widest uppercase">Acknowledge & Close</span>
                            </MeridianButton>
                        </div>

                        {/* ID Footer */}
                        <div className="mt-6 pt-4 border-t border-white/5 w-full flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest">
                            <span>Sec_Protocol_v2</span>
                            <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
