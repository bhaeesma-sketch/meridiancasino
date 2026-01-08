import * as React from 'react';
import { useEffect, useState } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
}

interface ParticleSystemProps {
    active: boolean;
    x?: number;
    y?: number;
    count?: number;
    type?: 'celebration' | 'sparkle' | 'jewel' | 'metal';
    duration?: number;
    onComplete?: () => void;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
    active,
    x = 50,
    y = 50,
    count = 30,
    type = 'celebration',
    duration = 2000,
    onComplete
}) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    const getParticleConfig = (type: string) => {
        switch (type) {
            case 'celebration':
                return {
                    colors: ['#E8B298', '#E5E4E2', '#10B981', '#DC143C', '#9966CC', '#FFC87C'],
                    speed: 8,
                    spread: 360,
                    gravity: 0.3
                };
            case 'sparkle':
                return {
                    colors: ['#E8F4F8', '#E5E4E2', '#F7E7CE'],
                    speed: 3,
                    spread: 180,
                    gravity: 0.1
                };
            case 'jewel':
                return {
                    colors: ['#10B981', '#DC143C', '#0F52BA', '#9966CC'],
                    speed: 5,
                    spread: 270,
                    gravity: 0.2
                };
            case 'metal':
                return {
                    colors: ['#E8B298', '#E5E4E2', '#D4A184', '#F7E7CE'],
                    speed: 4,
                    spread: 180,
                    gravity: 0.15
                };
            default:
                return {
                    colors: ['#E8B298'],
                    speed: 5,
                    spread: 360,
                    gravity: 0.2
                };
        }
    };

    useEffect(() => {
        if (!active) {
            setParticles([]);
            return;
        }

        const config = getParticleConfig(type);
        const newParticles: Particle[] = [];

        for (let i = 0; i < count; i++) {
            const angle = (Math.random() * config.spread - config.spread / 2) * (Math.PI / 180);
            const speed = config.speed * (0.5 + Math.random() * 0.5);

            newParticles.push({
                id: i,
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (Math.random() * 2),
                life: duration,
                maxLife: duration,
                size: 4 + Math.random() * 8,
                color: config.colors[Math.floor(Math.random() * config.colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }

        setParticles(newParticles);

        const animationInterval = setInterval(() => {
            setParticles(prev => {
                const updated = prev.map(p => ({
                    ...p,
                    x: p.x + p.vx,
                    y: p.y + p.vy,
                    vy: p.vy + config.gravity,
                    life: p.life - 16,
                    rotation: p.rotation + p.rotationSpeed
                })).filter(p => p.life > 0);

                if (updated.length === 0) {
                    clearInterval(animationInterval);
                    if (onComplete) onComplete();
                }

                return updated;
            });
        }, 16);

        return () => clearInterval(animationInterval);
    }, [active, x, y, count, type, duration, onComplete]);

    if (!active || particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {particles.map(particle => {
                const opacity = particle.life / particle.maxLife;
                const scale = 0.5 + (particle.life / particle.maxLife) * 0.5;

                return (
                    <div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            backgroundColor: particle.color,
                            opacity,
                            transform: `translate(-50%, -50%) scale(${scale}) rotate(${particle.rotation}deg)`,
                            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                            transition: 'all 0.016s linear'
                        }}
                    />
                );
            })}
        </div>
    );
};

// Hook for easy particle triggering
export const useParticles = () => {
    const [particleState, setParticleState] = useState({
        active: false,
        x: 50,
        y: 50,
        type: 'celebration' as 'celebration' | 'sparkle' | 'jewel' | 'metal',
        count: 30
    });

    const trigger = (
        x: number,
        y: number,
        type: 'celebration' | 'sparkle' | 'jewel' | 'metal' = 'celebration',
        count: number = 30
    ) => {
        setParticleState({ active: true, x, y, type, count });
    };

    const reset = () => {
        setParticleState(prev => ({ ...prev, active: false }));
    };

    return {
        particleState,
        trigger,
        reset,
        ParticleComponent: () => (
            <ParticleSystem
                active={particleState.active}
                x={particleState.x}
                y={particleState.y}
                type={particleState.type}
                count={particleState.count}
                onComplete={reset}
            />
        )
    };
};
