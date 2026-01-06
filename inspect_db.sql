-- CHECK TABLE SCHEMA AND TRIGGERS
-- Run this in Supabase SQL Editor

-- 1. List Columns in Order
SELECT ordinal_position, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. List Triggers
SELECT trigger_name, event_manipulation, action_statement, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'profiles';
