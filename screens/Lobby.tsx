import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';
import { NEW_USER_BONUS } from '../services/referralService';

const BonusModal: React.FC<{ onClaim: () => void }> = ({ onClaim }) => {
  const [isExploding, setIsExploding] = useState(false);

  const handleClaim = () => {
    setIsExploding(true);
    setTimeout(onClaim, 1500);
  };

  return (
    <div className="bonus-modal-overlay">
      <div className="bonus-modal-content animate-holo-entry">
        <div className="bonus-glow"></div>

        <div className="bonus-token-scene">
          <div className="bonus-token">
            <div className="token-face token-front">$</div>
            <div className="token-face token-back">$</div>
            <div className="token-side"></div>
          </div>
        </div>

        <h2 className="text-3xl font-heading font-black text-white uppercase mb-2 tracking-tighter">
          Quantum Welcome
        </h2>
        <p className="text-quantum-gold text-lg font-mono font-bold mb-6 animate-pulse">
          $10.00 BONUS DETECTED
        </p>

        <p className="text-white/60 text-xs mb-8 leading-relaxed max-w-[280px] mx-auto">
          Welcome to the Future of Gaming. Your initial quantum credit is ready for activation.
        </p>

        <button
          onClick={handleClaim}
          disabled={isExploding}
          className={`w-full py-4 bg-gradient-to-r from-yellow-400 to-quantum-gold text-black font-black uppercase rounded-2xl shadow-gold-glow hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden ${isExploding ? 'opacity-0' : ''}`}
        >
          Activate Bonus
        </button>

        {isExploding && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-quantum-gold font-black text-4xl animate-ping">CRITICAL SUCCESS!</div>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="explosion-particle"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(${(Math.random() - 0.5) * 400}px, ${(Math.random() - 0.5) * 400}px)`,
                  transition: 'all 1s ease-out',
                  opacity: 0,
                  animation: `explode 1s ease-out forwards`
                }}
              />
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes explode {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [showBonus, setShowBonus] = useState(false);

  useEffect(() => {
    if (context?.user && context.user.isNewUser && !context.user.newUserBonusClaimed) {
      const timer = setTimeout(() => setShowBonus(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [context?.user]);

  if (!context) return null;

  const handleClaimBonus = async () => {
    sounds.playWin();
    const bonusAmount = context.user.referredBy ? NEW_USER_BONUS.withReferral : NEW_USER_BONUS.withoutReferral;

    // Update local state and Supabase
    await context.updateProfile({
      balance: context.user.balance + bonusAmount,
      newUserBonusClaimed: true,
      isNewUser: false // No longer "new" after claiming
    });

    setShowBonus(false);
  };

  const games = [
    { name: 'Dice', desc: 'Roll for the stars.', img: '/assets/dice-profile.png', path: '/dice', icon: 'casino', color: 'text-quantum-gold' },
    { name: 'Plinko', desc: 'Quantum gravity drops.', img: '/assets/plinko-profile.png', path: '/plinko', icon: 'grid_view', color: 'text-plasma-purple' },
    { name: 'Blackjack', desc: 'Live Dealer experience.', img: '/assets/blackjack-profile.png', path: '/blackjack', icon: 'playing_cards', color: 'text-red-400' },
    { name: 'Roulette', desc: 'Spin & Win legacy.', img: '/assets/roulette-profile.png', path: '/roulette', icon: 'incomplete_circle', color: 'text-quantum-gold' },
    { name: 'Limbo', desc: 'Crash to the stars.', img: '/assets/limbo-profile.png', path: '/limbo', icon: 'trending_up', color: 'text-cyan-400' },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-center py-4 px-6 max-w-6xl mx-auto w-full overflow-hidden">
      <div className="space-y-2 animate-deep-fade-up text-center mb-6">
        <h2 className="text-3xl md:text-5xl lg:text-5xl font-heading font-extrabold text-white leading-[0.9] uppercase drop-shadow-2xl">
          The Future <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-quantum-gold via-yellow-200 to-quantum-gold">Of Gaming</span>
        </h2>
        <p className="text-white/80 text-xs font-medium mx-auto max-w-lg">
          High-stakes quantum simulations. Pro-dealer experience. Zero latency.
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-2 w-full max-w-5xl mx-auto pb-4">
          {games.map((game, idx) => (
            <div
              key={game.name}
              onMouseEnter={() => sounds.playHover()}
              onClick={() => {
                sounds.playClick();
                navigate(game.path);
              }}
              className="group relative flex flex-col rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-3xl cursor-pointer transition-all duration-700 premium-card animate-deep-fade-up shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] hover:shadow-gold-glow-sm hover:scale-[1.02] active:scale-95"
              style={{
                animationDelay: `${idx * 0.1}s`,
                minHeight: '280px'
              }}
            >
              <div className="card-content h-full relative z-10">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-110"
                  style={{ backgroundImage: `url(${game.img})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute inset-0 holographic-card-gradient opacity-20 group-hover:opacity-100 group-hover:animate-holo-shimmer pointer-events-none transition-opacity duration-500"></div>

                <div className="relative z-20 h-full p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md group-hover:border-quantum-gold/50 group-hover:bg-quantum-gold/10 group-hover:text-quantum-gold transition-all duration-500">
                      <span className={`material-symbols-outlined text-2xl ${game.color} group-hover:text-inherit`}>{game.icon}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="px-2 py-0.5 rounded bg-black/60 border border-white/5 text-[8px] font-mono text-white/40 uppercase tracking-widest group-hover:text-quantum-gold/80 transition-colors">
                        Quantum Ready
                      </div>
                      <div className="text-[7px] font-mono text-green-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse">
                        LIVE DROPS ACTIVE
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="px-1">
                      <h4 className="text-2xl md:text-3xl font-heading font-black text-white uppercase group-hover:text-quantum-gold transition-all duration-500 tracking-tighter">
                        {game.name}
                      </h4>
                      <p className="text-[9px] text-white/40 uppercase font-bold tracking-[0.2em] mt-1">
                        {game.desc}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playClick();
                        navigate(game.path);
                      }}
                      className="w-full py-4 bg-gradient-to-r from-yellow-400 via-quantum-gold to-yellow-600 text-black font-black uppercase text-sm rounded-2xl shadow-gold-glow hover:shadow-[0_0_40px_rgba(255,215,0,0.5)] transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 group-hover:translate-y-[-2px]"
                    >
                      <span className="material-symbols-outlined text-xl font-black">play_arrow</span>
                      Launch Game
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showBonus && <BonusModal onClaim={handleClaimBonus} />}
    </div>
  );
};

export default Lobby;