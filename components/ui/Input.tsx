import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    className = "",
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
                    {label}
                </label>
            )}

            <div className="relative group">
                {/* Glow Effect on Focus */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-quantum-gold/50 to-plasma-purple/50 rounded-xl opacity-0 transition duration-300 group-focus-within:opacity-100 blur"></div>

                <div className="relative flex items-center bg-space-card/80 border border-white/10 rounded-xl overflow-hidden transition-colors focus-within:border-quantum-gold/50 focus-within:bg-space-black">

                    {leftIcon && (
                        <div className="pl-4 text-gray-400 group-focus-within:text-quantum-gold transition-colors">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        className={`
              w-full bg-transparent border-none outline-none text-white placeholder-gray-500
              ${leftIcon ? 'pl-3' : 'pl-4'}
              ${rightIcon ? 'pr-3' : 'pr-4'}
              py-3 text-sm font-medium
              ${className}
            `}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="pr-4 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <p className="mt-1 text-xs text-neon-red font-medium ml-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {error}
                </p>
            )}
        </div>
    );
};
