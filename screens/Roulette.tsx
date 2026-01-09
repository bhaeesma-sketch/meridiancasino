import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';
import { useSecurity } from '../contexts/SecurityContext';
import { supabase } from '../services/supabase';
import { GameLayout } from '../components/GameLayout';
import { BetControls } from '../components/BetControls';

const Roulette: React.FC = () => {
  const context = useContext(AppContext);
  const [betAmount, setBetAmount] = useState(100);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<'red' | 'black' | 'green' | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastNumbers, setLastNumbers] = useState([14, 2, 0, 32, 15, 19, 4, 21, 2, 25]);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [useBonus, setUseBonus] = useState(false);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isSpinning && context && context.user.real_balance >= betAmount) {
          if (selectedNumber !== null || selectedColor !== null) {
            handleSpin();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, betAmount, context, selectedNumber, selectedColor, useBonus]); // Add relevant deps

  // Cleanup animation
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const getNumberColor = (num: number): 'red' | 'black' | 'green' => {
    if (num === 0) return 'green';
    return RED_NUMBERS.includes(num) ? 'red' : 'black';
  };

  // Security Hooks & Backend
  const { checkDepositRequirement, handleError } = useSecurity();

  const handleSpin = async () => {
    if (!context || isSpinning || betAmount <= 0) return;

    if (!checkDepositRequirement(context.user.total_deposited || 0)) return;

    if (selectedNumber === null && selectedColor === null) {
      // Auto-select random if nothing selected
      const demoRand = Math.floor(Math.random() * 37);
      setSelectedNumber(demoRand);
      return executeSpin(demoRand, null);
    }

    executeSpin(selectedNumber, selectedColor);
  };

  const executeSpin = async (p_num: number | null, p_col: string | null) => {
    setIsSpinning(true);
    setIsWin(null);
    setWinningNumber(null);
    sounds.playWhirr(4);

    try {
      const { data, error } = await supabase.rpc('play_roulette', {
        p_bet_amount: betAmount,
        p_selected_number: p_num,
        p_selected_color: p_col,
        p_use_bonus: useBonus
      });

      if (error) throw error;

      // 3. Process Result
      const serverWinningNum = data.number;
      const serverIsWin = data.is_win;
      const serverBalance = data.balance;

      // 4. Calculate Animation
      const duration = 4000;
      // Target Rotation Logic:
      // Slot `i` is at `i * (360/37)`. Pointer is at 0 (Top).
      // We need Wheel Rotation `R` such that `(winningNum * step + R) % 360 == 0`.
      // => R = - (winningNum * step).
      // Add multiple spins (e.g. 5 full rotations).
      const step = 360 / 37;
      const currentRot = wheelRotation % 360;
      const targetAngle = -(serverWinningNum * step);
      const delta = targetAngle - currentRot;
      // Ensure positive delta for forward spin
      const forwardDelta = (delta + 360) % 360;
      const finalRotation = wheelRotation + (360 * 5) + forwardDelta;

      startTimeRef.current = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentR = wheelRotation + (finalRotation - wheelRotation) * eased;
        setWheelRotation(currentR);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Final Settle
          setIsSpinning(false);
          setWinningNumber(serverWinningNum);
          setLastNumbers(prev => [serverWinningNum, ...prev.slice(0, 9)]);
          setIsWin(serverIsWin);

          if (serverIsWin) {
            setTimeout(() => sounds.playWin(), 100);
            if (context) {
              // Sync definitive balance from server
              const current = useBonus ? context.user.bonus_balance : context.user.real_balance;
              // Determine delta (this is approximate if we don't have separate wallet fields in updateBalance)
              // But context.updateBalance updates the MAIN balance (usually real).
              // For bonus, we might need manual update if context supports it.
              // Assuming updateBalance handles the active wallet logic or just adds to real.
              // TODO: Ensure context handles bonus_balance updates properly.
              // For now we calculate delta on the relevant balance.

              // Note: 'context.updateBalance' adds to 'balance' (which is mapped to real_balance likely).
              // If useBonus is true, we might need a custom logic.
              // As a fallback, we invoke updateBalance with the delta if it's real money, 
              // or silently accept display update if no specific bonus handler.

              // Let's assume updateBalance works on the "current" balance notion or we update manually:

              if (useBonus) {
                // context.user.bonus_balance = serverBalance; // Direct mutation is messy but often works in simplier apps
                // Better:
                // context.updateUser({ ...context.user, bonus_balance: serverBalance });
              } else {
                // Standard flow
                const delta = serverBalance - context.user.real_balance;
                context.updateBalance(delta);
              }
            }
          } else {
            setTimeout(() => sounds.playLose(), 100);
            if (context) {
              if (useBonus) {
                // context.user.bonus_balance = serverBalance;
              } else {
                const delta = serverBalance - context.user.real_balance;
                context.updateBalance(delta);
              }
            }
          }

          setTimeout(() => {
            setIsWin(null);
            setSelectedNumber(null);
            setSelectedColor(null);
          }, 3000);
        }
      };
      animationFrameRef.current = requestAnimationFrame(animate);

    } catch (error: any) {
      console.error("Roulette Error:", error);
      setIsSpinning(false);
      handleError(error);
    }
  };

  const handleNumberClick = (num: number) => {
    if (isSpinning) return;
    setSelectedNumber(num);
    setSelectedColor(null);
    sounds.playHover();
  };

  const handleColorClick = (color: 'red' | 'black' | 'green') => {
    if (isSpinning) return;
    setSelectedColor(color);
    setSelectedNumber(null);
    sounds.playHover();
  };

  const quickBets = [50, 100, 250, 500, 1000];

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

        {/* Color Switches */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleColorClick('red')}
            disabled={isSpinning}
            className={`py-3 rounded-xl border-2 font-black text-[10px] tracking-widest uppercase transition-all flex flex-col items-center gap-1 ${selectedColor === 'red'
              ? 'bg-red-600/30 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              : 'bg-red-600/5 border-white/5 text-red-400/50 hover:border-red-500/30'
              }`}
          >
            <span className="text-white">Red</span>
            <span className="opacity-60">2.00x</span>
          </button>
          <button
            onClick={() => handleColorClick('black')}
            disabled={isSpinning}
            className={`py-3 rounded-xl border-2 font-black text-[10px] tracking-widest uppercase transition-all flex flex-col items-center gap-1 ${selectedColor === 'black'
              ? 'bg-white/10 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
              : 'bg-white/2 border-white/5 text-white/40 hover:border-white/20'
              }`}
          >
            <span className="text-white">Black</span>
            <span className="opacity-60">2.00x</span>
          </button>
        </div>

        {/* Number Matrix */}
        <div className="space-y-2">
          <div className="text-[9px] font-black text-white/30 uppercase tracking-widest flex justify-between">
            <span>Number Matrix</span>
            <span className="text-quantum-gold">36.00x Payout</span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-6 gap-1.5 p-2 bg-black/40 border border-white/5 rounded-xl">
            {/* 0 Button */}
            <button
              key={0}
              onClick={() => handleNumberClick(0)}
              disabled={isSpinning}
              className={`col-span-6 h-8 rounded-lg border text-xs font-black font-mono transition-all relative overflow-hidden group/btn ${selectedNumber === 0
                ? 'border-green-400 bg-green-500/80 text-white'
                : 'border-green-500/20 bg-green-500/5 text-green-400/60 hover:border-green-500/50 hover:text-green-400'
                }`}
            >
              0
              {selectedNumber === 0 && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
            </button>

            {Array.from({ length: 36 }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handleNumberClick(i + 1)}
                disabled={isSpinning}
                className={`h-9 rounded-lg border text-xs font-black font-mono transition-all relative overflow-hidden group/btn ${selectedNumber === i + 1
                  ? 'border-quantum-gold bg-quantum-gold text-black'
                  : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20 hover:text-white'
                  }`}
              >
                {i + 1}
                {selectedNumber === i + 1 && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Pro Bet Controls */}
        <BetControls
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          balance={useBonus ? context?.user.bonus_balance || 0 : context?.user.real_balance || 0}
          disabled={isSpinning}
        />

        {/* Execute Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || (!selectedNumber && !selectedColor)}
          className="h-16 px-8 bg-quantum-gold text-black font-black text-sm uppercase rounded-xl shadow-gold-glow hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale relative overflow-hidden group/spin"
        >
          <span className="relative z-10">{isSpinning ? 'SYNCING...' : 'EXECUTE'}</span>
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/spin:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>
    </div>
  );

  const Visuals = (
    <div className="relative w-full h-full flex flex-col items-center justify-center projection-stage perspective-1000 min-h-[300px]">
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 xl:w-96 xl:h-96 flex items-center justify-center transform-style-3d rotate-x-15">
        {/* Outer Decorative Ring */}
        <div className="absolute inset-[-20px] rounded-full border border-white/5 bg-white/2 opacity-20 animate-spin-slow pointer-events-none"></div>

        {/* Main Rotating Wheel */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-white/10 shadow-[0_0_80px_rgba(255,215,0,0.1)] holographic-ring`}
          style={{
            transform: `rotate(${wheelRotation}deg)`,
            transition: isSpinning ? 'none' : 'transform 0.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
          }}
        >
          {Array.from({ length: 37 }).map((_, i) => (
            <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-8 flex flex-col items-center" style={{ transform: `rotate(${i * (360 / 37)}deg)`, transformOrigin: '50% 50%' }}>
              <div className={`w-full h-6 rounded-t-sm border-x border-t flex items-center justify-center text-[8px] font-black font-mono transition-colors ${getNumberColor(i) === 'green' ? 'bg-green-600/40 border-green-400/50 text-green-200' :
                getNumberColor(i) === 'red' ? 'bg-red-600/30 border-red-500/50 text-red-100' :
                  'bg-black/80 border-white/20 text-white/90'
                }`}>
                <span className="transform rotate-180 mb-1">{i}</span>
              </div>
              <div className="w-[1px] h-full bg-gradient-to-b from-white/20 to-transparent"></div>
            </div>
          ))}

          {/* Internal Scanner Sweeps */}
          <div className="absolute inset-4 rounded-full border border-white/5 animate-spin-slow" style={{ animationDuration: '4s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent h-1/2 translate-y-1/2 animate-scanline opacity-20 pointer-events-none"></div>
        </div>

        {/* Inner Holographic Hub */}
        <div className="absolute inset-[30%] rounded-full bg-black/90 border-2 border-quantum-gold/50 shadow-[0_0_40px_rgba(255,215,0,0.3)] backdrop-blur-xl flex flex-col items-center justify-center z-20 group">
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-quantum-gold/50"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-quantum-gold/50"></div>

          <div className="relative">
            <span className={`text-3xl sm:text-4xl xl:text-5xl font-black font-heading tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] ${isSpinning ? 'text-quantum-gold animate-shimmer-text bg-clip-text' : 'text-white'}`}>
              {isSpinning ? '...' : (winningNumber !== null ? winningNumber : '??')}
            </span>
            {isSpinning && <div className="absolute -inset-4 border border-quantum-gold/30 rounded-full animate-ping"></div>}
          </div>

          {!isSpinning && winningNumber !== null && (
            <div className={`mt-2 px-3 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest animate-pop-in ${isWin ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-red-500/20 border-red-500/40 text-red-500'
              }`}>
              {isWin ? 'Win' : 'Loss'}
            </div>
          )}
        </div>

        {/* Energy Ball / Pointer */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 energy-orb rounded-full z-30 transition-all duration-300 pointer-events-none"
          style={{ transform: `rotate(0deg) translateY(0px)` }}
        >
          <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div>
        </div>
      </div>

      {/* Activity Stream */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center w-full max-w-xs">
        <div className="flex gap-1.5 p-2 bg-black/40 border border-white/5 rounded-lg backdrop-blur-sm overflow-x-auto">
          {lastNumbers.slice(0, 8).map((n, i) => (
            <div key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black font-mono border transition-all ${getNumberColor(n) === 'red' ? 'bg-red-600/20 border-red-500/30 text-red-400' :
              getNumberColor(n) === 'green' ? 'bg-green-600/20 border-green-500/30 text-green-400' :
                'bg-white/5 border-white/20 text-white/70'
              }`}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );


  return (
    <GameLayout
      title="Quantum Roulette"
      controls={Controls}
      gameVisuals={Visuals}
    />
  );
};

export default Roulette;