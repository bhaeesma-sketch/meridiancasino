import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { sounds } from '../services/soundService';
import { NEW_USER_BONUS } from '../services/referralService';
import { DatastreamBonusModal } from '../components/DatastreamBonusModal';

// Reusing BonusModal functionality but styled minimally to fit the new theme if needed
// For now, we'll focus on the main Lobby layout replacement.

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);

  // Bonus Logic
  const [showBonus, setShowBonus] = useState(false);

  useEffect(() => {
    if (context?.user && context.user.isNewUser && !context.user.newUserBonusClaimed) {
      // Delay slightly for effect
      setTimeout(() => setShowBonus(true), 1000);
    }
  }, [context?.user]);

  const handleClaimBonus = () => {
    if (!context) return;
    const bonusAmount = context.user.referredBy ? NEW_USER_BONUS.withReferral : NEW_USER_BONUS.withoutReferral;
    context.updateBalance(bonusAmount);
    context.updateProfile({ newUserBonusClaimed: true });
    sounds.playWin();
    setShowBonus(false);
  };

  // --- Data Mapping for Games ---
  // Mapping existing games to the "Monitor" aesthetic
  const games = [
    {
      id: 'dice',
      name: 'Dice',
      sub: 'Classic High Stakes',
      path: '/dice',
      icon: 'casino',
      color: 'text-neon-purple',
      bg: 'border-neon-purple/30 hover:border-neon-purple',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM6cQQ6kFadFp1_-BNFkfInrsKXUox-MhuLAoQMS2qQVNqhEIf4brak0i8gzWF9ZKSCFAgbNOdyMNDF8deV997I1PtRl6kmNQaQb8SvllWZNJUjoztHzY9pxw-HDyk4Yx2vMLEltAcJP_6LmECIoYY6Lj-coktblFRu3lJryNWoezObRIu2t7w5lp2Ju3bcSLNJj1zigoOE0UXv2qlBgOHcYqR5E471G1CkpUDPVVVnZ1W4D0ohGSyGa-c5QsD093Yh1VED3FO5xs',
      gradient: 'from-neon-purple/20'
    },
    {
      id: 'plinko',
      name: 'Plinko',
      sub: 'Multi-Ball Action',
      path: '/plinko',
      icon: 'blur_on',
      color: 'text-neon-green',
      bg: 'border-neon-green/30 hover:border-neon-green',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkxF6mlo0DmO7947IzixxnCJ8cGjxM1Xd-zQccZXlWw4HLU0mVCEc1mV7H4HatJkfs7mTM5iLFxWu6BIvIb5HmtzOy6_-F271bE8VFpfGz_IAFRy2-NPMYkHPv9mS0M_6JdWFKk3NV5p6JNdu12BHsbBOhzVfX3Rr1_pd7kwhbDj_RACt1j6PxD4kDejU5nGcWpIFLS93mCMzY_Tmz75U8NRL8i2JcqcUgVw5HICWHHXFLwG3pvIf-C6eFF1BFRb6k0cFAhUxkFGk',
      gradient: 'from-neon-green/20'
    },
    {
      id: 'blackjack',
      name: 'Blackjack',
      sub: 'Strategy & Luck',
      path: '/blackjack',
      icon: 'playing_cards',
      color: 'text-neon-blue',
      bg: 'border-neon-blue/30 hover:border-neon-blue',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkxF6mlo0DmO7947IzixxnCJ8cGjxM1Xd-zQccZXlWw4HLU0mVCEc1mV7H4HatJkfs7mTM5iLFxWu6BIvIb5HmtzOy6_-F271bE8VFpfGz_IAFRy2-NPMYkHPv9mS0M_6JdWFKk3NV5p6JNdu12BHsbBOhzVfX3Rr1_pd7kwhbDj_RACt1j6PxD4kDejU5nGcWpIFLS93mCMzY_Tmz75U8NRL8i2JcqcUgVw5HICWHHXFLwG3pvIf-C6eFF1BFRb6k0cFAhUxkFGk',
      gradient: 'from-neon-blue/20'
    },
    {
      id: 'roulette',
      name: 'Roulette',
      sub: 'The Grand Wheel',
      path: '/roulette',
      icon: 'panorama_photosphere',
      color: 'text-neon-pink',
      bg: 'border-neon-pink/30 hover:border-neon-pink',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYObtHI8DhYEpYkR-JAzhodSlHBaruhD0lz4rIBUZjdP8LXv7BJ-zxTQGhCQagDxNAtLopbXrtYlzluhDbmDfjKU8qokipBkKXiURiRQUPfR3TIdXYGLdlHdBNJ-8Tjni1q9ol8xfi6IwCGOSUMe7Izz1q8iCVpwYZHWBZppjV11NDys8Si8cH1BP1OCBDo7Uynk02yMOnbBelkgfgjOFSOBjCZSKVvq6IT7bVWQyD80diklnIX20q41sN9MLmfB4APqlMkhNtJ54',
      gradient: 'from-neon-pink/20'
    },
    {
      id: 'limbo',
      name: 'Limbo',
      sub: 'Multiply Your Gains',
      path: '/limbo',
      icon: 'trending_up',
      color: 'text-neon-yellow',
      bg: 'border-neon-yellow/30 hover:border-neon-yellow',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM6cQQ6kFadFp1_-BNFkfInrsKXUox-MhuLAoQMS2qQVNqhEIf4brak0i8gzWF9ZKSCFAgbNOdyMNDF8deV997I1PtRl6kmNQaQb8SvllWZNJUjoztHzY9pxw-HDyk4Yx2vMLEltAcJP_6LmECIoYY6Lj-coktblFRu3lJryNWoezObRIu2t7w5lp2Ju3bcSLNJj1zigoOE0UXv2qlBgOHcYqR5E471G1CkpUDPVVVnZ1W4D0ohGSyGa-c5QsD093Yh1VED3FO5xs',
      gradient: 'from-neon-yellow/20'
    },
  ];

  if (!context) return null;

  return (
    <div className="flex-1 relative overflow-hidden h-full flex flex-col font-display">
      <DatastreamBonusModal
        isOpen={showBonus}
        onClaim={handleClaimBonus}
        bonusAmount={context.user.referredBy ? NEW_USER_BONUS.withReferral : NEW_USER_BONUS.withoutReferral}
      />
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-2] bg-cyber-city transform scale-105"></div>
      <div className="fixed inset-0 z-[-1] bg-grid pointer-events-none opacity-20"></div>
      <div className="fixed inset-0 z-[-1] bg-gradient-to-t from-cyber-black via-cyber-black/80 to-transparent pointer-events-none"></div>

      <main className="flex-1 relative z-10 flex flex-col lg:flex-row gap-8 px-6 lg:px-12 h-full py-12">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center gap-8 lg:gap-10 max-w-6xl mx-auto lg:mx-0">

          {/* Hero Section */}
          <div className="space-y-2 animate-float pl-2 relative">
            <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-pink via-neon-purple to-transparent"></div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--neo-glass-bg)] border border-neon-purple/50 w-fit rounded-[var(--neo-border-radius)] mb-2 shadow-[var(--neo-shadow-inset)]">
              <span className="size-2 bg-neon-green animate-pulse shadow-[0_0_8px_#00FFC0]"></span>
              <span className="text-[10px] font-mono font-bold text-neon-purple uppercase tracking-widest">System Online</span>
            </div>

            <h2 className="text-6xl md:text-8xl font-heading font-black text-white leading-[0.85] uppercase tracking-tighter drop-shadow-2xl">
              ACCESS THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow via-neon-orange to-neon-yellow animate-pulse-neon glitch-text" data-text="DATASTREAM">
                DATASTREAM
              </span>
            </h2>

            <p className="text-neon-blue/80 text-lg md:text-xl font-refined leading-relaxed max-w-lg drop-shadow-[0_0_5px_rgba(0,229,255,0.3)] mt-4 border-l-[2px] border-neon-blue/30 pl-4">
                            // SYNCHRONIZING REAL-TIME FEEDS...<br />
              <span className="text-neo-text-muted text-base font-refined">
                Unlock unparalleled insights into the global network. select a protocol to begin.
              </span>
            </p>

            <div className="flex gap-4 pt-6">
              <button className="h-12 px-8 bg-neon-purple/20 border border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white font-refined font-bold text-sm uppercase tracking-wider transition-all shadow-neon-purple hover:shadow-[0_0_40px_rgba(79,209,197,0.6)] flex items-center gap-2 rounded-[var(--neo-border-radius)] hover:-translate-y-1 shadow-[var(--neo-shadow-inset)]"
                onClick={() => sounds.playClick()}>
                <span className="material-symbols-outlined">play_circle</span>
                Monitor Feeds
              </button>
              <button className="h-12 px-8 bg-[var(--neo-glass-bg)] border border-white/20 text-white hover:border-neon-blue hover:text-neon-blue font-refined font-bold text-sm uppercase tracking-wider backdrop-blur-md transition-all rounded-[var(--neo-border-radius)] hover:-translate-y-1 shadow-[var(--neo-shadow-inset)]"
                onClick={() => sounds.playHover()}>
                View Protocols
              </button>
            </div>
          </div>

          {/* Game Grid (Holographic Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-auto w-full">
            {games.map((game, idx) => (
              <div
                key={game.id}
                onClick={() => navigate(game.path)}
                onMouseEnter={() => sounds.playHover()}
                className={`group relative h-64 bg-[var(--neo-glass-bg)] border ${game.bg} transition-all duration-300 overflow-hidden rounded-[var(--neo-border-radius)] hologram-card shadow-glassmorphism cursor-pointer`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-b ${game.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10`}></div>

                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 opacity-70 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
                  style={{ backgroundImage: `url("${game.img}")` }}
                ></div>

                {/* Scanline Effect */}
                <div className={`absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,255,192,0.1)_50%,transparent_100%)] bg-[length:100%_1px] opacity-0 group-hover:opacity-100 pointer-events-none animate-scanline`}></div>

                {/* Card Content */}
                <div className="relative z-20 h-full p-5 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <span className={`bg-[var(--neo-glass-bg)] ${game.color} border border-current p-1 rounded-[var(--neo-border-radius)] backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0 shadow-[var(--neo-shadow-inset)]`}>
                      <span className="material-symbols-outlined text-lg">{game.icon}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className={`text-xl font-refined font-bold text-neo-text-light group-hover:${game.color} transition-colors uppercase tracking-widest drop-shadow-md`}>
                      {game.name}
                    </h4>
                    <div className={`w-full h-[1px] bg-current opacity-50 my-2 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${game.color}`}></div>
                    <span className={`text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity delay-75 block ${game.color}`}>
                      {game.sub}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar (Live Feed) - Visual Only for Atmosphere */}
        <aside className="hidden xl:flex w-80 flex-col gap-4 self-center h-[calc(100vh-8rem)]">
          <div className="bg-[var(--neo-glass-bg)] backdrop-blur-xl border border-[var(--neo-border-color)] rounded-[var(--neo-border-radius)] flex flex-col h-full relative overflow-hidden group shadow-glassmorphism">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] mix-blend-overlay"></div>
            <div className="p-4 border-b border-[var(--neo-border-color)] bg-[var(--neo-glass-bg)] flex items-center justify-between">
              <h3 className="font-refined font-bold text-neon-green text-sm uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_5px_rgba(0,255,192,0.5)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
                </span>
                Live Feed
              </h3>
              <span className="material-symbols-outlined text-white/30 text-sm hover:text-neon-blue cursor-pointer transition-colors">settings_ethernet</span>
            </div>

            {/* Feed Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {/* Feed Item 1 */}
              <div className="flex items-center gap-3 p-3 bg-white/5 border-l-[1px] border-transparent hover:border-neon-green hover:bg-white/10 transition-all group cursor-pointer rounded-[var(--neo-border-radius)] shadow-[var(--neo-shadow-inset)]">
                <div className="size-8 rounded-[var(--neo-border-radius)] bg-cover bg-center border border-white/10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB9e0ZYfFZJopsp3XPAMnix85wut4x1rRTFJ00d1onckNFEKH_KJj5u9OOntRZMrXx_xRBLs80oYiQwrkNM8pU0yMhVjUWto-R2gYyiC39dm-SNMr7vbD8ZGboeYjHIFrJ6WhT-0oPG4mgL80GpjeRp19hElq6PsFAbvKXXBblxJIKhSqqYgXkNoRwrMmYD4cg_a52RSOYJq4NIgcjeHy-9KfpsTL3pC7pErrrA0zZa5SrsjWDmqNh6YQ3pQfjk4q4lBtgewYdb5fg")' }}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-neo-text-light font-refined tracking-wide group-hover:text-neon-blue transition-colors">Admin_User_01</span>
                    <span className="text-[10px] font-mono text-neon-green shadow-neo-shadow-green">Login Success</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-neo-text-muted uppercase font-refined mt-0.5">
                    <span className="material-symbols-outlined text-[10px] text-neon-purple">lock</span> System Log
                  </div>
                </div>
              </div>
              {/* Feed Item 2 */}
              <div className="flex items-center gap-3 p-3 bg-white/5 border-l-[1px] border-transparent hover:border-neon-pink hover:bg-white/10 transition-all group cursor-pointer rounded-[var(--neo-border-radius)] shadow-[var(--neo-shadow-inset)]">
                <div className="size-8 rounded-[var(--neo-border-radius)] bg-cover bg-center border border-white/10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC4nlX4RWN8twhQlKA1JCIhSaPfMXCyw8RYaqc8XfQGfciObnCh3D-MwU8YGPqgbl_5KgcglFauluFVE_zzIuYqp4GShsNnHZYb9YyUjZV7-Hzp8EWYjDogiJi2SyQMjM9-Haz6jRvFwNkRSgDx5dFy5kpP0sFsXLklSYs9rX6uhqwgikNs4SFMUqzHW24uy1Qgshkqkl17P1zbLGZme8fCWSTtlvKa7disR4I0QA47O4ZbVO6xtRU9hwqJfNRo3eQ5hy7ipfea5OE")' }}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-neo-text-light font-refined tracking-wide group-hover:text-neon-blue transition-colors">Server_Node_X</span>
                    <span className="text-[10px] font-mono text-neon-green shadow-neo-shadow-green">Traffic Peak +24%</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-neo-text-muted uppercase font-refined mt-0.5">
                    <span className="material-symbols-outlined text-[10px] text-neon-orange">ssid_chart</span> Network
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom Ticker */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#050505]/80 backdrop-blur-sm border-t border-gray-800 z-40 flex items-center overflow-hidden shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
        <div className="w-full flex">
          <div className="flex animate-ticker whitespace-nowrap">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-8 px-4">
                <span className="text-neon-yellow text-xs font-bold uppercase tracking-widest font-refined drop-shadow-[0_0_5px_rgba(167,236,238,0.6)]">Latest Log:</span>
                <span className="text-xs text-neo-text-light font-refined font-semibold">User_3451_NYC - Session Start</span>
                <span className="text-gray-700">|</span>
                <span className="text-neon-blue text-xs font-bold uppercase tracking-widest font-refined drop-shadow-[0_0_5px_rgba(0,229,255,0.6)]">Market Update:</span>
                <span className="text-xs text-neo-text-light font-refined font-semibold">MarketBot_Alpha - Report Complete</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;