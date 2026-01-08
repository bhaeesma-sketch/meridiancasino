-- Compliance & Anti-Fraud Migration
-- 1. Add Device Fingerprint Column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;

-- 2. Add Last IP Column (for rate limiting)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_ip TEXT;

-- 3. Update profiles handle_new_profile to capture IP if possible 
-- (Though IP is usually better handled at the app level/Edge function for precision)

-- 4. Referral Rate Limiting Function
CREATE OR REPLACE FUNCTION check_referral_limit()
RETURNS TRIGGER AS $$
DECLARE
    last_signup_count INTEGER;
BEGIN
    -- Only check for new signups with a referrer
    IF NEW.referred_by IS NOT NULL THEN
        -- Check how many signups from this IP in the last 24 hours
        SELECT COUNT(*) INTO last_signup_count
        FROM public.profiles
        WHERE last_ip = NEW.last_ip
        AND joined_date > NOW() - INTERVAL '24 hours';

        IF last_signup_count >= 3 THEN -- Allow max 3 per IP per day (reasonable for families/housing)
            RAISE EXCEPTION 'REFERRAL_LIMIT_EXCEEDED: Maximum referral signups reached for this IP in 24h.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach trigger
DROP TRIGGER IF EXISTS tr_check_referral_limit ON public.profiles;
CREATE TRIGGER tr_check_referral_limit
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_referral_limit();
