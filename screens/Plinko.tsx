import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';
import { useSecurity } from '../contexts/SecurityContext';
import { supabase } from '../services/supabase';
import { GameLayout } from '../components/GameLayout';
import { BetControls } from '../components/BetControls';

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
  const [useBonus, setUseBonus] = useState(false);
  const ballCounter = useRef(0);
  const animationFrameRef = useRef<number>(0);
  const multipliers = getMultipliers(rows);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        // Plinko allows multiple balls, so isRunning check is different (balls.length < max)
        if (balls.length < 5 && context && context.user.real_balance >= bet) {
          dropBall();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [balls.length, bet, context, useBonus, rows]); // Add relevant deps

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

  // Security Hooks
  const { checkDepositRequirement, handleError } = useSecurity();

  const dropBall = async () => {
    if (!context || balls.length > 4) return;
    if (!checkDepositRequirement(context.user.total_deposited || 0)) return;

    sounds.playClick();

    try {
      const { data, error } = await supabase.rpc('play_plinko', {
        p_bet_amount: bet,
        p_rows: rows,
        p_risk: 'high',
        p_use_bonus: useBonus
      });

      if (error) throw error;

      const serverPath: number[] = data.path;
      const serverMult = data.multiplier;

      const visualPath = [0];
      let currentPos = 0;
      serverPath.forEach(dir => {
        const move = dir === 1 ? 1 : -1;
        currentPos += move;
        visualPath.push(currentPos);
      });

      const newId = ballCounter.current++;

      setBalls(prev => [...prev, {
        id: newId,
        x: 0,
        y: 0,
        path: visualPath,
        step: 0,
        finalIndex: data.slot,
        multiplier: serverMult
      }]);

    } catch (err) {
      handleError(err);
    }
  };

  const quickBets = [50, 100, 250, 500, 1000];
  const handleQuickBet = (amount: number) => {
    if (!context || balls.length > 0) return;
    const balance = useBonus ? context.user.bonus_balance : context.user.real_balance;
    const maxBet = Math.min(amount, balance);
    setBet(maxBet);
    sounds.playHover();
  };

  // --- Render Props ---

  const Controls = (
    <div className="flex flex-col gap-4 w-full">
      <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
        {/* Wallet Toggle */}
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 w-full mb-1">
          <button
            onClick={() => setUseBonus(false)}
            className={`flex-1 py-1.5 text-xs font-black uppercase rounded transition-all ${!useBonus ? 'bg-quantum-gold text-black shadow-glow' : 'text-gray-500 hover:text-white'}`}
          >
            Real
          </button>
          <button
            onClick={() => setUseBonus(true)}
            className={`flex-1 py-1.5 text-xs font-black uppercase rounded transition-all ${useBonus ? 'bg-plasma-purple text-white shadow-plasma-glow' : 'text-gray-500 hover:text-white'}`}
          >
            Bonus
          </button>
        </div>

        <BetControls
          betAmount={bet}
          setBetAmount={setBet}
          balance={useBonus ? context?.user.bonus_balance || 0 : context?.user.real_balance || 0}
          disabled={balls.length > 0}
        />
      </div>

      {/* Rows Slider */}
      <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <span>Rows: <span className="text-white">{rows}</span></span>
        </div>
        <input
          type="range" min="8" max="16" step="1"
          value={rows}
          onChange={e => setRows(parseInt(e.target.value))}
          disabled={balls.length > 0}
          className="w-full h-1 accent-plasma-purple bg-white/10 rounded-full appearance-none cursor-pointer"
        />
      </div>

      {/* Play Button */}
      <button
        onClick={dropBall}
        disabled={balls.length > 2 || !context || context.user.balance < bet}
        className="w-full py-4 bg-plasma-purple text-white font-black text-xs md:text-sm uppercase rounded-xl shadow-plasma-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
      >
        PROJECT BALL
      </button>

      {/* Last Result */}
      {lastResult && (
        <div className={`px-4 py-3 rounded-lg border flex flex-col items-center transition-all animate-bounce ${lastResult.isWin ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="text-[10px] font-black uppercase text-white/50">{lastResult.isWin ? 'Win' : 'Loss'}</div>
          <div className={`text-xl font-mono font-bold ${lastResult.isWin ? 'text-green-400' : 'text-red-400'}`}>{lastResult.multiplier.toFixed(2)}x</div>
        </div>
      )}
    </div>
  );

  const Visuals = (
    <div className="w-full h-full relative flex flex-col items-center justify-start min-h-0 overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-5 pointer-events-none"></div>

      {/* Scaled Container to fit 16 rows */}
      <div className="relative w-full h-full flex items-start justify-center overflow-y-auto lg:overflow-hidden p-4">
        <div className="relative transform scale-50 md:scale-75 lg:scale-90 origin-top flex flex-col items-center mt-4">
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
                        className="plinko-peg absolute transition-all duration-300"
                        style={{
                          left: `50%`,
                          transform: `translateX(calc(-50% + ${xPos}px))`,
                          top: `${rIndex * 28}px`,
                          boxShadow: `0 0 ${Math.random() > 0.9 ? '15px' : '5px'} rgba(255, 215, 0, 0.4)`
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}

            {/* Balls with Trails */}
            {balls.map(ball => {
              const centerX = 50;
              const xOffset = (ball.x / rows) * 32; // Tweak this constant if scaling is off
              const actualX = centerX + xOffset;
              const yPos = ball.y * 0.9;

              return (
                <React.Fragment key={ball.id}>
                  <div
                    className="plinko-ball z-20"
                    style={{
                      left: `${actualX}%`,
                      top: `${yPos}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  <div
                    className="plinko-ball z-10 opacity-60 scale-90 blur-[1px]"
                    style={{
                      left: `${actualX}%`,
                      top: `${yPos - 8}px`,
                      transform: 'translate(-50%, -50%)',
                      background: 'radial-gradient(circle at 30% 30%, #9333EA, transparent)'
                    }}
                  />
                </React.Fragment>
              );
            })}
          </div>

          {/* Multipliers */}
          <div className="flex gap-1 w-full justify-center mt-32 px-4 relative z-10">
            {multipliers.map((m, i) => (
              <div
                key={i}
                className={`plinko-slot h-8 w-8 md:h-10 md:w-10 rounded-lg flex items-center justify-center text-[8px] md:text-[9px] font-black text-white transition-all hover:scale-105 ${m > 10 ? 'bg-gradient-to-b from-red-600/40 to-red-900/60 border-red-500/40' :
                  m > 2 ? 'bg-gradient-to-b from-orange-500/40 to-orange-800/60 border-orange-500/40' :
                    'bg-gradient-to-b from-green-500/40 to-green-800/60 border-green-500/40'
                  }`}
              >
                {m.toFixed(1)}x
              </div>
            ))}
          </div>
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
    </div>
  );

  return (
    <GameLayout
      title="Plinko Master"
      controls={Controls}
      gameVisuals={Visuals}
    />
  );
};

export default Plinko;