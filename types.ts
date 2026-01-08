
export type GameMode = 'Plinko' | 'Roulette' | 'Dice' | 'Blackjack' | 'Limbo' | 'Lobby' | 'Profile' | 'Rewards' | 'Support';

export interface User {
  id?: string;
  username: string;
  balance: number;
  avatar: string;
  tier: string;
  wagered: number;
  winRate: number;
  referralCode?: string;
  referredBy?: string;
  referralEarnings?: number;
  referralCount?: number;
  activeReferrals?: number;
  address?: string;
  real_balance: number;
  bonus_balance: number;
  bonus_winnings?: number;
  is_bonus_converted?: boolean;
  valid_referral_count: number;
  is_first_deposit: boolean;
  total_deposited?: number;
  isNewUser?: boolean;
  newUserBonusClaimed?: boolean;
  joinedDate?: number;
  isAdmin?: boolean;
  walletType?: string | null;
}

export interface ReferralStats {
  totalEarnings: number;
  totalReferrals: number;
  activeReferrals: number;
  pendingEarnings: number;
  tierMultiplier: number;
}

export interface GameHistoryItem {
  id: string;
  game: string;
  multiplier: number;
  payout: number;
  timestamp: number;
  username: string;
}
