
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { GameMode, User, GameHistoryItem } from './types';
import { generateReferralCode } from './services/referralService';
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
import TermsOfService from './screens/TermsOfService';
import PrivacyPolicy from './screens/PrivacyPolicy';
import ResponsibleGaming from './screens/ResponsibleGaming';
import FAQ from './screens/FAQ';
import { ProtectedRoute } from './components/ProtectedRoute';
import SettingsModal from './components/SettingsModal';

interface AppContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  history: GameHistoryItem[];
  addHistory: (item: GameHistoryItem) => void;
  activeMode: GameMode;
  isConnected: boolean;
  setIsConnected: (val: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (val: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

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
          isNewUser: parsed.isNewUser !== false,
          newUserBonusClaimed: parsed.newUserBonusClaimed || false,
          joinedDate: parsed.joinedDate || Date.now()
        };
      }
    }

    return getDefaultUser();
  };

  const getDefaultUser = (): User => ({
    username: "Guest",
    balance: 10000,
    avatar: "https://ui-avatars.com/api/?name=Guest&background=FFD700&color=000&size=128",
    tier: "Bronze",
    wagered: 0,
    winRate: 0,
    referralCode: "",
    referralEarnings: 0,
    referralCount: 0,
    activeReferrals: 0,
    isNewUser: true,
    newUserBonusClaimed: false,
    joinedDate: Date.now()
  });

  const [user, setUser] = useState<User>(initializeUser());

  // Load user data when wallet is connected
  useEffect(() => {
    if (isConnected && typeof window !== 'undefined') {
      const walletAddress = localStorage.getItem('wallet_address');
      if (walletAddress) {
        const userData = localStorage.getItem(`user_${walletAddress}`);
        if (userData) {
          const parsed = JSON.parse(userData);
          setUser(prev => ({
            ...prev,
            referralCode: parsed.referralCode || prev.referralCode,
            referredBy: parsed.referredBy,
            isNewUser: parsed.isNewUser !== false,
            newUserBonusClaimed: parsed.newUserBonusClaimed || false,
            joinedDate: parsed.joinedDate || Date.now()
          }));
        }
      }
    }
  }, [isConnected]);

  const [history, setHistory] = useState<GameHistoryItem[]>([
    { id: '1', game: 'Dice', multiplier: 2.0, payout: 0.05, timestamp: Date.now(), username: 'Urban Gambler' },
    { id: '2', game: 'Roulette', multiplier: 36, payout: 1.8, timestamp: Date.now() - 10000, username: 'Neon Player' },
    { id: '3', game: 'Plinko', multiplier: 1.5, payout: 0.1, timestamp: Date.now() - 20000, username: 'Chip Master' }
  ]);

  const [activeMode, setActiveMode] = useState<GameMode>('Lobby');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const addHistory = (item: GameHistoryItem) => {
    setHistory(prev => [item, ...prev].slice(0, 20));
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      history, addHistory,
      activeMode,
      isConnected, setIsConnected,
      isSettingsOpen, setIsSettingsOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

import { LeftSidebar, RightSidebar } from './components/Sidebar';

const Navbar = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  if (!context || !context.isConnected) return null;
  const { user } = context;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 px-4 md:px-6 lg:px-10 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent backdrop-blur-[4px]">
      <div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={() => navigate('/lobby')}>
        <div className="size-8 md:size-10 bg-glass-bg border border-quantum-gold/30 rounded-lg md:rounded-xl flex items-center justify-center text-quantum-gold shadow-gold-glow backdrop-blur-md">
          <span className="material-symbols-outlined text-xl md:text-2xl">casino</span>
        </div>
        <h1 className="text-white text-lg md:text-2xl lg:text-3xl font-heading font-extrabold tracking-tighter uppercase">
          Casino <span className="text-quantum-gold">Clash</span>
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex flex-col items-end px-3 md:px-4 py-1 md:py-1.5 rounded-lg bg-black/40 border border-white/5">
          <div className="flex items-center gap-1.5 md:gap-2 text-quantum-gold">
            <span className="material-symbols-outlined text-xs md:text-sm">account_balance_wallet</span>
            <span className="font-mono text-xs md:text-sm font-bold">${user.balance.toLocaleString()}</span>
          </div>
        </div>
        <div
          onClick={() => navigate('/profile')}
          className="size-8 md:size-10 rounded-lg bg-cover bg-center border border-white/20 cursor-pointer hover:ring-2 ring-quantum-gold/50 transition-all shadow-holo-glow"
          style={{ backgroundImage: `url(${user.avatar})` }}
        />
      </div>
    </header>
  );
};

const GlobalTicker = () => {
  const context = useContext(AppContext);
  if (!context || !context.isConnected) return null;
  const { history } = context;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-black/80 backdrop-blur-md border-t border-white/10 z-40 flex items-center overflow-hidden">
      <div className="ticker-content flex items-center gap-12 px-6">
        {[...history, ...history].map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center gap-2 whitespace-nowrap">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${idx % 2 === 0 ? 'text-quantum-gold' : 'text-plasma-purple'}`}>
              {item.multiplier > 10 ? 'HUGE WIN:' : 'RECENT:'}
            </span>
            <span className="text-xs text-white font-bold">{item.username}</span>
            <span className="text-xs font-mono font-bold text-green-400">+{item.payout.toFixed(3)} BTC</span>
            <span className="text-[10px] text-white/30">via {item.game}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AppContent = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  return (
    <div className="h-screen flex flex-col bg-space-black text-white font-display overflow-hidden relative selection:bg-quantum-gold selection:text-black">
      <div className="fixed inset-0 z-[-1] full-bleed-background transform scale-105 opacity-30"></div>
      <Navbar />
      <SettingsModal />

      <div className="flex-grow flex items-stretch px-4 md:px-6 lg:px-10 pt-20 pb-12 overflow-hidden gap-4 lg:gap-8 h-[calc(100vh-theme(spacing.20)-theme(spacing.10))]">
        {/* Unified Navigation (Left) */}
        <LeftSidebar />

        {/* Dynamic Game/Content Stage (Center) */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-black/20 rounded-[2rem] border border-white/5 backdrop-blur-sm">
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
            <Route path="/plinko" element={<ProtectedRoute><Plinko /></ProtectedRoute>} />
            <Route path="/roulette" element={<ProtectedRoute><Roulette /></ProtectedRoute>} />
            <Route path="/dice" element={<ProtectedRoute><Dice /></ProtectedRoute>} />
            <Route path="/blackjack" element={<ProtectedRoute><Blackjack /></ProtectedRoute>} />
            <Route path="/limbo" element={<ProtectedRoute><Limbo /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<Navigate to="/lobby" replace />} />
          </Routes>
        </main>

        {/* Live Metrics/Action (Right) */}
        <RightSidebar />
      </div>

      <GlobalTicker />
    </div>
  );
};

const App = () => (
  <HashRouter>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </HashRouter>
);

export default App;
