import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';

const Limbo: React.FC = () => {
  const context = useContext(AppContext);
  const [bet, setBet] = useState(50);
  const [targetMultiplier, setTargetMultiplier] = useState(2.0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [crashedAt, setCrashedAt] = useState<number | null>(null);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [hasBet, setHasBet] = useState(false);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);

  // Quick multiplier options
  const quickMultipliers = [1.5, 2.0, 3.0, 5.0, 10.0, 25.0, 50.0, 100.0];
  const quickBets = [10, 50, 100, 500, 1000];

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Generate crash point using exponential distribution (similar to Stake)
  const generateCrashPoint = (): number => {
    // House edge ensures crashes happen frequently
    // Using exponential distribution with mean that favors house
    const r = Math.random();
    // Formula: -ln(r) / lambda, where lambda controls house edge
    // Lower lambda = higher multipliers on average, but we want low RTP
    const lambda = 0.15; // Adjust this to control average crash point
    let crashPoint = -Math.log(r) / lambda;

    // Cap at reasonable maximum
    if (crashPoint > 1000) crashPoint = 1000;

    // Minimum crash point (can't crash before 1.01x)
    if (crashPoint < 1.01) crashPoint = 1.01;

    return crashPoint;
  };

  const startGame = () => {
    if (!context || context.user.balance < bet || isRunning || bet <= 0) {
      sounds.playLose();
      return;
    }

    setIsRunning(true);
    setHasBet(true);
    setIsWin(null);
    setCrashedAt(null);
    setCurrentMultiplier(1.0);
    sounds.playRoll();

    // Deduct bet immediately
    context.updateBalance(-bet);

    // Generate crash point
    const crashPoint = generateCrashPoint();
    crashPointRef.current = crashPoint;
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      // Multiplier increases exponentially (similar to Stake)
      const multiplier = 1.0 + (Math.pow(elapsed / 1000, 1.5) * 0.1);
      setCurrentMultiplier(multiplier);

      if (multiplier >= crashPointRef.current) {
        // Crashed!
        setCrashedAt(crashPointRef.current);
        setIsRunning(false);
        setCurrentMultiplier(crashPointRef.current);

        // Check if player won (0.01% RTP)
        const won = crashPointRef.current >= targetMultiplier;
        setIsWin(won);

        setTimeout(() => {
          if (won) {
            sounds.playWin();
            const payout = bet * targetMultiplier;
            context.updateBalance(payout);
            context.addHistory({
              id: Date.now().toString() + Math.random().toString(),
              game: 'Limbo',
              multiplier: targetMultiplier,
              payout: payout / 45000,
              timestamp: Date.now(),
              username: context.user.username
            });
          } else {
            sounds.playLose();
          }
        }, 300);

        setTimeout(() => {
          setIsWin(null);
          setHasBet(false);
        }, 3000);
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleQuickBet = (amount: number) => {
    if (!context || isRunning) return;
    const maxBet = Math.min(amount, context.user.balance);
    setBet(maxBet);
    sounds.playHover();
  };

  const handleQuickMultiplier = (mult: number) => {
    if (isRunning) return;
    setTargetMultiplier(mult);
    sounds.playHover();
  };

  const maxPayout = bet * targetMultiplier;
  const winChance = targetMultiplier > 0 ? (1 / targetMultiplier) * 100 : 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-between p-4 md:p-6 w-full overflow-hidden relative">
      <div className="scanline-overlay"></div>

      {/* Header & Inputs Area */}
      <div className="w-full flex flex-col gap-2 z-20">
        <div className="flex items-center justify-between">
          <h3 className="text-cyan-400 font-heading font-black text-sm uppercase tracking-widest italic">Quantum Limbo</h3>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Active Core</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Bet Input */}
          <div className="bg-black/60 border border-white/10 rounded-xl p-3">
            <label className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Wager ($)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={bet}
                onChange={e => setBet(Number(e.target.value))}
                disabled={isRunning}
                className="bg-transparent border-none p-0 text-white font-mono text-2xl font-bold focus:ring-0 w-24"
              />
              <div className="flex gap-1 flex-wrap">
                {quickBets.slice(0, 3).map(amount => (
                  <button key={amount} onClick={() => handleQuickBet(amount)} className="px-1.5 py-0.5 text-[8px] font-mono font-bold rounded bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all">${amount}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Multiplier */}
          <div className="bg-black/60 border border-white/10 rounded-xl p-3">
            <label className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Target (x)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={targetMultiplier}
                onChange={e => setTargetMultiplier(Number(e.target.value))}
                disabled={isRunning}
                className="bg-transparent border-none p-0 text-white font-mono text-2xl font-bold focus:ring-0 w-24"
              />
              <div className="flex gap-1 flex-wrap">
                {[2, 10, 100].map(mult => (
                  <button key={mult} onClick={() => handleQuickMultiplier(mult)} className="px-1.5 py-0.5 text-[8px] font-mono font-bold rounded bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all">{mult}x</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={startGame}
          disabled={isRunning || !context || context.user.balance < bet}
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-400 text-black font-black text-sm uppercase rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all"
        >
          {isRunning ? 'FAST CRASHING...' : 'LOCK IN & START'}
        </button>
      </div>

      {/* Main Multiplier Stage */}
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center relative py-4">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-[250px] h-[250px] bg-gradient-radial rounded-full blur-3xl transition-all duration-700 ${isRunning ? 'from-cyan-500/10' : 'from-white/5'} to-transparent`}></div>
        </div>

        <div className="relative z-10 text-center">
          <div className={`text-7xl md:text-9xl lg:text-[140px] font-mono font-black leading-none transition-all duration-100 ${isWin === true ? 'text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.6)]' :
            isWin === false ? 'text-red-400 drop-shadow-[0_0_30px_rgba(248,113,113,0.6)]' :
              isRunning ? 'text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]' : 'text-white/80'
            }`}>
            {crashedAt !== null ? crashedAt.toFixed(2) : currentMultiplier.toFixed(2)}x
          </div>

          <div className="mt-4 flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-cyan-400/60 font-heading">
              {isRunning ? 'QUANTUM ASCENT' : isWin === true ? 'VICTORY SECURED' : isWin === false ? 'CORE CRASHED' : 'READY TO LAUNCH'}
            </span>
            {crashedAt !== null && (
              <div className={`text-lg font-bold font-mono ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                {isWin ? `+$${maxPayout.toFixed(2)}` : `-$${bet.toFixed(2)}`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Probability HUD */}
      <div className="w-full grid grid-cols-2 gap-4 pb-2">
        <div className="bg-black/40 border border-white/5 rounded-lg p-2 text-center">
          <div className="text-[8px] text-white/30 uppercase font-black tracking-widest mb-0.5">EST. WIN CHANCE</div>
          <div className="text-xs font-mono font-bold text-white/80">{winChance.toFixed(2)}%</div>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-lg p-2 text-center">
          <div className="text-[8px] text-white/30 uppercase font-black tracking-widest mb-0.5">EST. PAYOUT</div>
          <div className="text-xs font-mono font-bold text-quantum-gold">$ {maxPayout.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default Limbo;
