
-- Add missing columns to audit_logs
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS admin_name TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'system';

-- Add missing columns to disbursements
ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS seat_numbers TEXT;
ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS proof_url TEXT;

-- Add content column alias to guide_tips (rename body to content or add content)
ALTER TABLE public.guide_tips ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.guide_tips ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
-- Rename body to content for guide_tips
ALTER TABLE public.guide_tips RENAME COLUMN body TO content;

-- Add password_plain to profiles (for admin password gen feature)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_plain TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
