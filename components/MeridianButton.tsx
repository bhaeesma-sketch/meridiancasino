import * as React from 'react';
import { useState, useRef } from 'react';

export interface MeridianButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'platinum' | 'emerald' | 'ruby' | 'sapphire' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: React.ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
    withParticles?: boolean;
    children: React.ReactNode;
}

export const MeridianButton: React.FC<MeridianButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    fullWidth = false,
    withParticles = false,
    children,
    className = '',
    disabled,
    onClick,
    ...props
}) => {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (withParticles && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const newParticles = Array.from({ length: 8 }, (_, i) => ({
                id: Date.now() + i,
                x,
                y
            }));

            setParticles(newParticles);
            setTimeout(() => setParticles([]), 1000);
        }

        if (onClick) onClick(e);
    };

    const baseClass = 'meridian-button relative';

    const variantClasses = {
        primary: '',
        secondary: 'meridian-button-secondary',
        danger: 'meridian-button-danger',
        success: 'meridian-button-success',
        platinum: 'bg-luxury-platinum border-metal-platinumDark text-luxury-midnight hover:shadow-liquid-shimmer',
        emerald: 'bg-jewel-emerald border-jewel-emeraldDark text-white hover:shadow-jewel-glow-emerald',
        ruby: 'bg-jewel-ruby border-jewel-rubyDark text-white hover:shadow-jewel-glow-ruby',
        sapphire: 'bg-jewel-sapphire border-jewel-sapphireDark text-white hover:shadow-jewel-glow-sapphire',
        ghost: 'bg-transparent border-metal-rose text-metal-rose hover:bg-metal-rose/10'
    };

    const sizeClasses = {
        sm: 'text-sm py-2 px-4',
        md: 'text-base py-3 px-6',
        lg: 'text-lg py-4 px-8',
        xl: 'text-xl py-5 px-10',
    };

    const classes = [
        baseClass,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full flex items-center justify-center' : '',
        'transition-all duration-300 ease-out',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            ref={buttonRef}
            className={classes}
            disabled={disabled || loading}
            onClick={handleClick}
            {...props}
        >
            {loading && (
                <span className="inline-block mr-2 animate-spin">⚙</span>
            )}
            {icon && !loading && (
                <span className="inline-block mr-2">{icon}</span>
            )}
            {children}

            {/* Particle effects */}
            {particles.map(particle => (
                <span
                    key={particle.id}
                    className="absolute w-2 h-2 rounded-full bg-current animate-particle-burst pointer-events-none"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        animationDelay: `${Math.random() * 0.2}s`
                    }}
                />
            ))}
        </button>
    );
};

export default MeridianButton;
