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
      <div className="scanline-overlay"></div>

      {/* Header & Wheel Stage */}
      <div className="w-full flex flex-col md:flex-row gap-6 items-center flex-1 min-h-0">
        {/* Wheel Section - Compact */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-mesh opacity-5 pointer-events-none"></div>

          <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-72 lg:h-72 flex items-center justify-center transform perspective-1000 rotateX(30deg)">
            {/* Rotating Outer Core */}
            <div
              className={`absolute inset-0 rounded-full border-4 border-quantum-gold/10 shadow-[0_0_50px_rgba(255,215,0,0.1)] transition-transform duration-75`}
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            >
              {Array.from({ length: 37 }).map((_, i) => (
                <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-4 flex flex-col items-center" style={{ transform: `rotate(${i * (360 / 37)}deg)`, transformOrigin: '50% 50%' }}>
                  <div className={`w-full h-4 rounded-sm border ${getNumberColor(i) === 'green' ? 'bg-green-600/30 border-green-500/50' : getNumberColor(i) === 'red' ? 'bg-red-600/30 border-red-500/50' : 'bg-black/40 border-gray-600/50'}`}>
                    <span className="text-[6px] font-mono text-white/80">{i}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Inner Hub */}
            <div className="absolute inset-16 lg:inset-20 rounded-full bg-black/90 border border-white/10 shadow-gold-glow flex flex-col items-center justify-center">
              <span className={`text-xl lg:text-3xl font-black ${isSpinning ? 'text-quantum-gold animate-pulse' : 'text-white'}`}>
                {isSpinning ? '...' : winningNumber !== null ? winningNumber : 'READY'}
              </span>
              {winningNumber !== null && !isSpinning && (
                <span className={`text-[8px] font-bold uppercase mt-1 ${isWin ? 'text-green-400' : 'text-red-400'}`}>{isWin ? 'Win' : 'Loss'}</span>
              )}
            </div>
          </div>

          {/* Recent History - Inline */}
          <div className="flex gap-1 mt-4 overflow-hidden">
            {lastNumbers.slice(0, 6).map((n, i) => (
              <div key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border ${getNumberColor(n) === 'red' ? 'bg-red-900/40 border-red-500/30' : 'bg-black/60 border-white/10'} text-white`}>{n}</div>
            ))}
          </div>
        </div>

        {/* Bet Terminal - Compact */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-xl border-white/5 bg-black/40">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={() => handleColorClick('red')} disabled={isSpinning} className={`py-2 rounded-lg border font-bold text-xs ${selectedColor === 'red' ? 'bg-red-600/40 border-red-400 text-white' : 'bg-red-600/10 border-red-500/20 text-red-400'}`}>RED (2x)</button>
              <button onClick={() => handleColorClick('black')} disabled={isSpinning} className={`py-2 rounded-lg border font-bold text-xs ${selectedColor === 'black' ? 'bg-black/60 border-white text-white' : 'bg-black/20 border-white/20 text-white/70'}`}>BLACK (2x)</button>
            </div>

            {/* Number Grid - Compacted */}
            <div className="grid grid-cols-6 sm:grid-cols-9 lg:grid-cols-12 gap-1 mb-4">
              {Array.from({ length: 36 }).map((_, i) => (
                <button key={i + 1} onClick={() => handleNumberClick(i + 1)} disabled={isSpinning} className={`h-8 rounded md:h-10 border text-[10px] font-mono font-bold transition-all ${selectedNumber === i + 1 ? 'border-quantum-gold bg-quantum-gold/20 text-quantum-gold' : 'border-white/5 bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex-1 bg-black/60 border border-white/10 rounded-lg p-2">
                <label className="text-[8px] text-gray-500 uppercase font-black block mb-0.5">Wager ($)</label>
                <input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} disabled={isSpinning} className="bg-transparent border-none p-0 text-white font-mono text-lg font-bold focus:ring-0 w-full" />
              </div>
              <button onClick={handleSpin} disabled={isSpinning || (!selectedNumber && !selectedColor)} className="px-6 py-4 bg-quantum-gold text-black font-black text-xs uppercase rounded-lg shadow-gold-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                SPIN
              </button>
            </div>
          </div>

          {/* Quick Bets */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            {[10, 50, 100, 500].map(amount => (
              <button key={amount} onClick={() => setBetAmount(amount)} disabled={isSpinning} className="px-2 py-1 text-[8px] font-mono font-bold rounded bg-white/5 border border-white/10 hover:border-quantum-gold/50 text-white/70">${amount}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Info HUD */}
      <div className="w-full flex justify-between items-center py-2 px-4 bg-black/20 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-quantum-gold animate-pulse"></span>
          <span className="text-[8px] font-black uppercase text-quantum-gold tracking-widest italic">Quantum Roulette Engine</span>
        </div>
        <div className="text-[8px] font-mono text-white/30">Payout: <span className="text-white/80">${(betAmount * (selectedNumber ? 36 : 2)).toFixed(2)}</span></div>
      </div>
    </div>
  );
};

export default Roulette;