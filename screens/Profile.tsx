import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { getReferralMultiplier, getPremiumReferralBonus, NEW_USER_BONUS } from '../services/referralService';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  if (!context) return null;
  const { user } = context;
  const [copied, setCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const referralCode = user.referralCode || 'GENERATING...';
  const referralEarnings = user.referralEarnings || 0;
  const referralCount = user.referralCount || 0;
  const activeReferrals = user.activeReferrals || 0;
  const referralMultiplier = getReferralMultiplier(user.tier);
  const premiumBonus = getPremiumReferralBonus(user.tier);
  const isPremium = ['VIP Platinum', 'Diamond', 'Elite'].includes(user.tier);
  const referralUrl = `clash.gg/ref/${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const achievements = [
    { title: 'High Roller', rarity: 'RARE', desc: 'Wager 1 BTC in a session', icon: 'diamond', color: 'text-primary' },
    { title: 'First Deposit', rarity: 'COMMON', desc: 'Secure your first vault funds', icon: 'rocket_launch', color: 'text-plasma' },
    { title: 'Sharpshooter', rarity: 'EPIC', desc: '10 wins in a row', icon: 'target', color: 'text-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 flex flex-col gap-6 md:gap-10">
      <section className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

        <div className="size-32 md:size-40 rounded-full p-1 bg-gradient-to-tr from-primary to-plasma shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <img className="w-full h-full rounded-full object-cover border-4 border-background-dark" src={user.avatar} alt="Avatar" />
        </div>

        <div className="flex-1 flex flex-col gap-3 md:gap-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
            <h2 className="text-3xl md:text-4xl font-bold">{user.username}</h2>
            <span className="px-3 py-1 bg-plasma/20 border border-plasma text-plasma text-xs font-bold uppercase rounded-full">Verified</span>
            {isPremium && (
              <span className="px-3 py-1 bg-quantum-gold/20 border border-quantum-gold text-quantum-gold text-xs font-bold uppercase rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">stars</span>
                Premium
              </span>
            )}
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-2 font-mono text-xs bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 group relative">
              <span className="material-symbols-outlined text-primary text-base">account_balance_wallet</span>
              <span className="max-w-[120px] md:max-w-none truncate">{user.address}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user.address || '');
                  setAddressCopied(true);
                  setTimeout(() => setAddressCopied(false), 2000);
                }}
                className="ml-1 hover:text-white transition-colors p-1"
              >
                <span className="material-symbols-outlined text-sm">{addressCopied ? 'check' : 'content_copy'}</span>
              </button>
              {addressCopied && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-quantum-gold text-black text-[10px] font-black px-2 py-1 rounded shadow-lg animate-bounce">
                  COPIED!
                </div>
              )}
            </div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">military_tech</span> {user.tier}</div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">calendar_month</span> Joined {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : '2023'}</div>
            {user.isNewUser && (
              <div className="flex items-center gap-2 text-quantum-gold">
                <span className="material-symbols-outlined text-lg">new_releases</span>
                New User
              </div>
            )}
          </div>
          <p className="text-gray-500 max-w-xl text-sm md:text-base">High-stakes strategist exploring the quantum realms of chance. Always betting on the future.</p>
        </div>

        <div className="flex flex-col gap-3 md:gap-4 min-w-[180px] md:min-w-[200px] w-full md:w-auto">
          <div className="glass-panel bg-black/40 p-3 md:p-4 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Wagered</p>
            <p className="text-xl font-bold text-primary">{user.wagered} BTC</p>
          </div>
          <div className="glass-panel bg-black/40 p-3 md:p-4 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Win Rate</p>
            <p className="text-xl font-bold text-green-400">{user.winRate}%</p>
          </div>
        </div>
      </section>

      {/* New User Bonus Banner */}
      {user.isNewUser && !user.newUserBonusClaimed && (
        <div className="glass-panel bg-gradient-to-r from-quantum-gold/20 via-yellow-500/10 to-quantum-gold/20 border-2 border-quantum-gold/50 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-quantum-gold/10 rounded-full blur-[80px]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-16 md:size-20 bg-quantum-gold/20 rounded-full flex items-center justify-center border-2 border-quantum-gold">
                <span className="material-symbols-outlined text-quantum-gold text-3xl md:text-4xl">celebration</span>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-quantum-gold mb-1">Welcome Bonus!</h3>
                <p className="text-white/80 text-sm md:text-base">
                  Claim your <span className="font-bold text-quantum-gold">${user.referredBy ? NEW_USER_BONUS.withReferral : NEW_USER_BONUS.withoutReferral}</span> welcome bonus
                  {user.referredBy && <span className="text-green-400"> (Referral Bonus Active!)</span>}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  Wagering requirement: {user.referredBy ? NEW_USER_BONUS.wageringMultiplier * NEW_USER_BONUS.withReferral : NEW_USER_BONUS.wageringMultiplier * NEW_USER_BONUS.withoutReferral}x
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (context) {
                  const bonusAmount = user.referredBy ? NEW_USER_BONUS.withReferral : NEW_USER_BONUS.withoutReferral;
                  context.updateBalance(bonusAmount);
                  context.updateProfile({
                    newUserBonusClaimed: true,
                    isNewUser: false
                  });
                }
              }}
              className="px-6 md:px-8 py-3 md:py-4 bg-quantum-gold text-black font-black text-lg md:text-xl uppercase rounded-xl hover:scale-105 transition-all shadow-gold-glow"
            >
              Claim Bonus
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">trophy</span> Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map(a => (
              <div key={a.title} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`size-12 rounded-xl bg-white/5 flex items-center justify-center ${a.color} border border-white/10 group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined">{a.icon}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${a.color} bg-white/5`}>{a.rarity}</span>
                </div>
                <h4 className="font-bold mb-1">{a.title}</h4>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <span className="material-symbols-outlined text-plasma">hub</span> Referral Empire
            </h3>
            {isPremium && (
              <span className="px-3 py-1 bg-quantum-gold/20 border border-quantum-gold text-quantum-gold text-xs font-bold uppercase rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                Premium Benefits
              </span>
            )}
          </div>
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col gap-6 md:gap-8">
            {/* Premium Badge Overlay */}
            {isPremium && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-quantum-gold/20 border border-quantum-gold/50 text-quantum-gold text-[10px] font-bold uppercase rounded-full">
                {referralMultiplier * 100}% Commission
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Earnings</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">${referralEarnings.toFixed(2)}</p>
                {isPremium && (
                  <p className="text-[10px] text-quantum-gold mt-1">+{premiumBonus.wageringBonus * 100}% per wager</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Referrals</p>
                <p className="text-2xl md:text-3xl font-bold">{referralCount}</p>
                <p className="text-[10px] text-green-400 mt-1">{activeReferrals} active</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Commission Rate</p>
                <p className="text-2xl md:text-3xl font-bold text-plasma">{Math.round(referralMultiplier * 100)}%</p>
                {isPremium && (
                  <p className="text-[10px] text-quantum-gold mt-1">Premium Tier</p>
                )}
              </div>
            </div>

            {/* Premium Benefits Display */}
            {isPremium && (
              <div className="bg-gradient-to-r from-quantum-gold/10 to-yellow-500/5 border border-quantum-gold/30 rounded-xl p-4 md:p-6">
                <h4 className="text-sm font-bold text-quantum-gold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">workspace_premium</span>
                  Premium Referral Benefits
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-quantum-gold text-base">check_circle</span>
                    <span>${premiumBonus.signupBonus} per signup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-quantum-gold text-base">check_circle</span>
                    <span>{premiumBonus.wageringBonus * 100}% wagering bonus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-quantum-gold text-base">check_circle</span>
                    <span>Monthly bonuses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-quantum-gold text-base">check_circle</span>
                    <span>Exclusive rewards</span>
                  </div>
                </div>
              </div>
            )}

            {/* Referral Promotional Image */}
            <div className="bgblack/40 border border-quantum-gold/30 rounded-2xl overflow-hidden">
              <img
                src="/referral-bonus-share.png"
                alt="Refer a Friend - Earn Together"
                className="w-full h-auto"
              />
              <div className="p-4 bg-gradient-to-r from-quantum-gold/20 to-purple-500/20 border-t border-quantum-gold/30">
                <p className="text-sm text-white/80 text-center font-bold mb-3">
                  Share your referral code on social media!
                </p>
                <div className="flex justify-center gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=Join%20me%20on%20Meridian%20Casino%20Clash%20and%20get%20%2425%20bonus!%20Use%20my%20code%3A%20${referralCode}%0A${encodeURIComponent(referralUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    Tweet
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#4267B2] hover:bg-[#365899] text-white font-bold rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Share
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?text=Join%20me%20on%20Meridian%20Casino%20Clash%20and%20get%20%2425%20bonus!%20Use%20code%3A%20${referralCode}%20${referralUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=Join%20me%20on%20Meridian%20Casino%20Clash%20and%20get%20%2425%20bonus!%20Use%20code%3A%20${referralCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    Telegram
                  </a>
                </div>
              </div>
            </div>

            {/* Referral Link */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
              <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">link</span>
                Your Referral Link
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl font-mono text-sm md:text-base text-gray-300 truncate flex items-center">
                  {referralUrl}
                </div>
                <button
                  onClick={handleCopyReferral}
                  className="bg-primary text-black font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <span className="material-symbols-outlined">check</span>
                      Copied!
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">content_copy</span>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-500">
                Share this link with friends. You earn {Math.round(referralMultiplier * 100)}% of their wagering{isPremium && ' + premium bonuses'}!
              </p>
            </div>

            {/* Referral Code Display */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase">Your Referral Code</label>
              <div className="flex items-center gap-3">
                <code className="flex-1 font-mono text-lg md:text-xl font-bold text-quantum-gold bg-black/60 px-4 py-2 rounded-lg border border-quantum-gold/30">
                  {referralCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;