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
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { address, amount, token, chain, destinationAddress, signature, nonce } = await req.json()

        if (!address || !amount || !destinationAddress) {
            throw new Error("Missing required fields");
        }

        // 1. Verify User (Find Profile)
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('wallet_address', address)
            .single()

        if (profileError || !profile) {
            throw new Error('User profile not found')
        }

        // 2. Check Balance
        if (profile.real_balance < amount) {
            throw new Error('Insufficient funds')
        }

        // 3. Create Withdrawal Record
        const { data: withdrawal, error: dbError } = await supabaseAdmin
            .from('withdrawals')
            .insert({
                user_id: profile.id,
                amount,
                token,
                chain,
                destination_address: destinationAddress,
                status: amount < 15 ? 'pending_auto' : 'pending_manual'
            })
            .select()
            .single()

        if (dbError) throw dbError

        // 4. Deduct Balance (Atomic Transaction in real world, simplistic here)
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ real_balance: profile.real_balance - amount })
            .eq('id', profile.id)

        if (updateError) {
            console.error("Failed to deduct balance!", updateError);
            // In real world: Rollback withdrawal or flag for admin
        }

        return new Response(
            JSON.stringify({
                success: true,
                withdrawalId: withdrawal.id,
                message: amount < 15 ? 'Withdrawal auto-approved (queued)' : 'Withdrawal pending manual review'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
