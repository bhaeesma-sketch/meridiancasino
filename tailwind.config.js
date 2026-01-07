/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./screens/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Meridian Core Backgrounds
                meridian: {
                    navy: '#0A0E27',
                    midnight: '#1A1F3A',
                    charcoal: '#2C2C3E',
                    stone: '#4A4A5A',
                },
                // Gold/Bronze Metallics
                gold: {
                    primary: '#FFD700',
                    bright: '#FFA500',
                    bronze: '#CD7F32',
                    antique: '#B8860B',
                    dark: '#8B6914',
                },
                // Ice/Cyan Blues
                ice: {
                    electric: '#00FFFF',
                    bright: '#00CED1',
                    deep: '#008B8B',
                    light: '#87CEEB',
                },
                // Mystical Purple/Magenta
                mystical: {
                    magenta: '#FF00FF',
                    purple: '#9333EA',
                    royal: '#6B46C1',
                    violet: '#8B00FF',
                },
                // Fire/Orange
                fire: {
                    bright: '#FF6B35',
                    deep: '#FF4500',
                    burnt: '#CC5500',
                    amber: '#FFBF00',
                },
                // Legacy colors (keeping for compatibility)
                space: {
                    black: '#050505',
                    dark: '#0a0a15',
                    card: '#1a1a2e',
                },
                quantum: {
                    gold: '#FFD700',
                    accent: '#FFA500',
                },
                plasma: {
                    purple: '#9333EA',
                    blue: '#4F46E5',
                },
                neon: {
                    green: '#10B981',
                    red: '#EF4444',
                    emerald: '#10B981',
                    ruby: '#DC2626',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Cinzel Decorative', 'Georgia', 'serif'],
                title: ['Bebas Neue', 'Oswald', 'Impact', 'sans-serif'],
                heading: ['Orbitron', 'sans-serif'],
                mono: ['Rajdhani', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'holo-gradient': 'linear-gradient(125deg, transparent 0%, rgba(255, 215, 0, 0.03) 30%, rgba(147, 51, 234, 0.05) 50%, rgba(255, 215, 0, 0.03) 70%, transparent 100%)',
                'gold-metallic': 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #CD7F32 100%)',
                'gold-shine': 'linear-gradient(135deg, #FFA500 0%, #FFD700 50%, #FFBF00 100%)',
                'gold-pressed': 'linear-gradient(135deg, #CD7F32 0%, #B8860B 50%, #8B6914 100%)',
                'fire-ice': 'linear-gradient(90deg, #FF6B35 0%, #FFD700 50%, #00FFFF 100%)',
                'mystical-aura': 'linear-gradient(135deg, #9333EA 0%, #FF00FF 50%, #8B00FF 100%)',
                'dragon-fire': 'linear-gradient(135deg, #FF4500 0%, #FF6B35 50%, #FFBF00 100%)',
                'dragon-ice': 'linear-gradient(135deg, #00FFFF 0%, #00CED1 50%, #87CEEB 100%)',
            },
            boxShadow: {
                'gold-glow': '0 0 20px rgba(255, 215, 0, 0.4)',
                'gold-glow-lg': '0 0 40px rgba(255, 215, 0, 0.6)',
                'purple-glow': '0 0 20px rgba(147, 51, 234, 0.4)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'button-idle': '0 4px 15px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                'button-hover': '0 6px 25px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 165, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                'button-active': '0 2px 8px rgba(255, 215, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                'fire-glow': '0 0 30px rgba(255, 107, 53, 0.5)',
                'ice-glow': '0 0 30px rgba(0, 255, 255, 0.5)',
                'mystical-glow': '0 0 30px rgba(255, 0, 255, 0.5)',
                'epic-card': '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.2) inset, 0 0 60px rgba(147, 51, 234, 0.1)',
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
                'holo-pulse': 'holoPulse 2s ease-in-out infinite',
                'tilt': 'tilt 10s infinite linear',
                'dragon-breath': 'dragonBreath 3s ease-in-out infinite',
                'mystical-pulse': 'mysticalPulse 2s ease-in-out infinite',
                'gear-rotate': 'gearRotate 20s linear infinite',
                'compass-spin': 'compassSpin 10s linear infinite',
                'crystal-shimmer': 'crystalShimmer 3s linear infinite',
                'particle-float': 'particleFloat 4s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                holoPulse: {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)' },
                },
                tilt: {
                    '0%, 50%, 100%': { transform: 'rotate(0deg)' },
                    '25%': { transform: 'rotate(1deg)' },
                    '75%': { transform: 'rotate(-1deg)' },
                },
                dragonBreath: {
                    '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.1)' },
                },
                mysticalPulse: {
                    '0%, 100%': {
                        boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
                        filter: 'brightness(1)'
                    },
                    '50%': {
                        boxShadow: '0 0 40px rgba(255, 0, 255, 0.6)',
                        filter: 'brightness(1.2)'
                    },
                },
                gearRotate: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                compassSpin: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                crystalShimmer: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
                particleFloat: {
                    '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0.3' },
                    '25%': { transform: 'translateY(-20px) translateX(10px)', opacity: '0.6' },
                    '50%': { transform: 'translateY(-30px) translateX(-5px)', opacity: '1' },
                    '75%': { transform: 'translateY(-20px) translateX(-10px)', opacity: '0.6' },
                },
            }
        },
    },
    plugins: [],
}
