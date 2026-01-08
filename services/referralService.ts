// Referral Service - Handles referral code generation and validation

export const generateReferralCode = (username: string): string => {
  // Generate unique referral code based on username
  const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanUsername}${randomSuffix}`;
};

export const validateReferralCode = (code: string): boolean => {
  // Validate referral code format (alphanumeric, 6-20 characters)
  return /^[A-Z0-9]{6,20}$/.test(code.toUpperCase());
};

// Premium tier referral multipliers
export const getReferralMultiplier = (tier: string): number => {
  const tierMap: Record<string, number> = {
    'Bronze': 0.05,      // 5% commission
    'Silver': 0.07,      // 7% commission
    'Gold': 0.10,        // 10% commission
    'Platinum': 0.12,    // 12% commission
    'VIP Platinum': 0.15, // 15% commission (premium)
    'Diamond': 0.20,     // 20% commission (premium)
    'Elite': 0.25,       // 25% commission (premium)
  };
  return tierMap[tier] || 0.05;
};

// Calculate referral earnings based on referred user's wagering
export const calculateReferralEarnings = (
  wageredAmount: number,
  referrerTier: string
): number => {
  const multiplier = getReferralMultiplier(referrerTier);
  return wageredAmount * multiplier;
};

// Premium referral bonuses
export const getPremiumReferralBonus = (tier: string): {
  signupBonus: number;
  wageringBonus: number;
  monthlyBonus: boolean;
  exclusiveRewards: boolean;
} => {
  const isPremium = ['VIP Platinum', 'Diamond', 'Elite'].includes(tier);

  return {
    signupBonus: isPremium ? 50 : 10, // Premium users get $50, others $10 per referral
    wageringBonus: isPremium ? 0.15 : 0.05, // Premium users get 15%, others 5%
    monthlyBonus: isPremium, // Premium users get monthly bonus
    exclusiveRewards: isPremium, // Premium users get exclusive rewards
  };
};

// New user bonus amounts
export const NEW_USER_BONUS = {
  withoutReferral: 10,      // $10 welcome bonus
  withReferral: 25,         // $25 welcome bonus with referral
  minimumWager: 50,         // Minimum wagering requirement
  wageringMultiplier: 1.5,  // 1.5x wagering requirement
  minDepositForReward: 20,  // $20 min deposit for referral trigger
};

