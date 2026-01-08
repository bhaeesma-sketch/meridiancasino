import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { BalanceDetails } from '../components/profile/BalanceDetails';
import { StatsChart } from '../components/profile/StatsChart';
import { GameHistoryTable } from '../components/profile/GameHistoryTable';
import { SecuritySettings } from '../components/profile/SecuritySettings';
import { Preferences } from '../components/profile/Preferences';
import { ReferralSection } from '../components/profile/ReferralSection';
import { NEW_USER_BONUS } from '../services/referralService';

const Profile: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { user, updateBalance, updateProfile } = context;

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'security' | 'settings' | 'referral'>('overview');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'referral') {
      setActiveTab('referral');
    }
  }, [location.search]);

  // Mock bonus balance for now if not in user object
  const bonusBalance = user.bonus_balance || 0;
  const totalDeposited = user.total_deposited || 15000; // Mock or real
  const totalWagered = user.wagered || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      {/* Header Profile Card */}
      <section className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="size-20 rounded-full p-1 bg-gradient-to-tr from-primary to-plasma shadow-lg relative">
            <img className="w-full h-full rounded-full object-cover border-2 border-black" src={user.avatar} alt="Avatar" />
            <div className="absolute bottom-0 right-0 size-6 bg-black rounded-full flex items-center justify-center border border-white/10">
              <span className="material-symbols-outlined text-[14px] text-quantum-gold">workspace_premium</span>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black font-heading text-white">{user.username}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{user.tier}</span>
              <span>Joined {new Date(user.joinedDate || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions (Tabs) */}
        <div className="flex-1 w-full flex gap-2 overflow-x-auto pb-2 md:pb-0 justify-start md:justify-end custom-scrollbar">
          {['overview', 'stats', 'referral', 'security', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab ? 'bg-primary text-black shadow-lg scale-105' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* New User Bonus Banner */}
      {user.isNewUser && !user.newUserBonusClaimed && (
        <div className="glass-panel bg-gradient-to-r from-quantum-gold/20 via-yellow-500/10 to-quantum-gold/20 border-2 border-quantum-gold/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-quantum-gold text-4xl">celebration</span>
              <div>
                <h3 className="text-xl font-black text-quantum-gold">Welcome Bonus Available!</h3>
                <p className="text-gray-300 text-sm">Claim your <span className="font-bold text-white">${user.referredBy ? NEW_USER_BONUS.withReferral : NEW_USER_BONUS.withoutReferral}</span> startup funds.</p>
              </div>
            </div>
            <button
              onClick={() => {
                const bonusAmount = user.referredBy ? NEW_USER_BONUS.withReferral : NEW_USER_BONUS.withoutReferral;
                updateBalance(bonusAmount);
                updateProfile({ newUserBonusClaimed: true });
              }}
              className="px-6 py-2 bg-quantum-gold text-black font-black uppercase rounded-lg shadow-gold-glow hover:scale-105 transition-all"
            >
              Claim
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {activeTab === 'overview' && (
          <>
            <div className="lg:col-span-8 flex flex-col gap-6">
              <BalanceDetails
                realBalance={user.balance}
                bonusBalance={bonusBalance}
                totalDeposited={totalDeposited}
                totalWagered={totalWagered}
              />
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <StatsChart history={context.history} />
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <ReferralSection user={user} />
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <div className="lg:col-span-12 glass-panel p-6 rounded-2xl border border-white/5">
            <GameHistoryTable history={context.history} />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="lg:col-span-8 lg:col-start-3 glass-panel p-6 rounded-2xl border border-white/5">
            <SecuritySettings />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="lg:col-span-8 lg:col-start-3 glass-panel p-6 rounded-2xl border border-white/5">
            <Preferences />
          </div>
        )}

        {activeTab === 'referral' && (
          <div className="lg:col-span-12 glass-panel p-6 rounded-2xl border border-white/5">
            <ReferralSection user={user} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;