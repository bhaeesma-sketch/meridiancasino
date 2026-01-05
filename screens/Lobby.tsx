import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  if (!context) return null;

  const games = [
    { name: 'Dice', desc: 'Roll for the stars.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM6cQQ6kFadFp1_-BNFkfInrsKXUox-MhuLAoQMS2qQVNqhEIf4brak0i8gzWF9ZKSCFAgbNOdyMNDF8deV997I1PtRl6kmNQaQb8SvllWZNJUjoztHzY9pxw-HDyk4Yx2vMLEltAcJP_6LmECIoYY6Lj-coktblFRu3lJryNWoezObRIu2t7w5lp2Ju3bcSLNJj1zigoOE0UXv2qlBgOHcYqR5E471G1CkpUDPVVVnZ1W4D0ohGSyGa-c5QsD093Yh1VED3FO5xs', path: '/dice', icon: 'casino', color: 'text-quantum-gold' },
    { name: 'Plinko', desc: 'Quantum gravity drops.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUj1pxJAMRLAn1QVWSCZqMj2tSvKmR4I28YxCatcJhFNcy7RRC66ufbLLuv35pNldRy4jau2MEBePdvElAsvxbyek_lAsuAKbUz4nKrLZSGBl7uJZvpv8XjB7Mp-UHYxoBLyIwNRPSenTY3EdxCl8pHbAniEkP85RkJtnb36ZF9jzwWOzfQPR5tp-Wqg_z2qaY_jn6w7_PVxYhUkuHddI5bgq4sx7IHylvWYerNZFJ4eB3VrHcaEmcEfk_Xn6WthA_1OpNKJo85To', path: '/plinko', icon: 'grid_view', color: 'text-plasma-purple' },
    { name: 'Blackjack', desc: 'Live Dealer experience.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzCqpdKdjN6WPe_WwDynKutadSJbk-zid-dY3x0aRTr9K6tckAxxjj67sZONfz_F7hTw8sKt6MuX_pi0cb-esbHiRJ0Yg8gddiGhK5l_HEj5TI4N6fHqBzt-Sf_H6D6c64i87BHjZ-8EFhnDW6M2K2kmNTpbh3rVFVBiqr1tCh6lKGlLB_-KvcNMmnMyGFscFkdcnEbqb5IK65WcBwAgSQlRlSrTIcb4sZNY34Bpky2hphJqXOdGORmymFdQHgtrw8GEH7opuFtbI', path: '/blackjack', icon: 'playing_cards', color: 'text-red-400' },
    { name: 'Roulette', desc: 'Spin & Win legacy.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYObtHI8DhYEpYkR-JAzhodSlHBaruhD0lz4rIBUZjdP8LXv7BJ-zxTQGhCQagDxNAtLopbXrtYlzluhDbmDfjKU8qokipBkKXiURiRQUPfR3TIdXYGLdlHdBNJ-8Tjni1q9ol8xfi6IwCGOSUMe7Izz1q8iCVpwYZHWBZppjV11NDys8Si8cH1BP1OCBDo7Uynk02yMOnbBelkgfgjOFSOBjCZSKVvq6IT7bVWQyD80diklnIX20q41sN9MLmfB4APqlMkhNtJ54', path: '/roulette', icon: 'incomplete_circle', color: 'text-quantum-gold' },
    { name: 'Limbo', desc: 'Crash to the stars.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYObtHI8DhYEpYkR-JAzhodSlHBaruhD0lz4rIBUZjdP8LXv7BJ-zxTQGhCQagDxNAtLopbXrtYlzluhDbmDfjKU8qokipBkKXiURiRQUPfR3TIdXYGLdlHdBNJ-8Tjni1q9ol8xfi6IwCGOSUMe7Izz1q8iCVpwYZHWBZppjV11NDys8Si8cH1BP1OCBDo7Uynk02yMOnbBelkgfgjOFSOBjCZSKVvq6IT7bVWQyD80diklnIX20q41sN9MLmfB4APqlMkhNtJ54', path: '/limbo', icon: 'trending_up', color: 'text-cyan-400' },
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
              className="group relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 bg-space-gray/10 backdrop-blur-2xl cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-quantum-gold/30 hover:shadow-holo-glow shadow-plasma-card animate-deep-fade-up"
              style={{
                animationDelay: `${idx * 0.1}s`
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-all duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${game.img})` }}
              ></div>
              <div className="absolute inset-0 holographic-card-gradient opacity-0 group-hover:opacity-100 group-hover:animate-holo-shimmer pointer-events-none transition-opacity duration-500"></div>
              <div className="relative z-20 h-full p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm group-hover:border-quantum-gold/30 group-hover:text-quantum-gold transition-colors">
                    <span className={`material-symbols-outlined text-xl ${game.color} group-hover:text-inherit`}>{game.icon}</span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-black/60 border border-white/5 text-[8px] font-mono text-white/40 uppercase tracking-widest group-hover:text-quantum-gold/80 transition-colors">
                    Quantum Ready
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div>
                    <h4 className="text-lg md:text-xl font-heading font-extrabold text-white uppercase group-hover:text-quantum-gold transition-all duration-300">
                      {game.name}
                    </h4>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-0.5">
                      {game.desc}
                    </p>
                  </div>
                  <button className="w-full py-2 bg-quantum-gold text-black font-black uppercase text-[10px] rounded-lg shadow-gold-glow-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-xs font-black">play_arrow</span>
                    Launch Game
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lobby;