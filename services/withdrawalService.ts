// Withdrawal Service - Handles withdrawal requests and validation
// This is the FRONTEND service - Backend performs actual security checks

export interface WithdrawalRequest {
  address: string;
  amount: number;
  token: string;
  chain: string;
  destinationAddress: string; // User's wallet address
}

export interface WithdrawalStatus {
  id: string;
  status: 'pending' | 'pending_auto' | 'pending_manual' | 'approved' | 'rejected' | 'completed' | 'failed';
  amount: number;
  token: string;
  chain: string;
  destinationAddress: string;
  requestedAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  autoApproveAt?: Date;
  riskLevel?: 'low' | 'medium' | 'high';
  txHash?: string;
}

export interface WithdrawalLimits {
  minAmount: number;
  maxAmount: number; // Per request (hidden limit: 15 USDT)
  dailyLimit: number; // Daily withdrawal cap
  dailyUsed: number;
  dailyRemaining: number;
  velocityLimit: number; // Max withdrawals per day
  velocityUsed: number;
  cooldownMinutes: number; // Cooldown between withdrawals
}

// Validation constants (these match backend limits)
export const WITHDRAWAL_CONSTANTS = {
  MIN_WITHDRAWAL: 10, // Minimum withdrawal amount
  MAX_WITHDRAWAL: 15, // Hidden max per request (15 USDT)
  DAILY_LIMIT: 45, // Daily withdrawal cap
  VELOCITY_LIMIT: 3, // Max withdrawals per day
  AUTO_APPROVAL_THRESHOLD: 10, // Amounts <= this are auto-approved (after delay)
  MANUAL_APPROVAL_THRESHOLD: 15, // Amounts > this require manual approval
  AUTO_APPROVAL_DELAY_HOURS: 2, // Hours before auto-approval
  MANUAL_APPROVAL_DELAY_HOURS: 24, // Hours before manual approval processes
  COOLDOWN_MINUTES: 60, // Minutes between withdrawal requests
};

// Validate withdrawal address format
export const validateAddress = (address: string, chain: string): boolean => {
  if (!address || address.trim().length === 0) return false;

  if (chain === 'ethereum' || chain === 'bsc' || chain === 'polygon') {
    // EVM address format: 0x followed by 40 hex characters
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  } else if (chain === 'tron') {
    // TRON address format: T followed by 33 alphanumeric characters
    return /^T[A-Za-z1-9]{33}$/.test(address);
  }

  return false;
};

// Validate withdrawal amount
export const validateAmount = (
  amount: number,
  balance: number,
  limits: WithdrawalLimits
): { valid: boolean; error?: string } => {
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (amount < limits.minAmount) {
    return { valid: false, error: `Minimum withdrawal is ${limits.minAmount} ${limits.token || 'USDT'}` };
  }

  if (amount > limits.maxAmount) {
    return { valid: false, error: `Maximum withdrawal is ${limits.maxAmount} ${limits.token || 'USDT'} per request` };
  }

  if (amount > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }

  if (limits.dailyUsed + amount > limits.dailyLimit) {
    return {
      valid: false,
      error: `Daily limit exceeded. Remaining: ${limits.dailyRemaining} ${limits.token || 'USDT'}`
    };
  }

  if (limits.velocityUsed >= limits.velocityLimit) {
    return {
      valid: false,
      error: `Maximum ${limits.velocityLimit} withdrawals per day. Please try again tomorrow.`
    };
  }

  return { valid: true };
};

// Submit withdrawal request (calls backend API)
export const submitWithdrawalRequest = async (
  request: WithdrawalRequest,
  signature: string,
  nonce: string
): Promise<{ success: boolean; withdrawalId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-withdrawal', {
      body: {
        address: request.address, // Wallet address of user
        amount: request.amount,
        token: request.token,
        chain: request.chain,
        destinationAddress: request.destinationAddress,
        signature,
        nonce
      }
    });

    if (error) throw new Error(error.message || 'Function invocation failed');
    if (!data.success) throw new Error(data.error || 'Withdrawal failed');

    return { success: true, withdrawalId: data.withdrawalId };

  } catch (error: any) {
    console.error('Withdrawal request error:', error);
    return { success: false, error: error.message || 'Network error. Please try again.' };
  }
};

// Get withdrawal status
export const getWithdrawalStatus = async (withdrawalId: string): Promise<WithdrawalStatus | null> => {
  try {
    // TODO: Replace with actual backend API call
    // GET /api/withdrawals/{withdrawalId}
    const response = await fetch(`/api/withdrawals/${withdrawalId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      ...data,
      requestedAt: new Date(data.requestedAt),
      approvedAt: data.approvedAt ? new Date(data.approvedAt) : undefined,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      rejectedAt: data.rejectedAt ? new Date(data.rejectedAt) : undefined,
      autoApproveAt: data.autoApproveAt ? new Date(data.autoApproveAt) : undefined
    };

  } catch (error) {
    console.error('Get withdrawal status error:', error);
    return null;
  }
};

// Get user withdrawal limits
export const getWithdrawalLimits = async (): Promise<WithdrawalLimits | null> => {
  try {
    // TODO: Replace with actual backend API call
    // GET /api/withdrawals/limits
    const response = await fetch('/api/withdrawals/limits', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Get withdrawal limits error:', error);
    return null;
  }
};

// Get user's withdrawal history
export const getWithdrawalHistory = async (): Promise<WithdrawalStatus[]> => {
  try {
    // TODO: Replace with actual backend API call
    // GET /api/withdrawals/history
    const response = await fetch('/api/withdrawals/history', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((w: any) => ({
      ...w,
      requestedAt: new Date(w.requestedAt),
      approvedAt: w.approvedAt ? new Date(w.approvedAt) : undefined,
      completedAt: w.completedAt ? new Date(w.completedAt) : undefined,
      rejectedAt: w.rejectedAt ? new Date(w.rejectedAt) : undefined,
      autoApproveAt: w.autoApproveAt ? new Date(w.autoApproveAt) : undefined
    }));

  } catch (error) {
    console.error('Get withdrawal history error:', error);
    return [];
  }
};

// Request nonce for withdrawal signature
export const requestWithdrawalNonce = async (): Promise<{ nonce: string; expiresAt: Date } | null> => {
  try {
    // TODO: Replace with actual backend API call
    // GET /api/withdrawals/nonce
    const response = await fetch('/api/withdrawals/nonce', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      nonce: data.nonce,
      expiresAt: new Date(data.expiresAt)
    };

  } catch (error) {
    console.error('Request nonce error:', error);
    return null;
  }
};

// Generate withdrawal message for signing
export const generateWithdrawalMessage = (
  address: string,
  amount: number,
  token: string,
  chain: string,
  nonce: string,
  timestamp: number
): string => {
  return `Withdrawal Request

Address: ${address}
Amount: ${amount} ${token}
Chain: ${chain}
Nonce: ${nonce}
Timestamp: ${timestamp}

This signature is for authentication only and does not authorize any transaction.`;
};

