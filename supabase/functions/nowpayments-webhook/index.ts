import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Helper to convert hex string to Uint8Array
const hexToUint8Array = (hexString: string) =>
    new Uint8Array(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

serve(async (req: Request) => {
    try {
        // 1. Validate Signature (Security Critical)
        const ipnSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET')
        if (!ipnSecret) throw new Error('Server config error: Missing IPN Secret')

        const sig = req.headers.get('x-nowpayments-sig')
        if (!sig) throw new Error('Missing signature header')

        const bodyText = await req.text()

        // Calculate HMAC-SHA512 using Native Web Crypto API
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(ipnSecret),
            { name: "HMAC", hash: "SHA-512" },
            false,
            ["verify"]
        );

        const isValid = await crypto.subtle.verify(
            "HMAC",
            key,
            hexToUint8Array(sig),
            encoder.encode(bodyText)
        );

        if (!isValid) {
            console.error('Signature mismatch')
            throw new Error('Invalid signature')
        }

        const payload = JSON.parse(bodyText)
        const { payment_status, order_id, pay_amount, payment_id, outcome, pay_currency } = payload

        // 2. Anti-fraud: Reject Forbidden Statuses
        const forbiddenStatuses = ['confirming', 'partially_paid', 'expired', 'failed', 'refunded'];
        if (forbiddenStatuses.includes(payment_status)) {
            console.log(`Skipping credit for status: ${payment_status}`);
            return new Response('No action required for this status', { status: 200 });
        }

        if (payment_status !== 'finished') {
            return new Response('Status not finished', { status: 200 });
        }

        // 3. Setup Supabase Client (Service Role for Admin Access)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 4. Check for existing deposit and prevent double-credit
        const { data: existingDeposit, error: findError } = await supabaseAdmin
            .from('deposits')
            .select('*')
            .eq('order_id', order_id)
            .single()

        if (findError || !existingDeposit) {
            console.error('Deposit not found for order:', order_id)
            return new Response('Order not found', { status: 200 })
        }

        // STRICT IDEMPOTENCY: Already finished or confirmed means NO MORE UPDATES
        if (existingDeposit.status === 'finished' || existingDeposit.status === 'confirmed') {
            return new Response('Already processed', { status: 200 })
        }

        // 5. Amount Validation (Section 7.3)
        // Ensure properties exist before parsing to avoid NaN issues if they are somehow missing
        if (!pay_amount || !existingDeposit.amount) {
            console.error('Missing amount data', { pay_amount, deposit_amount: existingDeposit.amount });
            // Depending on logic, maybe return or continue. Throwing error for safety.
            throw new Error('Missing amount data for validation');
        }

        if (parseFloat(pay_amount) < parseFloat(existingDeposit.amount)) {
            console.error('FRAUD ATTEMPT: Amount paid less than expected', { expected: existingDeposit.amount, received: pay_amount })
            // Mark as fraud/flagged in DB
            await supabaseAdmin.from('deposits').update({ status: 'flagged_fraud' }).eq('id', existingDeposit.id);
            return new Response('Security rejection: Underpaid', { status: 200 });
        }

        // 6. Update Deposit Status ATOMICALLY (almost)
        const { error: updateError } = await supabaseAdmin
            .from('deposits')
            .update({
                status: payment_status,
                payment_id: payment_id,
                updated_at: new Date().toISOString()
            })
            .eq('id', existingDeposit.id)

        if (updateError) throw updateError

        // 7. Credit Balance
        const { error: rpcError } = await supabaseAdmin.rpc('update_user_balance', {
            p_user_id: existingDeposit.user_id,
            p_amount: parseFloat(pay_amount),
            p_balance_type: 'real'
        })

        if (rpcError) {
            console.error('Failed to credit balance:', rpcError)
            throw rpcError
        }

        // 8. Log Audit Trace
        console.log('AUDIT LOG: Balance credited successfully', { user: existingDeposit.user_id, amount: pay_amount, txid: payment_id });

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        console.error('Webhook Error:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }
})
