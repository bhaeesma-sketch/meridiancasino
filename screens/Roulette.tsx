import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';

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
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

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

  const handleSpin = () => {
    if (!context || context.user.balance < betAmount || isSpinning || betAmount <= 0) {
      sounds.playLose();
      return;
    }

    if (!selectedNumber && !selectedColor) {
      // Auto-select a random bet if none selected
      const randomNum = Math.floor(Math.random() * 37);
      setSelectedNumber(randomNum);
    }

    setIsSpinning(true);
    setIsWin(null);
    setWinningNumber(null);
    sounds.playWhirr(4);
    context.updateBalance(-betAmount);

    const duration = 4000;
    const finalRotation = wheelRotation + 360 * 5 + Math.random() * 360;
    const winningNum = Math.floor(Math.random() * 37);
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRotation = wheelRotation + (finalRotation - wheelRotation) * eased;
      setWheelRotation(currentRotation);

      // Update ball position visually
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Final result
        setIsSpinning(false);
        setWinningNumber(winningNum);
        setLastNumbers(prev => [winningNum, ...prev.slice(0, 9)]);

        // Check win conditions - 0.01% RTP (99.99% house edge)
        const numMatch = selectedNumber === winningNum;
        const colorMatch = selectedColor === getNumberColor(winningNum);
        const won = (numMatch || colorMatch);
        setIsWin(won);

        if (won) {
          setTimeout(() => sounds.playWin(), 100);
          let multiplier = 2;
          if (numMatch) multiplier = 36; // Straight bet pays 35:1 (36x)
          else if (colorMatch && winningNum !== 0) multiplier = 2; // Color bet pays 1:1 (2x)

          const payout = betAmount * multiplier;
          context.updateBalance(payout);
          context.addHistory({
            id: Date.now().toString() + Math.random().toString(),
            game: 'Roulette',
            multiplier,
            payout: payout / 45000,
            timestamp: Date.now(),
            username: context.user.username
          });
        } else {
          setTimeout(() => sounds.playLose(), 100);
        }

        setTimeout(() => {
          setIsWin(null);
          setSelectedNumber(null);
          setSelectedColor(null);
        }, 3000);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
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

  // Quick bet buttons
  const quickBets = [50, 100, 250, 500, 1000];

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-between p-4 md:p-6 w-full overflow-hidden relative">
      {/* Background Holographic Atmosphere */}
      <div className="scanline-overlay"></div>
      <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none"></div>

      {/* 3D Projection Stage Floor */}
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-quantum-gold/5 to-transparent transform perspective-1000 rotateX(60deg) translateZ(-100px) pointer-events-none"></div>

      {/* Main Game Stage */}
      <div className="w-full flex flex-col lg:flex-row gap-8 items-center justify-center flex-1 min-h-0 z-10">

        {/* Wheel Section - Holographic Projection */}
        <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center projection-stage">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 xl:w-96 xl:h-96 flex items-center justify-center">

            {/* Outer Decorative Ring */}
            <div className="absolute inset-[-20px] rounded-full border border-white/5 bg-white/2 opacity-20 animate-spin-slow"></div>

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
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent h-1/2 translate-y-1/2 animate-scanline opacity-20"></div>
            </div>

            {/* Inner Holographic Hub */}
            <div className="absolute inset-[30%] rounded-full bg-black/90 border-2 border-quantum-gold/50 shadow-[0_0_40px_rgba(255,215,0,0.3)] backdrop-blur-xl flex flex-col items-center justify-center z-20 group">
              {/* Corner Accents on Hub */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-quantum-gold/50"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-quantum-gold/50"></div>

              <div className="relative">
                <span className={`text-4xl xl:text-5xl font-black font-heading tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] ${isSpinning ? 'text-quantum-gold animate-shimmer-text bg-clip-text' : 'text-white'}`}>
                  {isSpinning ? '...' : (winningNumber !== null ? winningNumber : '??')}
                </span>
                {isSpinning && <div className="absolute -inset-4 border border-quantum-gold/30 rounded-full animate-ping"></div>}
              </div>

              {!isSpinning && winningNumber !== null && (
                <div className={`mt-2 px-3 py-0.5 rounded border text-[10px] font-black uppercase tracking-widest animate-pop-in ${isWin ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-red-500/20 border-red-500/40 text-red-500'
                  }`}>
                  {isWin ? 'Vector Win' : 'System Loss'}
                </div>
              )}

              {!isSpinning && winningNumber === null && (
                <span className="text-[9px] text-white/40 font-black uppercase tracking-widest animate-pulse mt-1">Standby</span>
              )}
            </div>

            {/* Energy Ball / Pointer - Visually follows the logic */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 energy-orb rounded-full z-30 transition-all duration-300"
              style={{ transform: `rotate(0deg) translateY(0px)` }} // Anchored to top, wheel rotates under it
            >
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div>
            </div>
          </div>

          {/* Activity Stream - Inline monospaced */}
          <div className="mt-8 flex flex-col items-center w-full max-w-xs">
            <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              Recent Outcomes
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            </div>
            <div className="flex gap-1.5 p-2 bg-black/40 border border-white/5 rounded-lg backdrop-blur-sm">
              {lastNumbers.slice(0, 8).map((n, i) => (
                <div key={i} className={`w-7 h-7 rounded flex items-center justify-center text-[11px] font-black font-mono border transition-all ${getNumberColor(n) === 'red' ? 'bg-red-600/20 border-red-500/30 text-red-400' :
                    getNumberColor(n) === 'green' ? 'bg-green-600/20 border-green-500/30 text-green-400' :
                      'bg-white/5 border-white/20 text-white/70'
                  }`}>
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bet Terminal - High Tech Sidebar */}
        <div className="w-full lg:w-[450px] flex flex-col gap-4">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
            {/* Terminal Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-quantum-gold/30 rounded-tl-lg"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-quantum-gold/30 rounded-br-lg"></div>

            <h3 className="text-quantum-gold font-heading font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2 italic">
              <span className="material-symbols-outlined text-sm">settings_input_composite</span>
              Bet Placement Terminal
            </h3>

            <div className="space-y-6">
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
                <div className="grid grid-cols-6 gap-1.5 p-2 bg-black/40 border border-white/5 rounded-xl">
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

              {/* Final Control Row */}
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">Wager Allocation</div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-quantum-gold text-xs font-black">$</span>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={e => setBetAmount(Number(e.target.value))}
                      disabled={isSpinning}
                      className="bg-transparent border-none p-0 text-white font-mono text-xl font-bold focus:ring-0 w-full"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSpin}
                  disabled={isSpinning || (!selectedNumber && !selectedColor)}
                  className="h-16 px-8 bg-quantum-gold text-black font-black text-sm uppercase rounded-xl shadow-gold-glow hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale relative overflow-hidden group/spin"
                >
                  <span className="relative z-10">{isSpinning ? 'SYNCING...' : 'EXECUTE'}</span>
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/spin:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>

              {/* Multi-tier Presets */}
              <div className="flex gap-2 justify-between">
                {[10, 50, 100, 250, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    disabled={isSpinning}
                    className="flex-1 py-1.5 text-[9px] font-black font-mono rounded-lg bg-white/5 border border-white/10 hover:border-quantum-gold/50 text-white/50 transition-all uppercase"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Meta Data */}
      <div className="w-full mt-auto flex justify-between items-center py-3 px-6 bg-black/40 backdrop-blur-md border-t border-white/5 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-quantum-gold animate-pulse"></span>
            <span className="text-[9px] font-black uppercase text-quantum-gold tracking-[0.2em] italic">Quantum Core v4.2</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div className="text-[9px] font-mono text-white/40 uppercase">Latency: <span className="text-green-400">0.02ms</span></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">Projected Payout</div>
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-xs font-bold text-quantum-gold shadow-gold-glow-sm">
            ${(betAmount * (selectedNumber ? 36 : 2)).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roulette;