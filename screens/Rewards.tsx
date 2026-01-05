
import React from 'react';

const Rewards: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-10 flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-5xl font-black italic uppercase">Daily <span className="text-primary">Rewards</span></h2>
        <p className="text-gray-400">Log in daily to maintain your Quantum Streak and unlock bonuses.</p>
      </div>

      <section className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-plasma/5 blur-[80px] rounded-full" />
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">calendar_today</span> Login Streak
          </h3>
          <span className="px-3 py-1 bg-plasma/20 border border-plasma text-plasma text-xs font-bold rounded-full">Day 4 of 7</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 mb-10">
          {[1, 2, 3].map(d => (
            <div key={d} className="aspect-square bg-surface border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-40">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              <span className="text-xs font-bold text-gray-500 uppercase">Day {d}</span>
            </div>
          ))}
          <div className="aspect-square bg-surface border-2 border-primary rounded-2xl flex flex-col items-center justify-center gap-2 shadow-[0_0_20px_rgba(242,208,13,0.3)]">
            <span className="material-symbols-outlined text-primary text-3xl">token</span>
            <span className="text-sm font-bold">Day 4</span>
            <span className="text-[10px] text-primary uppercase font-black">Ready</span>
          </div>
          {[5, 6, 7].map(d => (
            <div key={d} className="aspect-square bg-surface border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-20">
              <span className="material-symbols-outlined text-gray-600">lock</span>
              <span className="text-xs font-bold text-gray-500 uppercase">Day {d}</span>
            </div>
          ))}
        </div>

        <button className="w-full py-5 bg-primary text-black font-black text-xl uppercase rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
          Claim Daily Reward
        </button>
      </section>

      <div>
        <h3 className="text-2xl font-bold mb-6">Exclusive Supply Drops</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Starter Pack', price: '$4.99', desc: '500 QC + 5 Items', img: 'https://picsum.photos/seed/p1/300/200' },
            { name: 'VIP Bundle', price: '$14.99', desc: '2500 QC + 3 Day XP', img: 'https://picsum.photos/seed/p2/300/200', elite: true },
            { name: 'Quantum Hoard', price: '$49.99', desc: '10,000 QC + Legendary', img: 'https://picsum.photos/seed/p3/300/200' },
          ].map(p => (
            <div key={p.name} className={`glass-panel p-5 rounded-2xl border ${p.elite ? 'border-plasma/50' : 'border-white/5'} hover:scale-105 transition-all group cursor-pointer`}>
              <img src={p.img} alt={p.name} className="w-full h-32 object-cover rounded-xl mb-4 group-hover:brightness-110" />
              <h4 className="font-bold mb-1">{p.name}</h4>
              <p className="text-xs text-gray-500 mb-4">{p.desc}</p>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="font-mono font-bold text-primary">{p.price}</span>
                <span className="material-symbols-outlined text-gray-500 group-hover:text-primary">shopping_cart</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
