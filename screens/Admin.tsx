import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { supabase } from '../services/supabase';
import { logAdminAction, AdminActions } from '../services/auditLog';

interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  walletAddress: string;
  amount: number;
  token: string;
  chain: string;
  destinationAddress: string;
  status: 'pending_approval' | 'pending_auto' | 'approved' | 'rejected' | 'completed';
  riskLevel: 'low' | 'medium' | 'high';
  requestedAt: Date;
  completedAt?: Date;
  autoApproveAt?: Date;
}

interface User {
  id: string;
  username: string;
  walletAddress: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalWagered: number;
  totalWon: number;
  status: 'active' | 'suspended' | 'frozen';
  kycStatus: 'pending' | 'level1' | 'level2';
  referralCode?: string;
  referredBy?: string;
  createdAt: Date;
  lastLogin: Date;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  hotWalletBalance: number;
  systemBalance: number;
  totalWagered: number;
  totalPaidOut: number;
  houseEdge: number;
  averageBet: number;
  topGame: string;
}

interface GameStats {
  game: string;
  totalPlays: number;
  totalWagered: number;
  totalWon: number;
  netRevenue: number;
  rtp: number;
  averageBet: number;
  biggestWin: number;
}

interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus';
  amount: number;
  token: string;
  status: string;
  timestamp: Date;
  details?: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'transactions' | 'withdrawals' | 'games' | 'referrals' | 'reports' | 'settings' | 'logs'>('dashboard');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    hotWalletBalance: 0,
    systemBalance: 0,
    totalWagered: 0,
    totalPaidOut: 0,
    houseEdge: 0,
    averageBet: 0,
    topGame: 'N/A'
  });
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch users (profiles)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profiles && !profilesError) {
        setUsers(profiles.map(p => ({
          id: p.id,
          username: p.username || (p.wallet_address.slice(0, 8) + '...' + p.wallet_address.slice(-4)),
          walletAddress: p.wallet_address,
          balance: Number(p.balance),
          totalDeposited: 0,
          totalWithdrawn: 0,
          totalWagered: 0,
          totalWon: 0,
          status: 'active',
          kycStatus: 'level1',
          referralCode: p.referral_code,
          referredBy: p.referred_by,
          createdAt: new Date(p.created_at),
          lastLogin: new Date(p.joined_date || p.created_at)
        })));
      }

      // 2. Fetch game history
      const { data: history, error: historyError } = await supabase
        .from('game_history')
        .select('*')
        .order('created_at', { ascending: false });

      // 3. Fetch transactions (deposits/withdrawals)
      const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (username, wallet_address)
        `)
        .order('created_at', { ascending: false });

      if (txs && !txError) {
        // Calculate user stats from history for risk analysis
        const userStats = new Map<string, { wagered: number; won: number }>();
        if (history) {
          history.forEach(h => {
            const current = userStats.get(h.user_id) || { wagered: 0, won: 0 };
            current.wagered += Number(h.bet_amount || 0);
            current.won += Number(h.payout || 0);
            userStats.set(h.user_id, current);
          });
        }

        // Filter pending withdrawals
        const pendingWithdrawals = txs
          .filter(t => t.type === 'withdrawal' && t.status === 'pending')
          .map(t => {
            const stats = userStats.get(t.user_id) || { wagered: 0, won: 0 };
            const profitRatio = stats.wagered > 0 ? stats.won / stats.wagered : 0;
            const isSuspicious = profitRatio > 1.5 && stats.wagered > 100;

            return {
              id: t.id,
              userId: t.user_id,
              username: t.profiles?.username || t.wallet_address.slice(0, 8),
              walletAddress: t.wallet_address,
              amount: Number(t.amount),
              token: 'USDT', // Default until multi-token support
              chain: 'TRON',
              destinationAddress: t.wallet_address,
              status: 'pending_approval' as const,
              riskLevel: (Number(t.amount) > 1000 || isSuspicious) ? 'high' : Number(t.amount) > 100 ? 'medium' : 'low',
              requestedAt: new Date(t.created_at)
            };
          });

        setWithdrawals(pendingWithdrawals as any);

        // Map transactions for the table
        const financialTxs = txs.map(t => ({
          id: t.id,
          userId: t.user_id,
          username: t.profiles?.username || t.wallet_address.slice(0, 8),
          type: t.type as 'deposit' | 'withdrawal' | 'bonus',
          amount: Number(t.amount),
          token: 'USDT',
          status: t.status,
          timestamp: new Date(t.created_at)
        }));

        setTransactions(financialTxs as any);

        // 4. Calculate Stats & Cross-Check for Security
        // Game stats
        const games = ['Dice', 'Roulette', 'Blackjack', 'Plinko', 'Limbo'];
        const statsByGame = games.map(gameName => {
          const gameRuns = history ? history.filter(h => h.game_name === gameName) : [];
          const wagered = gameRuns.reduce((sum, h) => sum + Number(h.bet_amount || 0), 0);
          const won = gameRuns.reduce((sum, h) => sum + Number(h.payout || 0), 0);
          return {
            game: gameName,
            totalPlays: gameRuns.length,
            totalWagered: wagered,
            totalWon: won,
            netRevenue: wagered - won,
            rtp: wagered > 0 ? won / wagered : 0,
            averageBet: gameRuns.length > 0 ? wagered / gameRuns.length : 0,
            biggestWin: Math.max(...gameRuns.map(h => Number(h.payout || 0)), 0)
          };
        });
        setGameStats(statsByGame);

        // System Stats
        const totalWagered = statsByGame.reduce((sum, g) => sum + g.totalWagered, 0);
        const totalWon = statsByGame.reduce((sum, g) => sum + g.totalWon, 0);

        const deposits = txs.filter(t => t.type === 'deposit').reduce((sum, t) => sum + Number(t.amount), 0);
        const completedWithdrawals = txs.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((sum, t) => sum + Number(t.amount), 0);

        setStats({
          totalUsers: profiles?.length || 0,
          activeUsers: users.length,
          totalDeposits: deposits,
          totalWithdrawals: completedWithdrawals,
          pendingWithdrawals: pendingWithdrawals.length,
          hotWalletBalance: 0, // Mock for now
          systemBalance: deposits - completedWithdrawals,
          totalWagered: totalWagered,
          totalPaidOut: totalWon,
          houseEdge: totalWagered > 0 ? ((totalWagered - totalWon) / totalWagered) * 100 : 0,
          averageBet: totalWagered > 0 && history && history.length > 0 ? totalWagered / history.length : 0,
          topGame: statsByGame.sort((a, b) => b.totalPlays - a.totalPlays)[0]?.game || 'N/A'
        });
      }
    };

    fetchData();
  }, [context?.user?.address]); // Refresh when user changes

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    setIsApproving(true);

    try {
      // 1. Log action
      await logAdminAction(AdminActions.APPROVE_WITHDRAWAL, { withdrawalId });

      // 2. Update status in DB
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', withdrawalId);

      if (error) throw error;

      // 3. Update UI
      setWithdrawals(prev => prev.filter(w => w.id !== withdrawalId));

      // 4. Update stats state safely
      setStats(prev => ({
        ...prev,
        pendingWithdrawals: Math.max(0, prev.pendingWithdrawals - 1),
        totalWithdrawals: prev.totalWithdrawals + (withdrawals.find(w => w.id === withdrawalId)?.amount || 0)
      }));

    } catch (err) {
      console.error('Error approving withdrawal:', err);
      alert('Failed to approve withdrawal. Check console.');
    } finally {
      setIsApproving(false);
      setSelectedWithdrawal(null);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string, reason: string) => {
    try {
      // 1. Log action
      await logAdminAction(AdminActions.REJECT_WITHDRAWAL, { withdrawalId, reason });

      const tx = withdrawals.find(w => w.id === withdrawalId);
      if (!tx) return;

      // 2. Refund balance using secure RPC
      const { error: refundError } = await supabase.rpc('update_user_balance', {
        p_user_id: tx.userId,
        p_amount: tx.amount,
        p_balance_type: 'real'
      });

      if (refundError) throw refundError;

      // 3. Mark transaction as failed in DB
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', withdrawalId);

      if (updateError) throw updateError;

      // 4. Update UI
      setWithdrawals(prev => prev.filter(w => w.id !== withdrawalId));
      setStats(prev => ({
        ...prev,
        pendingWithdrawals: Math.max(0, prev.pendingWithdrawals - 1)
      }));

    } catch (err) {
      console.error('Error rejecting withdrawal:', err);
      alert('Failed to reject withdrawal. Balance might not have been refunded.');
    } finally {
      setSelectedWithdrawal(null);
    }
  };

  const handleFreezeUser = async (userId: string) => {
    try {
      await logAdminAction(AdminActions.FREEZE_USER, { userId });
      // TODO: Implement backend freeze logic
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, status: 'frozen' as const } : u
      ));
    } catch (err) {
      console.error('Error freezing user:', err);
    }
  };

  // Check if user is admin from context (Single Source of Truth)
  const isAdmin = context?.user?.isAdmin === true;
  const isCheckingAdmin = false; // Context is already loaded if we are here (protected route)

  // Log dashboard access when admin is confirmed
  React.useEffect(() => {
    if (isAdmin) {
      logAdminAction(AdminActions.VIEW_ADMIN_DASHBOARD, {
        timestamp: new Date().toISOString()
      });
    }
  }, [isAdmin]);

  if (isCheckingAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quantum-gold mx-auto mb-4"></div>
          <p className="text-white/70">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-white/70">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatNumber = (num: number) => num.toLocaleString('en-US');

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto w-full overflow-hidden">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Admin Dashboard</h1>
            <p className="text-white/60 text-sm mt-1">Complete platform management and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={() => navigate('/lobby')}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm hover:bg-white/10 transition-all"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'users', label: 'Users', icon: 'people' },
          { id: 'transactions', label: 'Transactions', icon: 'swap_horiz' },
          { id: 'withdrawals', label: 'Withdrawals', icon: 'account_balance_wallet' },
          { id: 'games', label: 'Game Stats', icon: 'casino' },
          { id: 'referrals', label: 'Referrals', icon: 'hub' },
          { id: 'reports', label: 'Reports', icon: 'assessment' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
          { id: 'logs', label: 'Audit Logs', icon: 'description' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
              ? 'bg-quantum-gold text-black shadow-gold-glow'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            <div className="bg-black/60 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Total Users</p>
              <p className="text-2xl md:text-3xl font-black text-white">{formatNumber(stats.totalUsers)}</p>
              <p className="text-xs text-green-400 mt-1">+{stats.activeUsers} active</p>
            </div>
            <div className="bg-black/60 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Total Deposits</p>
              <p className="text-2xl md:text-3xl font-black text-green-400">{formatCurrency(stats.totalDeposits)}</p>
            </div>
            <div className="bg-black/60 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Total Withdrawals</p>
              <p className="text-2xl md:text-3xl font-black text-red-400">{formatCurrency(stats.totalWithdrawals)}</p>
            </div>
            <div className="bg-black/60 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">System Balance</p>
              <p className="text-2xl md:text-3xl font-black text-quantum-gold">{formatCurrency(stats.systemBalance)}</p>
            </div>
            <div className="bg-black/60 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Hot Wallet</p>
              <p className="text-2xl md:text-3xl font-black text-yellow-400">{formatCurrency(stats.hotWalletBalance)}</p>
            </div>
            <div className="bg-black/60 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Pending Withdrawals</p>
              <p className="text-2xl md:text-3xl font-black text-orange-400">{formatCurrency(stats.pendingWithdrawals)}</p>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-quantum-gold">trending_up</span>
                Revenue Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total Wagered</span>
                  <span className="text-white font-bold">{formatCurrency(stats.totalWagered)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total Paid Out</span>
                  <span className="text-red-400 font-bold">{formatCurrency(stats.totalPaidOut)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                  <span className="text-white font-bold">Net Revenue</span>
                  <span className="text-green-400 font-black text-xl">{formatCurrency(stats.totalWagered - stats.totalPaidOut)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">House Edge</span>
                  <span className="text-quantum-gold font-bold">{stats.houseEdge.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-quantum-gold">analytics</span>
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Average Bet Size</span>
                  <span className="text-white font-bold">{formatCurrency(stats.averageBet)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Top Game</span>
                  <span className="text-white font-bold">{stats.topGame}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Active Users (24h)</span>
                  <span className="text-green-400 font-bold">{stats.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">New Users (24h)</span>
                  <span className="text-blue-400 font-bold">+{Math.floor(stats.totalUsers * 0.02)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Performance Table */}
          <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-quantum-gold">casino</span>
              Game Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Game</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Total Plays</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Wagered</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Won</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Net Revenue</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">RTP</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Avg Bet</th>
                  </tr>
                </thead>
                <tbody>
                  {gameStats.map((game, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white font-bold">{game.game}</td>
                      <td className="py-3 px-4 text-white text-right">{formatNumber(game.totalPlays)}</td>
                      <td className="py-3 px-4 text-white text-right">{formatCurrency(game.totalWagered)}</td>
                      <td className="py-3 px-4 text-red-400 text-right">{formatCurrency(game.totalWon)}</td>
                      <td className="py-3 px-4 text-green-400 text-right font-bold">{formatCurrency(game.netRevenue)}</td>
                      <td className="py-3 px-4 text-quantum-gold text-right font-bold">{(game.rtp * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4 text-white/70 text-right">{formatCurrency(game.averageBet)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-quantum-gold">people</span>
                User Management ({formatNumber(users.length)})
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                />
                <button className="px-4 py-2 bg-quantum-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-all">
                  Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Username</th>
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Wallet</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Balance</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Deposited</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Withdrawn</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Wagered</th>
                    <th className="text-center py-3 px-4 text-white/70 font-bold uppercase text-xs">Status</th>
                    <th className="text-center py-3 px-4 text-white/70 font-bold uppercase text-xs">KYC</th>
                    <th className="text-center py-3 px-4 text-white/70 font-bold uppercase text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white font-bold">{user.username}</td>
                      <td className="py-3 px-4 text-white/70 font-mono text-xs">{user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}</td>
                      <td className="py-3 px-4 text-white text-right font-bold">{formatCurrency(user.balance)}</td>
                      <td className="py-3 px-4 text-green-400 text-right">{formatCurrency(user.totalDeposited)}</td>
                      <td className="py-3 px-4 text-red-400 text-right">{formatCurrency(user.totalWithdrawn)}</td>
                      <td className="py-3 px-4 text-white/70 text-right">{formatCurrency(user.totalWagered)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          user.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.kycStatus === 'level2' ? 'bg-green-500/20 text-green-400' :
                          user.kycStatus === 'level1' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleFreezeUser(user.id)}
                            className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold hover:bg-red-500/30 transition-all"
                          >
                            {user.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                          </button>
                          <button className="px-2 py-1 bg-white/10 text-white rounded text-xs font-bold hover:bg-white/20 transition-all">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-quantum-gold">swap_horiz</span>
                Transaction History
              </h3>
              <div className="flex gap-2">
                <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
                  <option>All Types</option>
                  <option>Deposit</option>
                  <option>Withdrawal</option>
                  <option>Bet</option>
                  <option>Win</option>
                </select>
                <button className="px-4 py-2 bg-quantum-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-all">
                  Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">ID</th>
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">User</th>
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Type</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Amount</th>
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Token</th>
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Status</th>
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white/70 font-mono text-xs">{tx.id}</td>
                      <td className="py-3 px-4 text-white font-bold">{tx.username}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${tx.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                          tx.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' :
                            tx.type === 'bet' ? 'bg-blue-500/20 text-blue-400' :
                              tx.type === 'win' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-purple-500/20 text-purple-400'
                          }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${tx.type === 'deposit' || tx.type === 'win' || tx.type === 'bonus' ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'bonus' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-white/70">{tx.token}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">{tx.status}</span>
                      </td>
                      <td className="py-3 px-4 text-white/70 text-xs">{tx.timestamp.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-quantum-gold">account_balance_wallet</span>
              Withdrawal Requests ({withdrawals.filter(w => w.status === 'pending_approval' || w.status === 'pending_auto').length} pending)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">User</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Amount</th>
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">To Address</th>
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Chain</th>
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Status</th>
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Risk</th>
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Requested</th>
                    <th className="text-center py-3 px-4 text-white/70 font-bold uppercase text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-white font-bold">{w.username}</div>
                          <div className="text-white/50 text-xs font-mono">{w.walletAddress.slice(0, 8)}...{w.walletAddress.slice(-6)}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-red-400 text-right font-bold">{formatCurrency(w.amount)}</td>
                      <td className="py-3 px-4 text-white/70 font-mono text-xs">{w.destinationAddress.slice(0, 12)}...{w.destinationAddress.slice(-8)}</td>
                      <td className="py-3 px-4 text-white/70 uppercase">{w.chain}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${w.status === 'pending_approval' ? 'bg-orange-500/20 text-orange-400' :
                          w.status === 'pending_auto' ? 'bg-blue-500/20 text-blue-400' :
                            w.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              w.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                'bg-gray-500/20 text-gray-400'
                          }`}>
                          {w.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${w.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                          w.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                          {w.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/70 text-xs">{w.requestedAt.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {(w.status === 'pending_approval' || w.status === 'pending_auto') && (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleApproveWithdrawal(w.id)}
                              disabled={isApproving}
                              className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold hover:bg-green-500/30 transition-all disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(w.id, 'Manual rejection')}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold hover:bg-red-500/30 transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Game Stats Tab */}
      {activeTab === 'games' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {gameStats.map((game, idx) => (
              <div key={idx} className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-quantum-gold">casino</span>
                  {game.game}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 text-xs uppercase mb-1">Total Plays</p>
                    <p className="text-white font-black text-xl">{formatNumber(game.totalPlays)}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase mb-1">Total Wagered</p>
                    <p className="text-white font-black text-xl">{formatCurrency(game.totalWagered)}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase mb-1">Total Won</p>
                    <p className="text-red-400 font-black text-xl">{formatCurrency(game.totalWon)}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase mb-1">Net Revenue</p>
                    <p className="text-green-400 font-black text-xl">{formatCurrency(game.netRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase mb-1">RTP</p>
                    <p className="text-quantum-gold font-black text-xl">{(game.rtp * 100).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase mb-1">Average Bet</p>
                    <p className="text-white font-black text-xl">{formatCurrency(game.averageBet)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/50 text-xs uppercase mb-1">Biggest Win</p>
                    <p className="text-yellow-400 font-black text-xl">{formatCurrency(game.biggestWin)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-quantum-gold">hub</span>
              Referral Program Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/50 text-xs uppercase mb-1">Total Referrals</p>
                <p className="text-white font-black text-2xl">{formatNumber(1234)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/50 text-xs uppercase mb-1">Active Referrers</p>
                <p className="text-white font-black text-2xl">{formatNumber(456)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/50 text-xs uppercase mb-1">Total Earnings Paid</p>
                <p className="text-green-400 font-black text-2xl">{formatCurrency(125000)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/50 text-xs uppercase mb-1">Avg Earnings/Ref</p>
                <p className="text-quantum-gold font-black text-2xl">{formatCurrency(101.29)}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/70 font-bold uppercase text-xs">Referrer</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Total Referrals</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Active</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Total Earnings</th>
                    <th className="text-right py-3 px-4 text-white/70 font-bold uppercase text-xs">Commission Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-bold">CryptoKing99</td>
                    <td className="py-3 px-4 text-white text-right">14</td>
                    <td className="py-3 px-4 text-green-400 text-right">8</td>
                    <td className="py-3 px-4 text-green-400 text-right font-bold">{formatCurrency(245.50)}</td>
                    <td className="py-3 px-4 text-quantum-gold text-right">15%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-quantum-gold">assessment</span>
                Financial Reports
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">Daily Revenue Report</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">Weekly Financial Summary</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">Monthly Statement</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">Tax Report</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
              </div>
            </div>

            <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-quantum-gold">bar_chart</span>
                User Reports
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">User Activity Report</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">KYC Status Report</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">VIP Tier Distribution</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">Referral Performance</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
              </div>
            </div>

            <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-quantum-gold">casino</span>
                Game Reports
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">Game Performance Report</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">RTP Analysis</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">Big Win Report</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
              </div>
            </div>

            <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-quantum-gold">security</span>
                Security Reports
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">Fraud Detection Report</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">Suspicious Activity Log</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-between">
                  <span className="text-white font-bold">Failed Login Attempts</span>
                  <span className="material-symbols-outlined text-white/50">download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-quantum-gold">settings</span>
              System Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-white/70 text-sm mb-2">Minimum Withdrawal Amount (USDT)</label>
                <input type="number" defaultValue={15} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                <p className="text-white/50 text-xs mt-1">Current limit: 15 USDT per request (hidden from users)</p>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Daily Withdrawal Limit (USDT)</label>
                <input type="number" defaultValue={45} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Hot Wallet Balance Alert Threshold (USDT)</label>
                <input type="number" defaultValue={10000} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">RTP Rate (%)</label>
                <input type="number" defaultValue={0.01} step="0.01" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
              </div>
              <button className="px-6 py-3 bg-quantum-gold text-black font-black rounded-lg hover:bg-yellow-400 transition-all">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-quantum-gold">description</span>
                Audit Logs
              </h3>
              <div className="flex gap-2">
                <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
                  <option>All Actions</option>
                  <option>Withdrawal Approvals</option>
                  <option>User Management</option>
                  <option>Settings Changes</option>
                </select>
                <button className="px-4 py-2 bg-quantum-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-all">
                  Export Logs
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { action: 'Withdrawal Approved', user: 'Admin', target: 'CryptoKing99', amount: '$5000', time: new Date() },
                { action: 'User Frozen', user: 'Admin', target: 'SuspiciousUser', amount: '', time: new Date(Date.now() - 3600000) },
                { action: 'Settings Changed', user: 'Admin', target: 'RTP Rate', amount: '0.01%', time: new Date(Date.now() - 7200000) }
              ].map((log, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-white font-bold">{log.action}</span>
                      <span className="text-white/50 text-sm">by {log.user}</span>
                      <span className="text-white/50 text-sm">on {log.target}</span>
                      {log.amount && <span className="text-quantum-gold font-bold">{log.amount}</span>}
                    </div>
                  </div>
                  <div className="text-white/50 text-xs">{log.time.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
