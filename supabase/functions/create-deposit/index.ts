// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
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
        const { amount, currency, currencyType, network, walletAddress } = await req.json()

        let targetCurrency = (currency || currencyType || 'USDT').toLowerCase();

        // Map to NOWPayments Tickers
        if (targetCurrency === 'usdt') {
            if (network === 'TRC20') targetCurrency = 'usdttrc20';
            else if (network === 'ERC20') targetCurrency = 'usdt'; // or usdterc20 depending on NP
        } else if (targetCurrency === 'trx') {
            targetCurrency = 'trx';
        } else if (targetCurrency === 'btc') {
            targetCurrency = 'btc';
        } else if (targetCurrency === 'eth') {
            targetCurrency = 'eth';
        }

        if (!walletAddress) throw new Error('Wallet address is required')

        // 2. Find User Profile by Wallet
        // 2. Find or Create User Profile
        let { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('wallet_address', walletAddress)
            .single()

        if (!profile) {
            // Auto-create profile if it doesn't exist (e.g. Guest or new user)
            const { data: newProfile, error: createError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    wallet_address: walletAddress,
                    username: `User_${walletAddress.slice(0, 4)}`,
                    balance: 0,
                    real_balance: 0
                })
                .select()
                .single();

            if (createError) {
                throw new Error('Failed to create user profile: ' + createError.message);
            }
            profile = newProfile;
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
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'CONFIG_ERROR: NOWPayments API Key is missing in Supabase Secrets' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

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
                pay_currency: targetCurrency,
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
                currency: targetCurrency,
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
            JSON.stringify({
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code // PG Error Code
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
