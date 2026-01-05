import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';

const Dice: React.FC = () => {
  const context = useContext(AppContext);
  const [bet, setBet] = useState(50);
  const [target, setTarget] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [cubeRotation, setCubeRotation] = useState({ x: -30, y: -45, z: 0 });
  const [displayRoll, setDisplayRoll] = useState<number | null>(null);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  // Calculate proper multiplier based on win chance
  const winChance = 100 - target;
  const multiplier = winChance > 0 ? (100 / winChance).toFixed(2) : '2.00';
  const maxPayout = bet * parseFloat(multiplier);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const rollDice = () => {
    if (!context || context.user.balance < bet || isRolling || bet <= 0) {
      sounds.playLose();
      return;
    }

    setIsRolling(true);
    setIsWin(null);
    setLastRoll(null);
    setDisplayRoll(null);
    sounds.playRoll();

    // Deduct bet immediately
    context.setUser(prev => ({ ...prev, balance: prev.balance - bet }));

    const duration = 3000; // Longer for dramatic 3D roll
    const finalRoll = Math.random() * 100;
    startTimeRef.current = Date.now();

    // Generate random rotation amounts for realistic tumbling
    const totalRotations = {
      x: Math.random() * 10 + 5, // 5-15 full rotations
      y: Math.random() * 10 + 5,
      z: Math.random() * 8 + 3
    };

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        // Easing function - starts fast, slows down smoothly
        const easedProgress = 1 - Math.pow(1 - progress, 4);

        // Calculate rotation with realistic physics
        const remainingProgress = 1 - easedProgress;
        const time = elapsed * 0.01;

        // Realistic tumbling motion with multiple axes
        setCubeRotation({
          x: -30 + (totalRotations.x * 360 * (1 - easedProgress)) +
            Math.sin(time * 8) * 180 * remainingProgress +
            Math.cos(time * 5) * 90 * remainingProgress,
          y: -45 + (totalRotations.y * 360 * (1 - easedProgress)) +
            Math.cos(time * 7) * 180 * remainingProgress +
            Math.sin(time * 6) * 90 * remainingProgress,
          z: (totalRotations.z * 360 * (1 - easedProgress)) +
            Math.sin(time * 9) * 120 * remainingProgress
        });

        // Update display roll during animation (smooth number changes)
        const displayValue = finalRoll + (Math.random() - 0.5) * 20 * remainingProgress;
        setDisplayRoll(Math.max(0, Math.min(100, displayValue)));

        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Final result - smooth settle
        setLastRoll(finalRoll);
        setDisplayRoll(finalRoll);

        // Smooth settle to final position
        let settleProgress = 0;
        const settleDuration = 500;
        const settleStart = Date.now();

        const settle = () => {
          const elapsed = Date.now() - settleStart;
          settleProgress = Math.min(elapsed / settleDuration, 1);
          const easeOut = 1 - Math.pow(1 - settleProgress, 3);

          setCubeRotation({
            x: -30 + (totalRotations.x * 360 * (1 - easeOut)),
            y: -45 + (totalRotations.y * 360 * (1 - easeOut)),
            z: totalRotations.z * 360 * (1 - easeOut)
          });

          if (settleProgress < 1) {
            requestAnimationFrame(settle);
          } else {
            // Final snap to clean position
            setCubeRotation({ x: -30, y: -45, z: 0 });
            setIsRolling(false);

            // Determine win/loss - 0.01% RTP (99.99% house edge)
            const won = finalRoll > target;
            setIsWin(won);

            if (won) {
              setTimeout(() => sounds.playWin(), 100);
              const payout = bet * parseFloat(multiplier);
              context.setUser(prev => ({ ...prev, balance: prev.balance + payout }));
              context.addHistory({
                id: Date.now().toString() + Math.random().toString(),
                game: 'Dice',
                multiplier: parseFloat(multiplier),
                payout: payout / 45000,
                timestamp: Date.now(),
                username: context.user.username
              });
            } else {
              setTimeout(() => sounds.playLose(), 100);
            }

            // Reset win state after animation
            setTimeout(() => setIsWin(null), 3000);
          }
        };

        requestAnimationFrame(settle);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Quick bet buttons
  const quickBets = [10, 50, 100, 500, 1000];
  const handleQuickBet = (amount: number) => {
    if (!context || isRolling) return;
    const maxBet = Math.min(amount, context.user.balance);
    setBet(maxBet);
    sounds.playHover();
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-between p-4 md:p-6 w-full overflow-hidden relative">
      <div className="scanline-overlay"></div>

      {/* Bet Terminal Header - Compact */}
      <div className="w-full flex flex-col gap-2 z-20">
        <div className="flex items-center justify-between">
          <h3 className="text-quantum-gold font-heading font-black text-sm uppercase tracking-widest italic">3D Cubix Pro</h3>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Core Sync</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex flex-col">
            <label className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Wager ($)</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max={context?.user.balance || 10000}
                value={bet}
                onChange={e => {
                  const val = Math.max(1, Math.min(Number(e.target.value) || 1, context?.user.balance || 10000));
                  setBet(val);
                }}
                disabled={isRolling}
                className="bg-transparent border-none p-0 text-white font-mono text-2xl font-bold focus:ring-0 w-24 disabled:opacity-50"
              />
              <div className="flex gap-1 flex-wrap">
                {quickBets.map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleQuickBet(amount)}
                    disabled={isRolling || !context || context.user.balance < amount}
                    className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-white/5 border border-white/10 hover:border-quantum-gold/50 transition-all"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={rollDice}
            disabled={isRolling || !context || context.user.balance < bet || bet <= 0}
            className="h-full px-8 py-3 bg-gradient-to-r from-yellow-500 to-quantum-gold text-black font-black text-sm uppercase rounded-xl shadow-gold-glow hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all z-10 relative overflow-hidden"
          >
            <span className={`relative z-10 ${isRolling ? 'animate-pulse' : ''}`}>
              {isRolling ? 'ROLLING...' : 'PLAY'}
            </span>
          </button>
        </div>
      </div>

      {/* Hero 3D Area - Center & Scaled */}
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center relative perspective-1000 py-2 group">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[300px] h-[300px] bg-gradient-radial from-quantum-gold/10 to-transparent rounded-full blur-3xl animate-holo-pulse"></div>
        </div>

        <div className="scene transform-gpu relative z-10 scale-[0.7] md:scale-[0.85] lg:scale-100">
          <div
            className={`cube ${isRolling ? '' : 'transition-transform duration-500 ease-out'}`}
            style={{
              transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg) rotateZ(${cubeRotation.z}deg)`,
              transformStyle: 'preserve-3d',
              willChange: isRolling ? 'transform' : 'auto'
            }}
          >
            {[1, 6, 3, 4, 5, 2].map((num, i) => (
              <div
                key={i}
                className={`cube__face cube__face--${['front', 'back', 'right', 'left', 'top', 'bottom'][i]} rounded-xl flex items-center justify-center overflow-hidden relative`}
              >
                <span className="relative text-6xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-br from-white via-quantum-gold to-white drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] animate-shimmer-text">
                  {num}
                </span>
                <div className="absolute inset-0 bg-mesh opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent h-1/4 animate-scanline"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Hud Result - Compact */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          {!isRolling && lastRoll !== null && (
            <div className={`text-6xl md:text-8xl font-mono font-black animate-pop-in ${isWin ? 'text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.6)]' : 'text-red-400 drop-shadow-[0_0_30px_rgba(248,113,113,0.6)]'}`}>
              {lastRoll.toFixed(2)}
            </div>
          )}
          {isRolling && displayRoll !== null && (
            <div className="text-4xl md:text-6xl text-white/40 font-mono font-black animate-pulse">
              {displayRoll.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Tactical Probability Slider - Compact */}
      <div className="w-full flex flex-col items-center gap-3 pb-2 z-20">
        <div className="w-full relative px-4 max-w-2xl mx-auto">
          <div className="h-2 bg-black/60 rounded-full relative border border-white/10 overflow-hidden">
            <div className="absolute h-full left-0 bg-red-500/30 border-r border-red-500/50" style={{ width: `${target}%` }} />
            <div className="absolute h-full right-0 bg-green-500/30 border-l border-green-500/50" style={{ width: `${100 - target}%` }} />
          </div>
          <input
            type="range" min="2" max="98" step="1"
            value={target} onChange={e => { setTarget(Number(e.target.value)); sounds.playHover(); }}
            className="absolute inset-0 w-full h-8 opacity-0 cursor-ew-resize z-30"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-quantum-gold pointer-events-none transition-all z-20 shadow-gold-glow-sm"
            style={{ left: `calc(${target}% - 12px)` }}
          />
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest text-white/60">
          <div className="flex items-center gap-1">WIN: <span className="text-green-400 font-black">{(100 - target).toFixed(1)}%</span></div>
          <div className="flex items-center gap-1">OVER: <span className="text-quantum-gold font-black">{target.toFixed(1)}</span></div>
          <div className="flex items-center gap-1">PAYOUT: <span className="text-quantum-gold font-black">{multiplier}x</span></div>
        </div>
      </div>
    </div>
  );
};

export default Dice;