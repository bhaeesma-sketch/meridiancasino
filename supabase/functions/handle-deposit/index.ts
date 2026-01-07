import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Parse Webhook Data (Example: NOWPayments or Generic)
        const payload = await req.json()

        // VALIDATION: Check signature here (skipped for demo, extremely important for prod)
        // const signature = req.headers.get('x-nowpayments-sig')
        // if (!verifySignature(payload, signature)) throw new Error('Invalid Signature')

        const {
            payment_status,
            price_amount,
            price_currency,
            pay_address,
            payment_id,
            order_id // Assuming we pass user_id as order_id
        } = payload

        // Only process confirmed payments
        if (payment_status !== 'finished' && payment_status !== 'confirmed') {
            return new Response(JSON.stringify({ message: 'Ignored: Status not final' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 2. Call Database Function
        // We use the secure SQL function we created earlier
        const { data, error } = await supabase.rpc('process_deposit', {
            p_user_id: order_id, // We must ensure we sent user_id as order_id during creation
            p_amount: price_amount,
            p_currency: price_currency,
            p_tx_hash: payment_id
        })

        if (error) throw error

        return new Response(JSON.stringify({ success: true, new_balance: data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
