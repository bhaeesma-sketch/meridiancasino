// Admin Audit Logging Service
// Tracks all admin actions for security and accountability

import { supabase } from './supabase';

export interface AuditLogEntry {
    action: string;
    details?: any;
    targetUser?: string;
    targetWallet?: string;
}

/**
 * Log an admin action to the database
 * @param action - Description of the action (e.g., 'APPROVE_WITHDRAWAL', 'FREEZE_USER')
 * @param details - Additional details about the action
 * @param targetUser - User ID affected by the action
 * @param targetWallet - Wallet address affected by the action
 */
export async function logAdminAction(
    action: string,
    details?: any,
    targetUser?: string,
    targetWallet?: string
): Promise<void> {
    try {
        const adminWallet = localStorage.getItem('wallet_address');

        if (!adminWallet) {
            console.warn('Cannot log admin action: No wallet address found');
            return;
        }

        // Get client IP (best effort - may not work in all environments)
        const ipAddress = await getClientIP();

        await supabase.from('admin_audit_log').insert({
            admin_wallet: adminWallet.toLowerCase(),
            action,
            target_user: targetUser,
            target_wallet: targetWallet?.toLowerCase(),
            details: details ? JSON.stringify(details) : null,
            ip_address: ipAddress,
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString()
        });

        console.log(`[AUDIT] ${action}`, { targetUser, targetWallet, details });
    } catch (error) {
        console.error('Failed to log admin action:', error);
        // Don't throw - audit logging failure shouldn't break the app
    }
}

/**
 * Get recent audit logs
 * @param limit - Number of logs to retrieve
 * @param adminWallet - Filter by specific admin wallet (optional)
 */
export async function getAuditLogs(
    limit: number = 100,
    adminWallet?: string
) {
    let query = supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (adminWallet) {
        query = query.eq('admin_wallet', adminWallet.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
        console.error('Failed to fetch audit logs:', error);
        return [];
    }

    return data || [];
}

/**
 * Get client IP address (best effort)
 * Note: This may not work in all environments due to CORS/privacy
 */
async function getClientIP(): Promise<string | null> {
    try {
        // Try to get IP from ipify API
        const response = await fetch('https://api.ipify.org?format=json', {
            signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        const data = await response.json();
        return data.ip;
    } catch {
        // Fallback: Try to get from headers (won't work in browser, but useful for server-side)
        return null;
    }
}

/**
 * Common admin actions for logging
 */
export const AdminActions = {
    // User Management
    FREEZE_USER: 'FREEZE_USER',
    UNFREEZE_USER: 'UNFREEZE_USER',
    SUSPEND_USER: 'SUSPEND_USER',
    UPDATE_USER_BALANCE: 'UPDATE_USER_BALANCE',

    // Withdrawal Management
    APPROVE_WITHDRAWAL: 'APPROVE_WITHDRAWAL',
    REJECT_WITHDRAWAL: 'REJECT_WITHDRAWAL',
    PROCESS_WITHDRAWAL: 'PROCESS_WITHDRAWAL',

    // System Actions
    VIEW_ADMIN_DASHBOARD: 'VIEW_ADMIN_DASHBOARD',
    EXPORT_DATA: 'EXPORT_DATA',
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',

    // Security Actions
    GRANT_ADMIN: 'GRANT_ADMIN',
    REVOKE_ADMIN: 'REVOKE_ADMIN',
    FORCE_LOGOUT: 'FORCE_LOGOUT',
} as const;

/**
 * Example usage:
 * 
 * import { logAdminAction, AdminActions } from './services/auditLog';
 * 
 * // When approving a withdrawal
 * await logAdminAction(
 *   AdminActions.APPROVE_WITHDRAWAL,
 *   { amount: 1000, txHash: '0x123...' },
 *   userId,
 *   userWallet
 * );
 * 
 * // When freezing a user
 * await logAdminAction(
 *   AdminActions.FREEZE_USER,
 *   { reason: 'Suspicious activity detected' },
 *   userId,
 *   userWallet
 * );
 */
