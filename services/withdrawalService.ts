// Withdrawal Service - Handles withdrawal requests and validation
// This is the FRONTEND service - Backend performs actual security checks

import { supabase } from './supabase';

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
  token?: string;
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

// Get user's withdrawal history from Supabase
export const getWithdrawalHistory = async (): Promise<WithdrawalStatus[]> => {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((w: any) => ({
      id: w.id,
      status: w.status,
      amount: Number(w.amount),
      token: w.token,
      chain: w.chain,
      destinationAddress: w.destination_address,
      requestedAt: new Date(w.created_at),
      approvedAt: w.approved_at ? new Date(w.approved_at) : undefined,
      completedAt: w.completed_at ? new Date(w.completed_at) : undefined,
      rejectedAt: w.rejected_at ? new Date(w.rejected_at) : undefined,
      autoApproveAt: w.auto_approve_at ? new Date(w.auto_approve_at) : undefined,
      txHash: w.tx_hash,
      rejectionReason: w.rejection_reason
    }));

  } catch (error) {
    console.error('Get withdrawal history error:', error);
    return [];
  }
};

// Get user withdrawal limits (constants for now, but could be fetched from server configuration)
export const getWithdrawalLimits = async (): Promise<WithdrawalLimits | null> => {
  try {
    // In a real app, this might fetch from a 'system_config' table or calculated from user tier
    return {
      minAmount: WITHDRAWAL_CONSTANTS.MIN_WITHDRAWAL,
      maxAmount: WITHDRAWAL_CONSTANTS.MAX_WITHDRAWAL,
      dailyLimit: WITHDRAWAL_CONSTANTS.DAILY_LIMIT,
      dailyUsed: 0, // Should be calculated from today's withdrawals
      dailyRemaining: WITHDRAWAL_CONSTANTS.DAILY_LIMIT,
      velocityLimit: WITHDRAWAL_CONSTANTS.VELOCITY_LIMIT,
      velocityUsed: 0,
      cooldownMinutes: WITHDRAWAL_CONSTANTS.COOLDOWN_MINUTES,
      token: 'USDT'
    };
  } catch (error) {
    console.error('Get withdrawal limits error:', error);
    return null;
  }
};

// Request nonce for withdrawal signature (Simplified for demo, usually hits a secure server side nonce generator)
export const requestWithdrawalNonce = async (): Promise<{ nonce: string; expiresAt: Date } | null> => {
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    nonce,
    expiresAt: new Date(Date.now() + 600000) // 10 mins
  };
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

