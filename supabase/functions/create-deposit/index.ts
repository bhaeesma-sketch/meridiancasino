import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Use SERVICE ROLE key to bypass RLS and Auth requirements, 
        // since we are validating via wallet address passed in body (Web3 style)
        // Note: In a real prod environment, you'd want to verify a signature here too.
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Parse Request
        const { amount, currency, network, walletAddress } = await req.json()

        if (!walletAddress) throw new Error('Wallet address is required')

        // 2. Find User Profile by Wallet
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('wallet_address', walletAddress)
            .single()

        if (profileError || !profile) {
            console.error("Profile Error:", profileError);
            throw new Error('User profile not found. Please reconnect wallet.')
        }

        const userId = profile.id;

        // 3. PAYMENT_MODE Enforcement
        const mode = Deno.env.get('PAYMENT_MODE') || 'PRODUCTION';
        const isTest = mode === 'TEST';

        // Rule: Minimum deposit 10 USDT in PRODUCTION, 0.000001 in TEST
        const minAmount = isTest ? 0.000001 : 10;
        if (amount < minAmount) {
            throw new Error(`Minimum deposit is ${minAmount} USDT in ${mode} mode`);
        }

        // 4. Create NOWPayments Payment (Direct Address)
        const apiKey = Deno.env.get('NOWPAYMENTS_API_KEY')
        if (!apiKey) throw new Error('Server misconfiguration: Missing API Key')

        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`

        // Call NOWPayments API - v1/payment for direct address
        const npResponse = await fetch('https://api.nowpayments.io/v1/payment', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price_amount: amount,
                price_currency: 'usd',
                pay_currency: currency || 'usdttrc20',
                ipn_callback_url: Deno.env.get('NOWPAYMENTS_WEBHOOK_URL'),
                order_id: orderId,
                order_description: `Deposit (${mode}) for User ${walletAddress}`,
            }),
        })

        const paymentData = await npResponse.json()

        if (!npResponse.ok) {
            console.error('NOWPayments Error:', paymentData)
            throw new Error(`Payment Provider Error: ${paymentData.message || 'Unknown error'}`)
        }

        // 5. Record Deposit in DB
        const { error: dbError } = await supabaseAdmin
            .from('deposits')
            .insert({
                user_id: userId, // UUID from profiles
                order_id: orderId,
                payment_id: paymentData.payment_id,
                amount: amount,
                currency: currency || 'usdttrc20',
                status: 'pending',
                invoice_url: '#',
                network: network,
                pay_address: paymentData.pay_address
            })

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            throw new Error(`Database Error: ${dbError.message}`);
        }

        return new Response(
            JSON.stringify({
                success: true,
                mode: mode,
                deposit: {
                    invoiceId: orderId,
                    payAddress: paymentData.pay_address,
                    payAmount: paymentData.pay_amount,
                    payCurrency: paymentData.pay_currency,
                    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${paymentData.pay_address}`,
                    invoiceUrl: '#',
                    expiresAt: new Date(Date.now() + 3600000).toISOString()
                }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
