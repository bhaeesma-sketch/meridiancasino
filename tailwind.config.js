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
                // Core Palette
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
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Orbitron', 'sans-serif'], // Need to import this
                mono: ['Rajdhani', 'monospace'],     // Need to import this
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'holo-gradient': 'linear-gradient(125deg, transparent 0%, rgba(255, 215, 0, 0.03) 30%, rgba(147, 51, 234, 0.05) 50%, rgba(255, 215, 0, 0.03) 70%, transparent 100%)',
            },
            boxShadow: {
                'gold-glow': '0 0 20px rgba(255, 215, 0, 0.4)',
                'purple-glow': '0 0 20px rgba(147, 51, 234, 0.4)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
                'holo-pulse': 'holoPulse 2s ease-in-out infinite',
                'tilt': 'tilt 10s infinite linear',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                holoPulse: {
                    '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' },
                    '50%': { opacity: 0.8, boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)' },
                },
                tilt: {
                    '0%, 50%, 100%': { transform: 'rotate(0deg)' },
                    '25%': { transform: 'rotate(1deg)' },
                    '75%': { transform: 'rotate(-1deg)' },
                }
            }
        },
    },
    plugins: [],
}
