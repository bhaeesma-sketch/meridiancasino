// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const RESTRICTED_COUNTRIES = [
    'US', // United States
    'GB', // United Kingdom
    'FR', // France
    'NL', // Netherlands
    'ES', // Spain
    'AU', // Australia
    'DE', // Germany
    'AT', // Austria
    'KM', // Comoros
    'KP', // North Korea (FATF)
    'IR', // Iran (FATF)
    'MM', // Myanmar (FATF)
]

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Supabase Edge Functions provide geo info in headers via Cloudflare
        const country = req.headers.get('cf-ipcountry') || 'Unknown';
        const clientIp = req.headers.get('x-real-ip') || 'Unknown';

        console.log(`Geoblock Check: IP ${clientIp}, Country ${country}`);

        const isRestricted = RESTRICTED_COUNTRIES.includes(country);

        return new Response(
            JSON.stringify({
                allowed: !isRestricted,
                country: country,
                ip: clientIp,
                restricted: isRestricted
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
