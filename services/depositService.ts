// NOWPayments Deposit Service - Secure implementation logic
// This service coordinates with the backend for secure, IPN-verified deposits.

export interface DepositInvoice {
    id: string;
    pay_address: string;
    pay_amount: number;
    pay_currency: string;
    created_at: string;
    status: 'waiting' | 'confirming' | 'confirmed' | 'finished' | 'failed' | 'partially_paid';
}

/**
 * Creates a new deposit invoice via the backend.
 * The backend handles the actual NOWPayments API call to prevent API key leakage.
 */
export const createDepositInvoice = async (
    amount: number,
    currency: string
): Promise<{ success: boolean; invoice?: DepositInvoice; error?: string }> => {
    try {
        // SECURITY: Purity check - only allow supported currencies
        const supportedCurrencies = ['USDTTRC20', 'TRX', 'BTC', 'ETH'];
        if (!supportedCurrencies.includes(currency.toUpperCase())) {
            return { success: false, error: 'Unsupported currency sequence.' };
        }

        // POST /api/payments/deposit
        const response = await fetch('/api/payments/deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({ amount, currency })
        });

        if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.message || 'Quantum link failure during invoice generation.' };
        }

        const data = await response.json();
        return { success: true, invoice: data.invoice };

    } catch (error: any) {
        console.error('Deposit Error:', error);
        return { success: false, error: 'Neural link unstable. Please retry.' };
    }
};

/**
 * Checks the status of a specific deposit.
 * Note: Balance is ONLY credited via verified IPN webhooks, never via this status check.
 */
export const checkDepositStatus = async (paymentId: string): Promise<DepositInvoice | null> => {
    try {
        const response = await fetch(`/api/payments/status/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (err) {
        return null;
    }
};

/**
 * Constants for the deposit system
 */
export const DEPOSIT_CONFIG = {
    MIN_DEPOSIT: 10, // Minimum $10 equivalent
    CONFIRMATIONS_REQUIRED: 3, // Blocks to wait for TRC20/ERC20
    INVOICE_EXPIRY_MINUTES: 60,
};
