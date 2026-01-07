import * as React from 'react';

// Define variant types
export type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'neon' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = "",
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    fullWidth = false,
    disabled,
    ...props
}) => {

    // Base styles
    const baseStyles = "relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 rounded-xl overflow-hidden active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    // Size styles
    const sizeStyles = {
        sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
        md: "text-sm px-5 py-2.5 h-11 gap-2",
        lg: "text-base px-8 py-3.5 h-14 gap-2.5",
    };

    // Variant styles
    const variantStyles = {
        primary: "bg-gradient-to-r from-quantum-gold via-yellow-400 to-quantum-accent text-space-black shadow-gold-glow hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] border border-yellow-300/50",
        secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-quantum-gold/50 hover:text-quantum-gold",
        glass: "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-white/30 shadow-glass",
        neon: "bg-transparent border border-neon-green text-neon-green shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-neon-green/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]",
        ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
    };

    return (
        <button
            className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            disabled={disabled || isLoading}
            {...props}
        >
            {/* Loading Spinner */}
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}

            {/* Optional Icon */}
            {!isLoading && icon && <span className="flex-shrink-0">{icon}</span>}

            {/* Button Text */}
            <span className="relative z-10">{children}</span>

            {/* Shine Effect for Primary Buttons */}
            {variant === 'primary' && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            )}
        </button>
    );
};
