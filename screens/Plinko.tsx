import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';

// Calculate multipliers based on row count
const getMultipliers = (rows: number): number[] => {
  const slotCount = rows + 1;
  const multipliers: number[] = [];
  const center = Math.floor(slotCount / 2);

  for (let i = 0; i < slotCount; i++) {
    const distanceFromCenter = Math.abs(i - center);
    const maxMult = rows > 12 ? 110 : rows > 10 ? 50 : 20;

    if (distanceFromCenter === 0) {
      multipliers.push(maxMult);
    } else if (distanceFromCenter === 1) {
      multipliers.push(maxMult * 0.35);
    } else if (distanceFromCenter === 2) {
      multipliers.push(maxMult * 0.1);
    } else if (distanceFromCenter === 3) {
      multipliers.push(5);
    } else if (distanceFromCenter === 4) {
      multipliers.push(3);
    } else if (distanceFromCenter === 5) {
      multipliers.push(1.5);
    } else if (distanceFromCenter === 6) {
      multipliers.push(1);
    } else {
      multipliers.push(0.5);
    }
  }

  return multipliers;
};

interface Ball {
  id: number;
  x: number;
  y: number;
  path: number[];
  step: number;
  finalIndex: number;
  multiplier: number;
}

const Plinko: React.FC = () => {
  const context = useContext(AppContext);
  const [bet, setBet] = useState(100);
  const [rows, setRows] = useState(16);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [lastResult, setLastResult] = useState<{ multiplier: number; isWin: boolean } | null>(null);
  const ballCounter = useRef(0);
  const animationFrameRef = useRef<number>();
  const multipliers = getMultipliers(rows);

  // Animation loop
  useEffect(() => {
    if (balls.length === 0) return;

    const animate = () => {
      setBalls(prevBalls => {
        const updatedBalls = prevBalls.map(ball => {
          if (ball.step >= rows) return ball;

          const newStep = ball.step + 0.08; // Smoother animation
          const currentRow = Math.floor(newStep);
          const progress = newStep % 1;

          if (currentRow < rows && currentRow !== ball.step) {
            // Play collision sound when hitting a new row
            if (Math.random() > 0.7) sounds.playCollision();
          }

          // Calculate position based on path
          const currentPathPos = ball.path[currentRow] || 0;
          const nextPathPos = ball.path[Math.min(currentRow + 1, rows - 1)] || 0;
          const x = currentPathPos + (nextPathPos - currentPathPos) * progress;
          const y = newStep * 30; // Adjusted for smoother descent

          return { ...ball, x, y: y * 2, step: newStep };
        });

        // Check if balls have finished
        updatedBalls.forEach(ball => {
          if (ball.step >= rows && !lastResult) {
            const finalIndex = Math.max(0, Math.min(ball.finalIndex, multipliers.length - 1));
            const mult = multipliers[finalIndex] || 1;
            const isWin = mult >= 1;
            // If player should have won, give payout
            const actualMult = mult;
            const payout = bet * actualMult;

            setLastResult({ multiplier: mult, isWin });

            setTimeout(() => {
              if (isWin) sounds.playWin();
              else sounds.playLose();

              if (context) {
                context.updateBalance(payout);
                context.addHistory({
                  id: Date.now().toString() + Math.random().toString(),
                  game: 'Plinko',
                  multiplier: mult,
                  payout: payout / 45000,
                  timestamp: Date.now(),
                  username: context.user.username
                });
              }

              setTimeout(() => setLastResult(null), 3000);
            }, 300);
          }
        });

        // Remove finished balls after animation
        const stillAnimating = updatedBalls.filter(b => b.step < rows + 1);
        if (stillAnimating.length < updatedBalls.length) {
          setTimeout(() => {
            setBalls(prev => prev.filter(b => updatedBalls.some(ub => ub.id === b.id && ub.step < rows + 2)));
          }, 1000);
        }

        return stillAnimating;
      });

      if (balls.some(b => b.step < rows + 1)) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [balls, rows, bet, context, lastResult, multipliers]);

  const dropBall = () => {
    if (!context || context.user.balance < bet || bet <= 0) {
      sounds.playLose();
      return;
    }

    if (balls.length > 2) return; // Limit concurrent balls

    sounds.playClick();
    context.updateBalance(-bet);

    const newId = ballCounter.current++;
    const path: number[] = [0]; // Start at center
    let currentPos = 0;

    // Generate random path
    for (let i = 0; i < rows; i++) {
      const move = Math.random() > 0.5 ? 1 : -1;
      currentPos += move;
      path.push(currentPos);
    }

    const finalIndex = Math.floor((currentPos + rows) / 2);
    const clampedIndex = Math.max(0, Math.min(finalIndex, multipliers.length - 1));
    const mult = multipliers[clampedIndex] || 1;

    setBalls(prev => [...prev, {
      id: newId,
      x: 0,
      y: 0,
      path,
      step: 0,
      finalIndex: clampedIndex,
      multiplier: mult
    }]);
  };

  // Quick bet buttons
  const quickBets = [50, 100, 250, 500, 1000];
  const handleQuickBet = (amount: number) => {
    if (!context || balls.length > 0) return;
    const maxBet = Math.min(amount, context.user.balance);
    setBet(maxBet);
    sounds.playHover();
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row h-full overflow-hidden p-4 md:p-6 gap-4 relative">
      <div className="scanline-overlay"></div>

      {/* Sidebar Terminal - Compact */}
      <aside className="w-full lg:w-72 flex flex-col gap-3 z-20">
        <div className="glass-panel p-4 rounded-xl border-quantum-gold/20 flex flex-col gap-4">
          <h3 className="text-quantum-gold font-heading font-black text-sm uppercase italic">Plinko Terminal</h3>

          <div className="space-y-4">
            <div className="bg-black/60 border border-white/10 rounded-xl p-3">
              <label className="text-[8px] text-gray-400 uppercase font-bold tracking-widest mb-1 block">Bet ($)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={bet}
                  onChange={e => setBet(Number(e.target.value))}
                  disabled={balls.length > 0}
                  className="bg-transparent border-none p-0 text-white font-mono text-xl font-bold focus:ring-0 w-20"
                />
                <div className="flex gap-1 flex-wrap">
                  {quickBets.slice(0, 3).map(amount => (
                    <button key={amount} onClick={() => handleQuickBet(amount)} className="px-1.5 py-0.5 text-[8px] font-mono font-bold rounded bg-white/5 border border-white/10 hover:border-plasma-purple/50 transition-all">${amount}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-gray-500">
                <span>Depth: {rows} Rows</span>
              </div>
              <input
                type="range" min="8" max="16" step="1"
                value={rows}
                onChange={e => setRows(parseInt(e.target.value))}
                disabled={balls.length > 0}
                className="w-full h-1 accent-plasma-purple bg-white/10 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <button
              onClick={dropBall}
              disabled={balls.length > 2 || !context || context.user.balance < bet}
              className="w-full py-3 bg-plasma-purple text-white font-black text-xs uppercase rounded-xl shadow-plasma-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              PROJECT BALL
            </button>
          </div>

          {lastResult && (
            <div className={`px-3 py-2 rounded-lg border flex flex-col items-center transition-all ${lastResult.isWin ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="text-[8px] font-black uppercase text-white/50">{lastResult.isWin ? 'Win' : 'Loss'}</div>
              <div className={`text-lg font-mono font-bold ${lastResult.isWin ? 'text-green-400' : 'text-red-400'}`}>{lastResult.multiplier.toFixed(2)}x</div>
            </div>
          )}
        </div>
      </aside>

      {/* 3D Projection Area - Scaled for Viewport */}
      <section className="flex-1 relative flex flex-col items-center justify-center min-h-0 overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-5 pointer-events-none"></div>

        <div className="relative w-full max-w-xl aspect-[1/1] flex flex-col items-center justify-center transform scale-75 md:scale-90 lg:scale-[1.1] origin-center -translate-y-8">
          {/* Peg Board */}
          <div className="relative flex flex-col gap-2 items-center" style={{ width: '100%', height: `${rows * 25}px` }}>
            {Array.from({ length: rows }).map((_, rIndex) => {
              const pinCount = rIndex + 2;
              const totalWidth = pinCount * 24;
              return (
                <div key={rIndex} className="flex gap-4 items-center justify-center relative" style={{ width: `${totalWidth}px` }}>
                  {Array.from({ length: pinCount }).map((_, pIndex) => {
                    const xPos = (pIndex - (pinCount - 1) / 2) * 24;
                    return (
                      <div
                        key={pIndex}
                        className="absolute size-2 bg-plasma-purple/30 rounded-full border border-plasma-purple/50"
                        style={{
                          left: `50%`,
                          transform: `translateX(calc(-50% + ${xPos}px))`,
                          top: `${rIndex * 28}px`
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}

            {/* Balls */}
            {balls.map(ball => {
              const centerX = 50;
              const xOffset = (ball.x / rows) * 32;
              const actualX = centerX + xOffset;
              return (
                <div
                  key={ball.id}
                  className="absolute size-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] z-30 transition-all duration-75"
                  style={{
                    left: `${actualX}%`,
                    top: `${ball.y * 0.9}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-plasma-purple to-quantum-gold rounded-full opacity-80"></div>
                </div>
              );
            })}
          </div>

          {/* Multipliers - Compressed */}
          <div className="flex gap-1 w-full justify-center mt-32 px-4">
            {multipliers.map((m, i) => (
              <div
                key={i}
                className={`h-8 w-8 rounded flex items-center justify-center text-[8px] font-black text-white border transition-all ${m > 10 ? 'bg-red-900/40 border-red-500/30' : m > 2 ? 'bg-orange-600/40 border-orange-500/30' : 'bg-green-600/40 border-green-500/30'
                  }`}
              >
                {m.toFixed(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Status HUD - Ultra Compact */}
        <div className="absolute bottom-4 right-4 flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-plasma-purple animate-pulse"></span>
            <span className="text-[8px] font-black uppercase text-plasma-purple/80">Quantum Sync</span>
          </div>
          {balls.length > 0 && (
            <div className="text-[10px] font-mono text-quantum-gold font-bold">{balls.length} Active</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Plinko;