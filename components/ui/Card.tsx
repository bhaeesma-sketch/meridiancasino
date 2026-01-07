import * as React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'solid' | 'glass' | 'neo';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    variant = 'glass',
    padding = 'md',
    hoverEffect = false,
}) => {

    const baseStyles = "relative rounded-2xl overflow-hidden transition-all duration-300 border";

    const variants = {
        solid: "bg-space-card border-white/10",
        glass: "bg-space-black/60 backdrop-blur-xl border-white/10 shadow-glass",
        neo: "bg-gradient-to-br from-space-card to-space-dark border-quantum-gold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
    };

    const paddings = {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
    };

    const hoverStyles = hoverEffect
        ? "hover:-translate-y-1 hover:border-quantum-gold/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] group"
        : "";

    return (
        <div className={`
      ${baseStyles}
      ${variants[variant]}
      ${paddings[padding]}
      ${hoverStyles}
      ${className}
    `}>
            {/* Optional Gradient Glow for Neo cards */}
            {variant === 'neo' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-quantum-gold/5 rounded-full blur-[50px] pointer-events-none" />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
