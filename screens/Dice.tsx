import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';
import { useSecurity } from '../contexts/SecurityContext'; // New
import { supabase } from '../services/supabase'; // New

const Dice: React.FC = () => {
  const context = useContext(AppContext);
  const [bet, setBet] = useState(50);
  const [target, setTarget] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [useBonus, setUseBonus] = useState(false); // New
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

  // Security & Backend Integration
  const { handleError, checkDepositRequirement } = useSecurity();

  // Helper to sync balance
  const updateLocalBalance = (newRefBalance: number) => {
    // We assume the RPC returns the definitive 'real_balance'.
    // We need to update the context user object manually or fetch profile.
    // For smoothness, we update context directly if 'updateUser' exists, else using 'updateBalance' is tricky 
    // because it takes a delta.
    // We will calculate delta.
    if (context) {
      const current = context.user.real_balance;
      const delta = newRefBalance - current;
      if (delta !== 0) context.updateBalance(delta);
    }
  };

  const rollDice = async () => {
    if (!context || isRolling || bet <= 0) return;

    // 1. Client-Side Pre-Checks
    if (!checkDepositRequirement(context.user.total_deposited || 0)) {  // Assuming total_deposited exists or 0
      return;
      // Note: If total_deposited is missing from User type, we might need to cast or fetch it.
      // For now, we'll let the backend catch it if client check passes (e.g. if field is missing).
    }

    setIsRolling(true);
    setIsWin(null);
    setLastRoll(null);
    setDisplayRoll(null);

    // Play Click Sound
    sounds.playRoll();

    try {
      // 2. Server-Side Execution
      // We delay animation start slightly until we have the result or parallelize it?
      // Parallel: Start animation (indefinite state), then when result comes, trigger settle.
      // For simple Dice, fetching is fast (<200ms). We can fetch first.

      const { data, error } = await supabase.rpc('play_dice', {
        p_bet_amount: bet,
        p_target_number: target,
        p_client_seed: context.user.username,
        p_use_bonus: useBonus
      });

      if (error) throw error;

      // 3. Process Result
      const finalRoll = data.roll;
      const payout = data.payout;
      const isWinResult = data.is_win;
      const finalBalance = data.balance;

      // Start Animation with DETERMINED result
      const duration = 3000;
      startTimeRef.current = Date.now();

      // Immediately show bet deduction visually (optional, or wait for end)
      // context.updateBalance(-bet); // Don't do this double, wait for final sync or do delta

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

          // Display Roll Preview
          const displayValue = finalRoll + (Math.random() - 0.5) * 20 * remainingProgress;
          setDisplayRoll(Math.max(0, Math.min(100, displayValue)));

          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Settle
          setLastRoll(finalRoll);
          setDisplayRoll(finalRoll);

          // Final Balance Sync (Authoritative)
          updateLocalBalance(finalBalance);

          setIsWin(isWinResult); // State update triggers visual win/loss style

          if (isWinResult) {
            setTimeout(() => sounds.playWin(), 100);
            // History update handled by server, but we can push local history if needed
          } else {
            setTimeout(() => sounds.playLose(), 100);
          }

          setIsRolling(false);
          setTimeout(() => setIsWin(null), 3000);

          // Reset rotation
          setCubeRotation({ x: -30, y: -45, z: 0 });
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

    } catch (error: any) {
      console.error("Dice Game Error:", error);
      setIsRolling(false);
      handleError(error); // Trigger Security Modal
    }
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
    <div className={`flex-1 min-h-0 flex flex-col items-center justify-between p-4 md:p-6 w-full overflow-hidden relative transition-all duration-700 ${context.is3DMode ? 'is-3d' : ''}`}>
      <div className="scanline-overlay"></div>
      <div className="photon-field"></div>

      {/* Bet Terminal Header - Compact */}
      <div className={`w-full flex flex-col gap-2 z-20 transition-transform duration-700 ${context.is3DMode ? 'translate-y-[-10px] scale-[0.98]' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-quantum-gold font-heading font-black text-sm uppercase tracking-widest italic">3D Cubix Pro</h3>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Core Sync</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex flex-col gap-2">
            {/* Wallet Toggle */}
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 w-full mb-1">
              <button
                onClick={() => setUseBonus(false)}
                className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${!useBonus ? 'bg-quantum-gold text-black shadow-glow' : 'text-gray-500 hover:text-white'}`}
              >
                Real
              </button>
              <button
                onClick={() => setUseBonus(true)}
                className={`flex-1 py-1 text-[9px] font-black uppercase rounded transition-all ${useBonus ? 'bg-plasma-purple text-white shadow-plasma-glow' : 'text-gray-500 hover:text-white'}`}
              >
                Bonus
              </button>
            </div>

            <label className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Wager ($)</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0.1"
                max={useBonus ? context?.user.bonus_balance : context?.user.real_balance}
                value={bet}
                onChange={e => {
                  const bal = useBonus ? context?.user.bonus_balance : context?.user.real_balance;
                  const val = Math.max(0.1, Math.min(Number(e.target.value) || 0.1, bal || 10000));
                  setBet(val);
                }}
                disabled={isRolling}
                className="bg-transparent border-none p-0 text-white font-mono text-xl font-bold focus:ring-0 w-24 disabled:opacity-50"
              />
              <div className="flex gap-1 flex-wrap">
                {quickBets.map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleQuickBet(amount)}
                    disabled={isRolling || !context}
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
          {/* Holographic Grid Floor */}
          <div className="absolute bottom-0 w-[600px] h-[600px] bg-mesh opacity-20 transform rotateX(60deg) translateY(300px)"></div>
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
                  className={`cube__face cube__face--${['front', 'back', 'right', 'left', 'top', 'bottom'][i]} rounded-xl overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-mesh opacity-30"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

                  <span className="relative text-7xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-br from-white via-quantum-gold to-white drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] animate-shimmer-text">
                    {num}
                  </span>

                  {/* Corner Accents */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-quantum-gold/40"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-quantum-gold/40"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 2D Mode Visual */
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-black/60 backdrop-blur-3xl border-2 border-quantum-gold/40 flex items-center justify-center relative overflow-hidden shadow-gold-glow-sm ${isRolling ? 'animate-bounce' : 'animate-float'}`}>
              <div className="data-stream opacity-10"></div>
              <span className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-quantum-gold to-white drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                {displayRoll !== null ? Math.round(displayRoll % 6) + 1 : lastRoll ? Math.round(lastRoll % 6) + 1 : '?'}
              </span>
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-quantum-gold/40"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-quantum-gold/40"></div>
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-quantum-gold/60 font-mono">2D HUD Mode Active</p>
          </div>
        )}

        {/* Floating Hud Result - Digital Glitch Style */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          {!isRolling && lastRoll !== null && (
            <div className={`text-6xl md:text-9xl font-mono font-black animate-pop-in flex flex-col items-center p-8 rounded-3xl backdrop-blur-xl border border-white/10 ${isWin ? 'text-green-400 drop-shadow-[0_0_50px_rgba(74,222,128,0.8)]' : 'text-red-400 drop-shadow-[0_0_50px_rgba(248,113,113,0.8)]'}`}>
              <div className="flex items-baseline gap-4">
                <span className="animate-pulse">{lastRoll.toFixed(2)}</span>
                <span className="text-2xl md:text-3xl opacity-60 uppercase tracking-[0.3em] font-heading italic">{isWin ? 'CRITICAL WIN' : 'VOID'}</span>
              </div>
              <div className={`w-full h-1 mt-4 rounded-full shadow-[0_0_20px_currentColor] ${isWin ? 'bg-green-400' : 'bg-red-400'} opacity-80 animate-scanline`}></div>
            </div>
          )}
          {isRolling && displayRoll !== null && (
            <div className="text-4xl md:text-6xl text-white/40 font-mono font-black animate-pulse glitch-effect">
              {displayRoll.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Tactical Probability Slider - Compact */}
      <div className={`w-full flex flex-col items-center gap-3 pb-2 z-20 transition-transform duration-700 ${context.is3DMode ? 'translate-y-[10px] scale-[0.98]' : ''}`}>
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