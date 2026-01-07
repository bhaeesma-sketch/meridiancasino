import * as React from 'react';

export interface MeridianButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: React.ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

export const MeridianButton: React.FC<MeridianButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseClass = 'meridian-button';

    const variantClasses = {
        primary: '',
        secondary: 'meridian-button-secondary',
        danger: 'meridian-button-danger',
        success: 'meridian-button-success',
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
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="inline-block mr-2 animate-spin">⚙</span>
            )}
            {icon && !loading && (
                <span className="inline-block mr-2">{icon}</span>
            )}
            {children}
        </button>
    );
};

export default MeridianButton;
