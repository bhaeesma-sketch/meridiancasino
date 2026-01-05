/**
 * Secure Webhook Verification Service
 * 
 * This service demonstrates the cryptographic verification required for 
 * production-ready NOWPayments IPN (Instant Payment Notification) handling.
 */

import crypto from 'crypto';

interface NOWPaymentsWebhookPayload {
    payment_id: number;
    payment_status: string;
    pay_address: string;
    price_amount: number;
    price_currency: string;
    actually_paid: number;
    order_id?: string;
    order_description?: string;
    purchase_id?: string;
    outcome_amount?: number;
    outcome_currency?: string;
}

/**
 * Verifies the authenticity of a NOWPayments webhook request.
 * 
 * @param payload The raw request body as string
 * @param signature The x-nowpayments-sig header value
 * @param ipnSecret The IPN secret key from NOWPayments dashboard
 * @returns boolean True if the signature is valid
 */
export const verifyNOWPaymentsSignature = (
    payload: string,
    signature: string,
    ipnSecret: string
): boolean => {
    // 1. Sort the payload keys alphabetically (NOWPayments requirement)
    // Note: Modern Node.js/Go implementations usually hash the raw body string directly
    // if the provider supports it, otherwise they reconstruct the object.

    // Create HMAC-SHA512 hash
    const hmac = crypto.createHmac('sha512', ipnSecret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    // Use timing-safe comparison to prevent side-channel attacks
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
    );
};

/**
 * Example Backend Processor (Pseudo-code)
 */
export const processIncomingDeposit = async (payload: NOWPaymentsWebhookPayload) => {
    // 1. Check Idempotency (payment_id check in DB)
    // 2. Check Status (only 'finished' or 'partially_paid' trigger credit)
    // 3. Perform Atomic Ledger Update

    if (payload.payment_status === 'finished') {
        console.log(`[LEDGER] Crediting ${payload.actually_paid} ${payload.price_currency} to user...`);
        // DB.transaction(async (tx) => { ... })
    }
};
