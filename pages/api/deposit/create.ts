// API Route: /api/deposit/create
// Creates a NOWPayments invoice for deposits

import { NextApiRequest, NextApiResponse } from 'next';
import { createDepositInvoice } from '../../../services/depositService';
import { verifyJWT } from '../../../services/authService';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify user is authenticated
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const decoded = verifyJWT(token);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Validate request body
        const { amount, currency, chain } = req.body;

        if (!amount || amount < 10) {
            return res.status(400).json({ error: 'Minimum deposit is $10' });
        }

        if (!currency || !['USDT', 'TRX', 'BTC'].includes(currency)) {
            return res.status(400).json({ error: 'Invalid currency' });
        }

        if (!chain || !['TRC20', 'ERC20', 'BSC'].includes(chain)) {
            return res.status(400).json({ error: 'Invalid chain' });
        }

        // Create NOWPayments invoice
        const invoice = await createDepositInvoice({
            userId: decoded.userId,
            amount,
            currency,
            chain
        });

        // Store pending deposit in database
        // TODO: INSERT INTO deposits (user_id, invoice_id, order_id, expected_amount, status)

        return res.status(200).json({
            success: true,
            deposit: {
                invoiceId: invoice.id,
                payAddress: invoice.pay_address,
                payAmount: invoice.pay_amount,
                payCurrency: invoice.pay_currency,
                qrCodeUrl: `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${invoice.pay_address}&choe=UTF-8`,
                invoiceUrl: invoice.invoice_url,
                expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
            }
        });

    } catch (error: any) {
        console.error('[ERROR] Deposit creation failed:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
