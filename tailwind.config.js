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
                "cyber-black": "#030208",
                "cyber-dark": "#0a0a12",
                // Datastream Neon Palette (User Provided)
                "neon-pink": "#00BCD4",
                "neon-blue": "#00E5FF",
                "neon-green": "#00FFC0",
                "neon-purple": "#4FD1C5",
                "neon-yellow": "#A7ECEE",
                "neon-orange": "#6B8E92",
                "cyber-grid": "rgba(0, 229, 255, 0.05)",
                "glass-cyber": "rgba(10, 10, 18, 0.7)",

                // Neo specific vars
                "neo-bg": "rgba(10, 10, 20, 0.2)",
                "neo-border": "rgba(0, 229, 255, 0.3)",
                "neo-text-light": "#FFFFFF",
                "neo-text-muted": "#B0D0D4",

                // Legacy luxury mappings (for backward compat if needed)
                luxury: {
                    midnight: '#1A0F2E',
                    velvet: '#2D1B3D',
                    silk: '#3D2A4A',
                    obsidian: '#0A0612',
                    plum: '#4A2C5A',
                },
                metal: {
                    rose: '#E8B298',
                    roseDark: '#D4A184',
                    platinum: '#E5E4E2',
                    platinumDark: '#C9C8C6',
                    champagne: '#F7E7CE',
                    bronze: '#CD7F32',
                },
                jewel: {
                    emerald: '#00FFC0', // Mapped to neon-green
                    ruby: '#00BCD4', // Mapped to neon-pink for cyan look
                    sapphire: '#00E5FF', // Mapped to neon-blue
                    amethyst: '#4FD1C5', // Mapped to neon-purple
                },
                meridian: {
                    navy: '#0A0E27',
                    midnight: '#1A1F3A',
                    charcoal: '#2C2C3E',
                    stone: '#4A4A5A',
                },
                gold: {
                    primary: '#FFD700',
                    bright: '#FFA500',
                    bronze: '#CD7F32',
                    antique: '#B8860B',
                    dark: '#8B6914',
                },
                ice: {
                    electric: '#00FFFF',
                    bright: '#00CED1',
                    deep: '#008B8B',
                    light: '#87CEEB',
                },
                mystical: {
                    magenta: '#FF00FF',
                    purple: '#9333EA',
                    royal: '#6B46C1',
                    violet: '#8B00FF',
                },
                fire: {
                    bright: '#FF6B35',
                    deep: '#FF4500',
                    burnt: '#CC5500',
                    amber: '#FFBF00',
                },
                space: {
                    black: "#050505",
                    dark: "#0a0a15",
                    card: "#1a1a2e",
                },
                quantum: {
                    gold: "#FFD700",
                    accent: "#FFA500",
                },
                plasma: {
                    purple: "#4FD1C5", // Mapped to new neon-purple
                    blue: "#00E5FF", // Mapped to new neon-blue
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Rajdhani', 'sans-serif'],
                heading: ['Orbitron', 'sans-serif'],
                mono: ['Share Tech Mono', 'monospace'],
                refined: ['Rajdhani', 'sans-serif'],
                montserrat: ['Montserrat', 'sans-serif'],
                title: ['Bebas Neue', 'Oswald', 'Impact', 'sans-serif'],
            },
            backgroundImage: {
                'cyber-gradient': 'linear-gradient(180deg, rgba(3,2,8,0) 0%, rgba(3,2,8,0.8) 100%)',
                'grid-pattern': 'linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px)',
                'digital-rain': 'linear-gradient(180deg, rgba(0, 229, 255, 0) 0%, rgba(0, 229, 255, 0.1) 50%, rgba(0, 229, 255, 0) 100%)',
                // Keep existing gradients...
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'luxury-rose-gold': 'linear-gradient(135deg, #E8B298 0%, #D4A184 50%, #CD7F32 100%)',
                'gold-metallic': 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #CD7F32 100%)',
                'velvet-texture': 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
            },
            boxShadow: {
                "neon-blue": "0 0 10px rgba(0, 229, 255, 0.5), 0 0 20px rgba(0, 229, 255, 0.3)",
                "neon-pink": "0 0 10px rgba(0, 188, 212, 0.5), 0 0 20px rgba(0, 188, 212, 0.3)",
                "neon-green": "0 0 10px rgba(0, 255, 192, 0.5), 0 0 20px rgba(0, 255, 192, 0.3)",
                "neon-yellow": "0 0 10px rgba(167, 236, 238, 0.5), 0 0 20px rgba(167, 236, 238, 0.3)",
                "cyber-card": "0 10px 30px -10px rgba(0,0,0,0.8), 0 0 20px rgba(79, 209, 197, 0.2) inset",
                "glassmorphism": "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 20px rgba(0, 229, 255, 0.1) inset",
                // Existing shadows
                'gold-glow': '0 0 20px rgba(255, 215, 0, 0.4)',
                'luxury-glow': '0 0 30px rgba(0, 229, 255, 0.4), 0 0 60px rgba(79, 209, 197, 0.2)',
            },
            boxShadow: {
                // Premium Luxury Shadows
                'luxury-glow': '0 0 30px rgba(232, 178, 152, 0.4), 0 0 60px rgba(229, 228, 226, 0.2)',
                'luxury-glow-lg': '0 0 50px rgba(232, 178, 152, 0.6), 0 0 100px rgba(229, 228, 226, 0.3)',
                'crystal-reflect': '0 8px 32px rgba(232, 228, 248, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                'velvet-depth': '0 20px 60px rgba(26, 15, 46, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                'metal-shine': '0 4px 20px rgba(232, 178, 152, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.2)',
                'jewel-glow-emerald': '0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.2)',
                'jewel-glow-ruby': '0 0 30px rgba(220, 20, 60, 0.5), 0 0 60px rgba(220, 20, 60, 0.2)',
                'jewel-glow-sapphire': '0 0 30px rgba(15, 82, 186, 0.5), 0 0 60px rgba(15, 82, 186, 0.2)',
                'jewel-glow-amethyst': '0 0 30px rgba(153, 102, 204, 0.5), 0 0 60px rgba(153, 102, 204, 0.2)',
                'liquid-shimmer': '0 4px 20px rgba(229, 228, 226, 0.3), 0 0 40px rgba(232, 178, 152, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                // Legacy Shadows
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
                'pulse-neon': 'pulseNeon 2s infinite',
                'glitch': 'glitch 1s linear infinite',
                'scanline': 'scanline 8s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'ticker': 'ticker 20s linear infinite',
                'fade-in': 'fadeIn 0.8s ease-out forwards',
                'slide-up': 'slideUp 0.6s ease-out forwards',
                // Existing animations...
                'particle-burst': 'particleBurst 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                'liquid-shimmer': 'liquidShimmer 3s linear infinite',
                'crystal-rotate': 'crystalRotate 20s linear infinite',
                'velvet-wave': 'velvetWave 8s ease-in-out infinite',
                'sparkle-twinkle': 'sparkleTwinkle 2s ease-in-out infinite',
                'metal-shine': 'metalShine 3s linear infinite',
                'jewel-pulse': 'jewelPulse 2s ease-in-out infinite',
                'luxury-float': 'luxuryFloat 4s ease-in-out infinite',
                'smooth-glow': 'smoothGlow 3s ease-in-out infinite',
                'spin-slow': 'spin 8s linear infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
                pulseNeon: {
                    '0%, 100%': { opacity: '1', textShadow: '0 0 10px currentColor' },
                    '50%': { opacity: '0.8', textShadow: '0 0 20px currentColor' },
                },
                glitch: {
                    '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
                    '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
                    '62%': { transform: 'translate(0,0) skew(5deg)' },
                },
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                ticker: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                // Existing keyframes...
                particleBurst: {
                    '0%': { transform: 'scale(0) translateY(0)', opacity: '1' },
                    '50%': { transform: 'scale(1.5) translateY(-20px)', opacity: '0.8' },
                    '100%': { transform: 'scale(2) translateY(-40px)', opacity: '0' },
                },
                liquidShimmer: {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
                crystalRotate: {
                    '0%': { transform: 'rotateY(0deg) rotateX(0deg)' },
                    '100%': { transform: 'rotateY(360deg) rotateX(360deg)' },
                },
                velvetWave: {
                    '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.3' },
                    '50%': { transform: 'translateY(-20px) scale(1.05)', opacity: '0.5' },
                },
                sparkleTwinkle: {
                    '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.2)' },
                },
                metalShine: {
                    '0%': { backgroundPosition: '-200% center', opacity: '0.5' },
                    '50%': { opacity: '1' },
                    '100%': { backgroundPosition: '200% center', opacity: '0.5' },
                },
                jewelPulse: {
                    '0%, 100%': {
                        boxShadow: '0 0 20px currentColor, 0 0 40px currentColor',
                        transform: 'scale(1)'
                    },
                    '50%': {
                        boxShadow: '0 0 40px currentColor, 0 0 80px currentColor',
                        transform: 'scale(1.05)'
                    },
                },
                luxuryFloat: {
                    '0%, 100%': { transform: 'translateY(0) translateX(0)' },
                    '25%': { transform: 'translateY(-15px) translateX(5px)' },
                    '50%': { transform: 'translateY(-20px) translateX(-5px)' },
                    '75%': { transform: 'translateY(-15px) translateX(5px)' },
                },
                smoothGlow: {
                    '0%, 100%': {
                        filter: 'brightness(1) saturate(1)',
                        boxShadow: '0 0 20px rgba(232, 178, 152, 0.3)'
                    },
                    '50%': {
                        filter: 'brightness(1.2) saturate(1.3)',
                        boxShadow: '0 0 40px rgba(232, 178, 152, 0.6)'
                    },
                },
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
