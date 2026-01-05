// api/webhook.ts
import { verifyNOWPaymentsSignature } from '../services/webhookService';

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const secret = process.env.NOWPAYMENTS_WEBHOOK_SECRET;
    if (!secret) {
        console.error('❌ Missing NOWPAYMENTS_WEBHOOK_SECRET');
        return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const signature = req.headers.get('x-nowpayments-sig');
    if (!signature) {
        return new Response(JSON.stringify({ error: 'Missing signature' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const body = await req.text();
    const isValid = verifyNOWPaymentsSignature(body, signature, secret);

    if (!isValid) {
        console.warn('⚠️ Invalid webhook signature!');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const data = JSON.parse(body);
    const { payment_status, order_id, pay_amount, pay_currency } = data;

    console.log('✅ Webhook received:', { status: payment_status, orderId: order_id });

    // 🔑 Add your game logic here (e.g., give coins, unlock feature)
    if (payment_status === 'confirmed') {
        console.log(`🎉 User ${order_id} paid ${pay_amount} ${pay_currency}`);
        // Example: call your game logic to update balance
        // await updateBalance(order_id, pay_amount);
    }

    return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}