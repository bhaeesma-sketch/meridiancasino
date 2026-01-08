
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { GameMode, User, GameHistoryItem } from './types';
import { generateReferralCode, NEW_USER_BONUS } from './services/referralService';
import { supabase } from './services/supabase';
import Lobby from './screens/Lobby';
import Plinko from './screens/Plinko';
import Roulette from './screens/Roulette';
import Dice from './screens/Dice';
import Blackjack from './screens/Blackjack';
import Limbo from './screens/Limbo';
import Profile from './screens/Profile';
import Rewards from './screens/Rewards';
import Support from './screens/Support';
import Auth from './screens/Auth';
import Admin from './screens/Admin';
import Withdraw from './screens/Withdraw';
import Deposit from './screens/Deposit';
import TermsOfService from './screens/TermsOfService';
import PrivacyPolicy from './screens/PrivacyPolicy';
import ResponsibleGaming from './screens/ResponsibleGaming';
import FAQ from './screens/FAQ';
import GameRules from './screens/GameRules';
import { ProtectedRoute } from './components/ProtectedRoute';
import SettingsModal from './components/SettingsModal';
import { sounds } from './services/soundService';
import { Navbar } from './components/Navbar';
import { HorizontalNav } from './components/HorizontalNav';
import { MobileNav } from './components/MobileNav';
import { RightSidebar } from './components/Sidebar';
import { SecurityProvider } from './contexts/SecurityContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export interface AppContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  updateBalance: (delta: number) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  history: GameHistoryItem[];
  addHistory: (item: GameHistoryItem) => Promise<void>;
  activeMode: GameMode;
  isConnected: boolean;
  setIsConnected: (val: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (val: boolean) => void;
  is3DMode: boolean;
  setIs3DMode: (val: boolean) => void;
  isSyncing: boolean;
  processFirstDeposit: (amount: number) => Promise<void>;
  isBlocked: boolean;
  geoInfo: { country: string; ip: string } | null;
}

export const AppContext = createContext<AppContextType | null>(null);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [geoInfo, setGeoInfo] = useState<{ country: string; ip: string } | null>(null);

  const [isConnected, setIsConnected] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('wallet_address');
    }
    return false;
  });

  // Regulatory Geo-Blocking Check
  useEffect(() => {
    const runGeoCheck = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-geo');
        if (data && !error) {
          setGeoInfo({ country: data.country, ip: data.ip });
          if (data.restricted) {
            setIsBlocked(true);
          }
        }
      } catch (err) {
        console.warn("Geo-check failed (likely CORS), defaulting to allowed for demo/dev:", err);
        // In a real production strictly regulated app, we might default to blocked.
        // But for development/testing, we allow if checking fails.
      }
    };
    runGeoCheck();
  }, []);

  // Initialize user from localStorage or default
  const initializeUser = (): User => {
    if (typeof window === 'undefined') {
      return getDefaultUser();
    }

    const walletAddress = localStorage.getItem('wallet_address');
    if (walletAddress) {
      const userData = localStorage.getItem(`user_${walletAddress}`);
      if (userData) {
        const parsed = JSON.parse(userData);
        return {
          username: walletAddress.slice(0, 8) + '...' + walletAddress.slice(-4),
          balance: 0,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(walletAddress)}&background=FFD700&color=000&size=128`,
          tier: "Bronze",
          wagered: 0,
          winRate: 0,
          referralCode: parsed.referralCode || generateReferralCode(walletAddress),
          referredBy: parsed.referredBy,
          referralEarnings: 0,
          referralCount: 0,
          activeReferrals: 0,
          real_balance: parsed.real_balance || 0,
          bonus_balance: parsed.bonus_balance || 0,
          valid_referral_count: parsed.valid_referral_count || 0,
          is_first_deposit: parsed.is_first_deposit || false,
          address: walletAddress,
          walletType: parsed.walletType || null
        };
      }
    }

    return getDefaultUser();
  };

  const getDefaultUser = (): User => ({
    username: "Awaiting Auth...",
    balance: 0,
    avatar: "https://ui-avatars.com/api/?name=User&background=FFD700&color=000&size=128",
    tier: "Bronze",
    wagered: 0,
    winRate: 0,
    referralCode: "",
    referralEarnings: 0,
    referralCount: 0,
    activeReferrals: 0,
    real_balance: 0,
    bonus_balance: 0,
    valid_referral_count: 0,
    is_first_deposit: false,
    walletType: null
  });

  const [user, setUser] = useState<User>(initializeUser());

  // Load user data when wallet is connected
  useEffect(() => {
    const fetchUser = async () => {
      if (isConnected && typeof window !== 'undefined') {
        const walletAddress = localStorage.getItem('wallet_address');
        if (walletAddress) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('wallet_address', walletAddress)
            .single();

          if (profile && !error) {
            setUser({
              address: profile.wallet_address,
              username: profile.username || (profile.wallet_address.slice(0, 8) + '...' + profile.wallet_address.slice(-4)),
              balance: Number(profile.balance),
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.wallet_address)}&background=FFD700&color=000&size=128`,
              tier: (profile as any).tier || "Bronze",
              wagered: (profile as any).wagered || 0,
              winRate: (profile as any).win_rate || 0,
              referralCode: profile.referral_code,
              referredBy: profile.referred_by,
              referralEarnings: (profile as any).referral_earnings || 0,
              referralCount: (profile as any).referral_count || 0,
              activeReferrals: (profile as any).active_referrals || 0,
              real_balance: Number(profile.real_balance || profile.balance || 0),
              bonus_balance: Number(profile.bonus_balance || 0),
              bonus_winnings: Number(profile.bonus_earnings_total || 0),
              valid_referral_count: profile.valid_referral_count || 0,
              is_first_deposit: profile.is_first_deposit || false,
              isNewUser: profile.is_new_user,
              newUserBonusClaimed: profile.bonus_claimed,
              joinedDate: new Date(profile.joined_date).getTime(),
              isAdmin: profile.is_admin
            });
          }
        }
      }
    };

    fetchUser();

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('game_history')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (data && !error) {
        setHistory(data.map(item => ({
          id: item.id.toString(),
          game: item.game_name,
          multiplier: Number(item.multiplier),
          payout: Number(item.payout),
          timestamp: new Date(item.timestamp).getTime(),
          username: item.username || 'Anonymous'
        })));
      }
    };

    fetchHistory();

    // TrustEngine: Periodic injection of referral successes
    const trustInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        const usernames = ["Quantum_Nova", "Cyber_Whale", "Matrix_Runner", "Neon_Glitch", "Alpha_Node", "Delta_Protocol", "Void_Walker", "Signal_Ghost", "Admin_01", "User_4821", "User_9022", "Bit_Satoshi", "Link_Master"];
        const rewards = [
          { game: 'referral', payout: 10 },
          { game: 'referral_bonus', payout: 25 }
        ];

        const randomUser = usernames[Math.floor(Math.random() * usernames.length)];
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

        setHistory(prev => [{
          id: `trust-${Date.now()}`,
          game: randomReward.game,
          multiplier: 1,
          payout: randomReward.payout,
          timestamp: Date.now(),
          username: randomUser
        }, ...prev].slice(0, 20));
      }
    }, 15000);

    // Subscriptions
    const historyChannel = supabase.channel('game_history_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_history' }, (payload) => {
        const newItem = payload.new;
        setHistory(prev => [{
          id: newItem.id.toString(),
          game: newItem.game_name,
          multiplier: Number(newItem.multiplier),
          payout: Number(newItem.payout),
          timestamp: new Date(newItem.timestamp).getTime(),
          username: newItem.username || 'Anonymous'
        }, ...prev].slice(0, 20));
      }).subscribe();

    let profileChannel: any;
    const walletAddress = localStorage.getItem('wallet_address');
    if (walletAddress) {
      profileChannel = supabase.channel(`profile_${walletAddress}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `wallet_address=eq.${walletAddress}` }, (payload) => {
          const updatedProfile = payload.new;
          setUser(prev => ({
            ...prev,
            balance: Number(updatedProfile.real_balance || updatedProfile.balance || 0),
            real_balance: Number(updatedProfile.real_balance || 0),
            bonus_balance: Number(updatedProfile.bonus_balance || 0),
            valid_referral_count: updatedProfile.valid_referral_count || 0,
            isAdmin: updatedProfile.is_admin === true
          }));
        }).subscribe();
    }

    return () => {
      clearInterval(trustInterval);
      supabase.removeChannel(historyChannel);
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, [isConnected]);

  const updateBalance = async (delta: number) => {
    if (!user.address) return;

    const newBalance = user.real_balance + delta;

    // Update local state and Supabase - defaults to real_balance for games
    setUser(prev => ({ ...prev, balance: newBalance, real_balance: newBalance }));

    // Supabase update
    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance, real_balance: newBalance })
      .eq('wallet_address', user.address);

    if (error) {
      console.error('Error updating balance in Supabase:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user.address) return;

    // Optimistic update
    setUser(prev => ({ ...prev, ...updates }));

    // Map User fields to Supabase profile fields
    const supabaseUpdates: any = {};
    if (updates.username) supabaseUpdates.username = updates.username;
    if (updates.balance !== undefined) {
      supabaseUpdates.balance = updates.balance;
      supabaseUpdates.real_balance = updates.balance;
    }
    if (updates.real_balance !== undefined) supabaseUpdates.real_balance = updates.real_balance;
    if (updates.bonus_balance !== undefined) supabaseUpdates.bonus_balance = updates.bonus_balance;
    if (updates.valid_referral_count !== undefined) supabaseUpdates.valid_referral_count = updates.valid_referral_count;
    if (updates.is_first_deposit !== undefined) supabaseUpdates.is_first_deposit = updates.is_first_deposit;

    const { error } = await supabase
      .from('profiles')
      .update(supabaseUpdates)
      .eq('wallet_address', user.address);

    if (error) {
      console.error('Error updating profile in Supabase:', error);
    }
  };

  // Phase 2 & 3: Deposit and Referral Reward Logic
  const processFirstDeposit = async (amount: number) => {
    if (!user.address || user.is_first_deposit) return;

    const minAmount = NEW_USER_BONUS.minDepositForReward;
    if (amount < minAmount) {
      console.log(`Deposit status: ${amount} < ${minAmount}. No referral reward triggered.`);
      // Still mark as "not first deposit" maybe? No, let's wait for a $20+ one?
      // Actually, if they deposit $10, it's their first, but no bonus for referrer.
      // But they should still get their welcome bonus maybe?
      // Master Prompt: "The 'Refer & Earn' bonus should only be credited if... friend makes a confirmed deposit of at least $20"
      // Welcome Bonus for the user themselves ($10) should probably still happen on first deposit regardless?
      // Let's stick to the prompt: only the "Refer & Earn" bonus (referrer's reward) is gated by $20.
    }

    console.log("Processing first deposit rewards...");
    sounds.playWin();
    const welcomeBonus = user.referredBy ? NEW_USER_BONUS.withReferral : NEW_USER_BONUS.withoutReferral;

    const updates: Partial<User> = {
      is_first_deposit: true,
      bonus_balance: user.bonus_balance + welcomeBonus
    };

    await updateProfile(updates);

    // Phase 3: Check for Referrer reward ($20 required)
    if (user.referredBy && amount >= minAmount) {
      await handleReferralReward(user.referredBy);
    }
  };

  const handleReferralReward = async (referrerCode: string) => {
    // 1. Find the referrer by code
    const { data: referrer, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('referral_code', referrerCode)
      .single();

    if (error || !referrer) {
      console.error("Referrer not found");
      return;
    }

    const newCount = (referrer.valid_referral_count || 0) + 1;

    if (newCount >= 5) {
      // Reward referrer with $10 real balance and reset count
      await supabase
        .from('profiles')
        .update({
          real_balance: Number(referrer.real_balance || 0) + 10,
          valid_referral_count: 0
        })
        .eq('id', referrer.id);

      console.log(`Referrer ${referrer.username} rewarded $10!`);
    } else {
      // Just increment the count
      await supabase
        .from('profiles')
        .update({ valid_referral_count: newCount })
        .eq('id', referrer.id);
    }
  };

  const [history, setHistory] = useState<GameHistoryItem[]>([
    { id: '1', game: 'Dice', multiplier: 2.0, payout: 0.05, timestamp: Date.now(), username: 'Urban Gambler' },
    { id: '2', game: 'Roulette', multiplier: 36, payout: 1.8, timestamp: Date.now() - 10000, username: 'Neon Player' },
    { id: '3', game: 'Plinko', multiplier: 1.5, payout: 0.1, timestamp: Date.now() - 20000, username: 'Chip Master' }
  ]);

  const [activeMode, setActiveMode] = useState<GameMode>('Lobby');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Handle Mode Toggle with Glitch Effect
  const toggleMode = (val: boolean) => {
    setIsSyncing(true);
    setTimeout(() => {
      setIs3DMode(val);
      setTimeout(() => setIsSyncing(false), 400);
    }, 400);
  };

  const addHistory = async (item: GameHistoryItem) => {
    setHistory(prev => [item, ...prev].slice(0, 20));

    // Save to Supabase if wallet is connected
    if (isConnected && user.address) {
      // Find the profile UUID for the foreign key
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', user.address)
        .single();

      if (profile) {
        await supabase.from('game_history').insert({
          user_id: profile.id,
          game_name: item.game,
          multiplier: item.multiplier,
          payout: item.payout,
          username: item.username,
          timestamp: new Date(item.timestamp).toISOString()
        });
      }
    }
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      updateBalance,
      updateProfile,
      history, addHistory,
      activeMode,
      isConnected, setIsConnected,
      isSettingsOpen, setIsSettingsOpen,
      is3DMode, setIs3DMode: toggleMode,
      isSyncing,
      processFirstDeposit,
      isBlocked,
      geoInfo
    }}>
      {children}
    </AppContext.Provider>
  );
};



const GlobalTicker = () => {
  const context = useContext(AppContext);
  if (!context || !context.isConnected) return null;
  const { history } = context;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-black/80 backdrop-blur-md border-t border-white/10 z-40 flex items-center overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="ticker-content flex items-center gap-12 px-6">
        {[...history, ...history].map((item, idx) => {
          const isReferral = item.game === 'referral' || item.game === 'referral_bonus';
          return (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-2 whitespace-nowrap">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isReferral ? 'text-neon-pink' : (item.multiplier > 10 ? 'text-quantum-gold' : 'text-plasma-purple')
                }`}>
                {isReferral ? 'AFFILIATE REWARD:' : (item.multiplier > 10 ? 'HUGE WIN:' : 'RECENT:')}
              </span>
              <span className="text-xs text-white font-bold">{item.username}</span>
              <span className="text-xs font-mono font-bold text-green-400">
                +${isReferral ? item.payout.toFixed(2) : (item.payout * 45000).toFixed(2)} USD
              </span>
              <span className={`text-[10px] ${isReferral ? 'text-neon-pink/50' : 'text-white/30'} truncate max-w-[100px]`}>
                via {
                  item.game === 'referral' ? 'Node Bonus' :
                    item.game === 'referral_bonus' ? 'Sign-up Reward' :
                      item.game === 'dice' ? 'Market Trends' :
                        item.game === 'roulette' ? 'User Activity' :
                          item.game === 'blackjack' ? 'Network Traffic' :
                            item.game === 'plinko' ? 'System Logs' :
                              item.game === 'limbo' ? 'Uplink Velocity' : item.game
                }
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AppContent = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { isBlocked, geoInfo } = context;

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-luxury-midnight text-white font-display overflow-hidden relative selection:bg-metal-rose selection:text-luxury-midnight">
        {/* ... existing code ... */}
        {isBlocked && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6 text-center animate-in fade-in duration-700">
            <div className="max-w-md space-y-8">
              <div className="w-24 h-24 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <span className="material-symbols-outlined text-5xl text-red-500">block</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                  Access <span className="text-red-500">Denied</span>
                </h1>
                <p className="text-white/60 text-sm leading-relaxed">
                  Our systems have detected that you are accessing this platform from a <span className="text-white font-bold uppercase tracking-widest">{geoInfo?.country || 'RESTRICTED'}</span> territory.
                </p>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl font-mono text-[10px] text-white/40 uppercase tracking-widest">
                  Restricted Region Compliance Protocol v4.0 <br />
                  Log ID: {Date.now().toString(36).toUpperCase()} <br />
                  IP: {geoInfo?.ip || 'Detection Active'}
                </div>
              </div>
              <p className="text-white/30 text-[10px] uppercase font-bold tracking-[0.2em] pt-8">
                Due to regulatory requirements under our Anjouan license, we cannot provide service in your current jurisdiction.
              </p>
            </div>
          </div>
        )}
        <div className={`sync-overlay ${context.isSyncing ? 'sync-active' : ''}`}>
          <div className="sync-text">SYNCHRONIZING QUANTUM GEOMETRY...</div>
          <div className="w-48 h-1 bg-quantum-gold/20 mt-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-quantum-gold animate-scanline"></div>
          </div>
        </div>

        <div className="fixed inset-0 z-[-1] full-bleed-background transform scale-105 opacity-30"></div>
        <Navbar />
        <MobileNav />
        <SettingsModal />

        {/* Main Layout Container with Top Padding for Fixed Navbar */}
        <div className="flex-1 flex flex-col pt-16 md:pt-20 overflow-hidden">
          {/* Horizontal Navigation */}
          <HorizontalNav />

          <div className="flex-grow flex items-stretch px-4 md:px-6 lg:px-10 py-4 overflow-hidden gap-4 lg:gap-6">
            {/* Dynamic Game/Content Stage (Full Width) */}
            <main className={`flex-1 flex flex-col ${['/plinko', '/roulette', '/dice', '/blackjack', '/limbo'].includes(location.pathname) ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'} relative bg-black/20 rounded-[2rem] border border-white/5 backdrop-blur-sm stage-container ${context.is3DMode ? 'stage-3d' : ''}`}>
              <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
                <Route path="/plinko" element={<ProtectedRoute requireBalance={true}><Plinko /></ProtectedRoute>} />
                <Route path="/roulette" element={<ProtectedRoute requireBalance={true}><Roulette /></ProtectedRoute>} />
                <Route path="/dice" element={<ProtectedRoute requireBalance={true}><Dice /></ProtectedRoute>} />
                <Route path="/blackjack" element={<ProtectedRoute requireBalance={true}><Blackjack /></ProtectedRoute>} />
                <Route path="/limbo" element={<ProtectedRoute requireBalance={true}><Limbo /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
                <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
                <Route path={`/${import.meta.env.VITE_ADMIN_SECRET_PATH || 'admin'}`} element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/rules" element={<GameRules />} />
                <Route path="*" element={<Navigate to="/lobby" replace />} />
              </Routes>
            </main>

            {/* Live Metrics/Action (Right) - Optional */}
            <RightSidebar />
          </div>

        </div>

        <GlobalTicker />
      </div>
    </ErrorBoundary>
  );
};

const App = () => (
  <HashRouter>
    <AppProvider>
      <SecurityProvider>
        <AppContent />
      </SecurityProvider>
    </AppProvider>
  </HashRouter>
);

export default App;
