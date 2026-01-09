import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';
import { useSecurity } from '../contexts/SecurityContext';
import { supabase } from '../services/supabase';
import { GameLayout } from '../components/GameLayout';
import { BetControls } from '../components/BetControls';

const Dice: React.FC = () => {
  const context = useContext(AppContext);
  const [bet, setBet] = useState(50);
  const [target, setTarget] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [useBonus, setUseBonus] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [cubeRotation, setCubeRotation] = useState({ x: -30, y: -45, z: 0 });
  const [displayRoll, setDisplayRoll] = useState<number | null>(null);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);

  // Calculate proper multiplier based on win chance
  const winChance = 100 - target;
  const multiplier = winChance > 0 ? (100 / winChance).toFixed(2) : '2.00';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRolling && context && context.user.real_balance >= bet) {
          rollDice();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRolling, bet, context, target, useBonus]); // Add relevant deps

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const { handleError, checkDepositRequirement } = useSecurity();

  const updateLocalBalance = (newRefBalance: number) => {
    if (context) {
      const current = context.user.real_balance;
      const delta = newRefBalance - current;
      if (delta !== 0) context.updateBalance(delta);
    }
  };

  const rollDice = async () => {
    if (!context || isRolling || bet <= 0) return;

    if (!checkDepositRequirement(context.user.total_deposited || 0)) {
      return;
    }

    setIsRolling(true);
    setIsWin(null);
    setLastRoll(null);
    setDisplayRoll(null);
    sounds.playRoll();

    try {
      const { data, error } = await supabase.rpc('play_dice', {
        p_bet_amount: bet,
        p_target_number: target,
        p_client_seed: context.user.username,
        p_use_bonus: useBonus
      });

      if (error) throw error;

      const finalRoll = data.roll;
      const isWinResult = data.is_win;
      const finalBalance = data.balance;

      const duration = 3000;
      startTimeRef.current = Date.now();

      const totalRotations = {
        x: Math.random() * 10 + 5,
        y: Math.random() * 10 + 5,
        z: Math.random() * 8 + 3
      };

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1) {
          const easedProgress = 1 - Math.pow(1 - progress, 4);
          const remainingProgress = 1 - easedProgress;
          const time = elapsed * 0.01;

          setCubeRotation({
            x: -30 + (totalRotations.x * 360 * (1 - easedProgress)) +
              Math.sin(time * 8) * 180 * remainingProgress,
            y: -45 + (totalRotations.y * 360 * (1 - easedProgress)) +
              Math.cos(time * 7) * 180 * remainingProgress,
            z: (totalRotations.z * 360 * (1 - easedProgress)) +
              Math.sin(time * 9) * 120 * remainingProgress
          });

          const displayValue = finalRoll + (Math.random() - 0.5) * 20 * remainingProgress;
          setDisplayRoll(Math.max(0, Math.min(100, displayValue)));

          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setLastRoll(finalRoll);
          setDisplayRoll(finalRoll);
          updateLocalBalance(finalBalance);
          setIsWin(isWinResult);

          if (isWinResult) {
            setTimeout(() => sounds.playWin(), 100);
          } else {
            setTimeout(() => sounds.playLose(), 100);
          }

          setIsRolling(false);
          setTimeout(() => setIsWin(null), 3000);
          setCubeRotation({ x: -30, y: -45, z: 0 });
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

    } catch (error: any) {
      console.error("Dice Game Error:", error);
      setIsRolling(false);
      handleError(error);
    }
  };

  const quickBets = [10, 50, 100, 500, 1000];
  const handleQuickBet = (amount: number) => {
    if (!context || isRolling) return;
    const maxBet = Math.min(amount, context.user.balance);
    setBet(maxBet);
    sounds.playHover();
  };

  // --- Render Props for GameLayout ---

  const Controls = (
    <div className="flex flex-col gap-4 w-full">
      {/* Wallet Toggle & Amount */}
      <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
        {/* Wallet Support is simpler here, let's keep the wallet toggle but use BetControls for amount */}
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 w-full">
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
          disabled={isRolling}
        />
      </div>

      {/* Target Slider */}
      <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
          <span>Win Chance</span>
          <span className="text-green-400">{(100 - target).toFixed(0)}%</span>
        </div>
        <div className="relative h-6 w-full cursor-pointer group">
          <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-2 bg-black/60 rounded-full border border-white/10 overflow-hidden">
            <div className="absolute h-full left-0 bg-red-500/30 border-r border-red-500/50" style={{ width: `${target}%` }} />
            <div className="absolute h-full right-0 bg-green-500/30 border-l border-green-500/50" style={{ width: `${100 - target}%` }} />
          </div>
          <input
            type="range" min="2" max="98" step="1"
            value={target} onChange={e => { setTarget(Number(e.target.value)); sounds.playHover(); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-quantum-gold pointer-events-none transition-all shadow-gold-glow-sm group-hover:scale-125"
            style={{ left: `calc(${target}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between items-center bg-white/5 rounded-lg p-2">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-gray-500">Multiplier</span>
            <span className="text-sm font-black text-quantum-gold">{multiplier}x</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase font-bold text-gray-500">Payout</span>
            <span className="text-sm font-black text-quantum-gold">${(bet * parseFloat(multiplier)).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Play Button */}
      <button
        onClick={rollDice}
        disabled={isRolling || !context || context.user.balance < bet || bet <= 0}
        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-quantum-gold text-black font-black text-lg uppercase rounded-xl shadow-gold-glow hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isRolling ? (
            <>
              <span className="material-symbols-outlined animate-spin">cyclone</span>
              Rolling...
            </>
          ) : (
            <>
              Play Dice
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
            </>
          )}
        </span>
      </button>
    </div>
  );

  const Visuals = (
    <div className={`w-full h-full flex items-center justify-center relative perspective-1000 ${context?.is3DMode ? 'is-3d' : ''}`}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[300px] bg-gradient-radial from-quantum-gold/10 to-transparent rounded-full blur-3xl animate-holo-pulse"></div>
        {context?.is3DMode && <div className="absolute bottom-[-100px] w-[600px] h-[600px] bg-mesh opacity-20 transform rotateX(60deg)"></div>}
      </div>

      {context?.is3DMode ? (
        <div className="scene transform-gpu relative z-10 scale-[0.8] md:scale-[1] lg:scale-125">
          <div
            className="cube"
            style={{
              transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg) rotateZ(${cubeRotation.z}deg)`,
              willChange: isRolling ? 'transform' : 'auto'
            }}
          >
            {[1, 6, 3, 4, 5, 2].map((num, i) => (
              <div
                key={i}
                className={`cube__face cube__face--${['front', 'back', 'right', 'left', 'top', 'bottom'][i]} rounded-xl overflow-hidden bg-black/80 border border-quantum-gold/30`}
              >
                <div className="absolute inset-0 bg-mesh opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                <span className="relative text-7xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-br from-white via-quantum-gold to-white drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                  {num}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center">
          <div className={`size-48 rounded-3xl bg-black/60 backdrop-blur-3xl border-2 border-quantum-gold/40 flex items-center justify-center relative overflow-hidden shadow-gold-glow-sm ${isRolling ? 'animate-bounce' : 'animate-float'}`}>
            <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-quantum-gold to-white drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
              {displayRoll !== null ? Math.round(displayRoll % 6) + 1 : lastRoll ? Math.round(lastRoll % 6) + 1 : '?'}
            </span>
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-quantum-gold/60 font-mono">2D Mode Active</p>
        </div>
      )}

      {/* Floating Result */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        {!isRolling && lastRoll !== null && (
          <div className={`text-6xl md:text-9xl font-mono font-black animate-pop-in flex flex-col items-center p-8 rounded-3xl backdrop-blur-xl border border-white/10 ${isWin ? 'text-green-400 drop-shadow-[0_0_50px_rgba(74,222,128,0.8)]' : 'text-red-400 drop-shadow-[0_0_50px_rgba(248,113,113,0.8)]'}`}>
            <div className="flex items-baseline gap-4">
              <span className="animate-pulse">{(lastRoll).toFixed(2)}</span>
              <span className="text-2xl md:text-3xl opacity-60 uppercase tracking-[0.3em] font-heading italic">{isWin ? 'WIN' : 'LOSS'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <GameLayout
      title="3D Cubix Pro"
      controls={Controls}
      gameVisuals={Visuals}
    />
  );
};

export default Dice;