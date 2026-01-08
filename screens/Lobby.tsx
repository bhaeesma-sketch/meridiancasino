import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';
import { NEW_USER_BONUS } from '../services/referralService';
import { MeridianButton } from '../components/MeridianButton';

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
          $5.00 BONUS DETECTED
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
    if (context?.user?.isNewUser && !context?.user?.newUserBonusClaimed) {
      const timer = setTimeout(() => setShowBonus(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [context?.user?.isNewUser, context?.user?.newUserBonusClaimed]);

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
    { name: 'Dice', desc: 'Roll for the stars.', img: '/assets/dice-profile.png', path: '/dice', icon: 'casino', color: 'text-jewel-ruby', theme: 'ruby', glow: 'shadow-jewel-glow-ruby' },
    { name: 'Plinko', desc: 'Quantum gravity drops.', img: '/assets/plinko-profile.png', path: '/plinko', icon: 'grid_view', color: 'text-jewel-amethyst', theme: 'amethyst', glow: 'shadow-jewel-glow-amethyst' },
    { name: 'Blackjack', desc: 'Live Dealer experience.', img: '/assets/blackjack-profile.png', path: '/blackjack', icon: 'playing_cards', color: 'text-metal-rose', theme: 'rose', glow: 'shadow-luxury-glow' },
    { name: 'Roulette', desc: 'Spin & Win legacy.', img: '/assets/roulette-profile.png', path: '/roulette', icon: 'incomplete_circle', color: 'text-jewel-sapphire', theme: 'sapphire', glow: 'shadow-jewel-glow-sapphire' },
    { name: 'Limbo', desc: 'Crash to the stars.', img: '/assets/limbo-profile.png', path: '/limbo', icon: 'trending_up', color: 'text-jewel-emerald', theme: 'emerald', glow: 'shadow-jewel-glow-emerald' },
  ];


  return (
    <div className="flex-1 min-h-0 flex flex-col justify-center py-4 px-6 max-w-6xl mx-auto w-full overflow-hidden">
      <div className="space-y-2 animate-deep-fade-up text-center mb-6">
        <h2 className="text-3xl md:text-5xl lg:text-5xl font-display font-black text-white leading-[0.9] uppercase drop-shadow-2xl">
          Epic Fantasy <br />
          <span className="meridian-title text-4xl md:text-6xl">CASINO GAMES</span>
        </h2>
        <p className="text-ice-electric text-xs font-medium mx-auto max-w-lg tracking-wider">
          ⚔️ High-stakes adventures • 🐉 Dragon-tier rewards • ⚡ Instant payouts
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-2 w-full max-w-5xl mx-auto pb-4">
          {games.map((game, idx) => {
            const themeClass = game.theme === 'fire' ? 'fire-theme' :
              game.theme === 'ice' ? 'ice-theme' : '';

            return (
              <div
                key={game.name}
                onMouseEnter={() => sounds.playHover()}
                onClick={() => {
                  sounds.playClick();
                  navigate(game.path);
                }}
                className={`luxury-card velvet-texture group cursor-pointer hover:${game.glow}`}
                style={{
                  animationDelay: `${idx * 0.1}s`,
                  minHeight: '320px'
                }}
              >
                <div className="card-content h-full relative z-10">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:opacity-90 transition-all duration-700 ease-out group-hover:scale-110"
                    style={{ backgroundImage: `url(${game.img})` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-meridian-navy via-meridian-midnight/60 to-transparent"></div>

                  {/* Mystical Particle Effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="particle particle-gold" style={{ top: '20%', left: '30%' }}></div>
                    <div className="particle particle-cyan" style={{ top: '40%', left: '70%' }}></div>
                    <div className="particle particle-magenta" style={{ top: '60%', left: '50%' }}></div>
                  </div>

                  <div className="relative z-20 h-full p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-2xl bg-luxury-velvet/80 border-2 border-metal-rose/30 backdrop-blur-md group-hover:border-metal-rose group-hover:shadow-luxury-glow transition-all duration-500">
                        <span className={`material-symbols-outlined text-3xl ${game.color} group-hover:scale-110 transition-transform`}>{game.icon}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="px-3 py-1 rounded-lg bg-luxury-velvet/80 border border-metal-rose/30 text-[9px] font-mono text-metal-rose uppercase tracking-widest font-bold">
                          ✦ Luxury Tier
                        </div>
                        <div className="text-[8px] font-mono text-jewel-emerald opacity-0 group-hover:opacity-100 transition-opacity animate-pulse">
                          🔥 LIVE NOW
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="px-1">
                        <h4 className="text-3xl md:text-4xl font-display font-black text-white uppercase group-hover:text-metal-rose transition-all duration-500 tracking-tight mb-2">
                          {game.name}
                        </h4>
                        <p className="text-[10px] text-metal-platinum uppercase font-bold tracking-[0.2em]">
                          {game.desc}
                        </p>
                      </div>
                      <MeridianButton
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playClick();
                          navigate(game.path);
                        }}
                        variant="primary"
                        size="md"
                        icon={<span className="material-symbols-outlined text-xl">play_arrow</span>}
                        className="w-full group-hover:translate-y-[-2px] transition-transform"
                      >
                        Launch Game
                      </MeridianButton>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showBonus && <BonusModal onClaim={handleClaimBonus} />}
    </div>
  );
};

export default Lobby;