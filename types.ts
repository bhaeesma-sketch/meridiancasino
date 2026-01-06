
export type GameMode = 'Plinko' | 'Roulette' | 'Dice' | 'Blackjack' | 'Limbo' | 'Lobby' | 'Profile' | 'Rewards' | 'Support';

export interface User {
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
  isNewUser?: boolean;
  newUserBonusClaimed?: boolean;
  joinedDate?: number;
  isAdmin?: boolean;
  address?: string;
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
  username?: string;
}
