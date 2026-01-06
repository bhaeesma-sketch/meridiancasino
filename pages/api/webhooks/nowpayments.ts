// API Route: /api/webhooks/nowpayments
// Handles IPN callbacks from NOWPayments
// CRITICAL: This must verify signatures to prevent fake deposits

import { NextApiRequest, NextApiResponse } from 'next';
import { processDepositWebhook } from '../../../services/depositService';

export const config = {
    api: {
        bodyParser: false // We need raw body for signature verification
    }
};

// Helper to get raw body
async function getRawBody(req: NextApiRequest): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            resolve(data);
        });
        req.on('error', reject);
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get raw body for signature verification
        const rawBody = await getRawBody(req);
        const signature = req.headers['x-nowpayments-sig'] as string;

        if (!signature) {
            console.error('[SECURITY] Webhook received without signature');
            return res.status(403).json({ error: 'Missing signature' });
        }

        // Parse payload
        const payload = JSON.parse(rawBody);

        // Process webhook (includes signature verification)
        const result = await processDepositWebhook(payload, signature, rawBody);

        if (!result.success) {
            return res.status(403).json({ error: result.message });
        }

        // Always return 200 OK to NOWPayments
        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('[ERROR] Webhook processing failed:', error);
        // Still return 200 to prevent NOWPayments retry spam
        return res.status(200).json({ error: 'Processing failed' });
    }
}
