// Deposit Bonus Service
// Handles first deposit bonus ($10 to bonus_balance) and 5+1 referral payouts

import { supabase } from './supabase';

const FIRST_DEPOSIT_BONUS = 10; // $10 bonus for first deposit
const REFERRAL_PAYOUT_THRESHOLD = 5; // After 5 valid referrals
const REFERRAL_PAYOUT_AMOUNT = 10; // $10 payout to real_balance

interface ProcessDepositResult {
    success: boolean;
    bonusGranted: boolean;
    bonusAmount: number;
    referralPayout: boolean;
    referralPayoutAmount: number;
    error?: string;
}

/**
 * Process a user's first deposit
 * - Grants $10 bonus to bonus_balance (non-withdrawable)
 * - Increments referrer's valid_referral_count
 * - Triggers $10 real_balance payout to referrer if they hit 5 referrals
 */
export async function processFirstDeposit(
    userId: string,
    depositAmount: number
): Promise<ProcessDepositResult> {
    try {
        // Fetch user profile
        const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return {
                success: false,
                bonusGranted: false,
                bonusAmount: 0,
                referralPayout: false,
                referralPayoutAmount: 0,
                error: 'User not found'
            };
        }

        // Check if this is actually the first deposit
        if (user.is_first_deposit) {
            return {
                success: true,
                bonusGranted: false,
                bonusAmount: 0,
                referralPayout: false,
                referralPayoutAmount: 0
            };
        }

        // Step 1: Grant $10 to bonus_balance
        const newBonusBalance = (Number(user.bonus_balance) || 0) + FIRST_DEPOSIT_BONUS;
        const newRealBalance = (Number(user.real_balance) || 0) + depositAmount;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                bonus_balance: newBonusBalance,
                real_balance: newRealBalance,
                balance: newRealBalance + newBonusBalance,
                is_first_deposit: true
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating user balance:', updateError);
            return {
                success: false,
                bonusGranted: false,
                bonusAmount: 0,
                referralPayout: false,
                referralPayoutAmount: 0,
                error: 'Failed to update balance'
            };
        }

        // Step 2: Process referrer's 5+1 counter
        let referralPayout = false;
        let referralPayoutAmount = 0;

        if (user.referred_by) {
            const referralResult = await processReferralPayout(user.referred_by);
            referralPayout = referralResult.payoutTriggered;
            referralPayoutAmount = referralResult.payoutAmount;
        }

        console.log(`[DEPOSIT BONUS] User ${userId}: +$${FIRST_DEPOSIT_BONUS} bonus_balance, Referral payout: ${referralPayout}`);

        return {
            success: true,
            bonusGranted: true,
            bonusAmount: FIRST_DEPOSIT_BONUS,
            referralPayout,
            referralPayoutAmount
        };

    } catch (error: any) {
        console.error('Error processing first deposit:', error);
        return {
            success: false,
            bonusGranted: false,
            bonusAmount: 0,
            referralPayout: false,
            referralPayoutAmount: 0,
            error: error.message
        };
    }
}

/**
 * Process referral payout (5+1 rule)
 * - Increments referrer's valid_referral_count
 * - If count reaches 5, pays $10 to real_balance and resets counter
 */
async function processReferralPayout(referralCode: string): Promise<{
    payoutTriggered: boolean;
    payoutAmount: number;
}> {
    try {
        // Find referrer by their referral code
        const { data: referrer, error: referrerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('referral_code', referralCode)
            .single();

        if (referrerError || !referrer) {
            console.warn(`[REFERRAL] Referrer not found for code: ${referralCode}`);
            return { payoutTriggered: false, payoutAmount: 0 };
        }

        const currentCount = Number(referrer.valid_referral_count) || 0;
        const newCount = currentCount + 1;

        if (newCount >= REFERRAL_PAYOUT_THRESHOLD) {
            // Pay $10 to referrer's real_balance (withdrawable immediately!)
            const newRealBalance = (Number(referrer.real_balance) || 0) + REFERRAL_PAYOUT_AMOUNT;
            const newTotalBalance = newRealBalance + (Number(referrer.bonus_balance) || 0);

            const { error: payoutError } = await supabase
                .from('profiles')
                .update({
                    real_balance: newRealBalance,
                    balance: newTotalBalance,
                    valid_referral_count: 0, // Reset counter
                    referral_earnings: (Number(referrer.referral_earnings) || 0) + REFERRAL_PAYOUT_AMOUNT
                })
                .eq('id', referrer.id);

            if (payoutError) {
                console.error('Error processing referral payout:', payoutError);
                return { payoutTriggered: false, payoutAmount: 0 };
            }

            console.log(`[REFERRAL PAYOUT] Referrer ${referrer.id}: +$${REFERRAL_PAYOUT_AMOUNT} real_balance (5 valid referrals)`);
            return { payoutTriggered: true, payoutAmount: REFERRAL_PAYOUT_AMOUNT };

        } else {
            // Just increment the counter
            const { error: incrementError } = await supabase
                .from('profiles')
                .update({
                    valid_referral_count: newCount
                })
                .eq('id', referrer.id);

            if (incrementError) {
                console.error('Error incrementing referral count:', incrementError);
            }

            console.log(`[REFERRAL] Referrer ${referrer.id}: valid_referral_count = ${newCount}/5`);
            return { payoutTriggered: false, payoutAmount: 0 };
        }

    } catch (error: any) {
        console.error('Error in processReferralPayout:', error);
        return { payoutTriggered: false, payoutAmount: 0 };
    }
}

/**
 * Credit deposit to user's real_balance (for subsequent deposits after first)
 */
export async function creditDeposit(
    userId: string,
    amount: number
): Promise<{ success: boolean; newBalance: number; error?: string }> {
    try {
        const { data: user, error: fetchError } = await supabase
            .from('profiles')
            .select('real_balance, bonus_balance')
            .eq('id', userId)
            .single();

        if (fetchError || !user) {
            return { success: false, newBalance: 0, error: 'User not found' };
        }

        const newRealBalance = (Number(user.real_balance) || 0) + amount;
        const totalBalance = newRealBalance + (Number(user.bonus_balance) || 0);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                real_balance: newRealBalance,
                balance: totalBalance
            })
            .eq('id', userId);

        if (updateError) {
            return { success: false, newBalance: 0, error: 'Failed to credit deposit' };
        }

        return { success: true, newBalance: totalBalance };

    } catch (error: any) {
        return { success: false, newBalance: 0, error: error.message };
    }
}

/**
 * Get user's referral progress toward next payout
 */
export async function getReferralProgress(userId: string): Promise<{
    currentCount: number;
    threshold: number;
    nextPayoutAmount: number;
    totalEarnings: number;
}> {
    try {
        const { data: user } = await supabase
            .from('profiles')
            .select('valid_referral_count, referral_earnings')
            .eq('id', userId)
            .single();

        return {
            currentCount: Number(user?.valid_referral_count) || 0,
            threshold: REFERRAL_PAYOUT_THRESHOLD,
            nextPayoutAmount: REFERRAL_PAYOUT_AMOUNT,
            totalEarnings: Number(user?.referral_earnings) || 0
        };
    } catch {
        return {
            currentCount: 0,
            threshold: REFERRAL_PAYOUT_THRESHOLD,
            nextPayoutAmount: REFERRAL_PAYOUT_AMOUNT,
            totalEarnings: 0
        };
    }
}
