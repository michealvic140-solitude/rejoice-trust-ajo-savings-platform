
-- ============================================
-- RTRASP Platform Database Schema
-- ============================================

-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Enum for slot status
CREATE TYPE public.slot_status AS ENUM ('available', 'reserved', 'claimed', 'locked');

-- Enum for announcement type
CREATE TYPE public.announcement_type AS ENUM ('announcement', 'promotion', 'server-update', 'group-message');

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  middle_name TEXT,
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  role app_role NOT NULL DEFAULT 'user',
  is_vip BOOLEAN NOT NULL DEFAULT false,
  is_restricted BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  is_frozen BOOLEAN NOT NULL DEFAULT false,
  nickname TEXT,
  gender TEXT,
  dob TEXT,
  age INTEGER,
  state_of_origin TEXT,
  lga TEXT,
  current_state TEXT,
  current_address TEXT,
  home_address TEXT,
  bvn_nin TEXT,
  profile_picture TEXT,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  trust_score INTEGER NOT NULL DEFAULT 50,
  unread_notifications INTEGER NOT NULL DEFAULT 0,
  bank_acc_name TEXT,
  bank_acc_num TEXT,
  bank_name TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table for secure role checking
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============================================
-- 2. GROUPS TABLE
-- ============================================
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  contribution_amount NUMERIC NOT NULL DEFAULT 0,
  cycle_type TEXT NOT NULL DEFAULT 'daily',
  total_slots INTEGER NOT NULL DEFAULT 100,
  filled_slots INTEGER NOT NULL DEFAULT 0,
  is_live BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  chat_locked BOOLEAN NOT NULL DEFAULT false,
  payout_account TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  terms_text TEXT DEFAULT '',
  live_at TIMESTAMPTZ,
  payout_amount NUMERIC NOT NULL DEFAULT 0,
  disbursement_days INTEGER NOT NULL DEFAULT 30,
  payment_frequency TEXT NOT NULL DEFAULT 'daily',
  payment_days INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view groups" ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert groups" ON public.groups FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update groups" ON public.groups FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete groups" ON public.groups FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 3. SLOTS TABLE
-- ============================================
CREATE TABLE public.slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT,
  full_name TEXT,
  nickname TEXT,
  is_vip BOOLEAN DEFAULT false,
  profile_picture TEXT,
  status slot_status NOT NULL DEFAULT 'available',
  is_disbursed BOOLEAN NOT NULL DEFAULT false,
  disbursed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  seat_no INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, seat_no)
);

ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view slots" ON public.slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update slots" ON public.slots FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can insert slots" ON public.slots FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete slots" ON public.slots FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 4. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL DEFAULT '',
  group_name TEXT NOT NULL DEFAULT '',
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  screenshot_url TEXT,
  seat_numbers TEXT,
  declined_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 5. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 6. ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type announcement_type NOT NULL DEFAULT 'announcement',
  image_url TEXT,
  target_group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  admin_name TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update announcements" ON public.announcements FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete announcements" ON public.announcements FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 7. SUPPORT TICKETS TABLE
-- ============================================
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  admin_reply TEXT,
  admin_reply_attachment TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 8. TICKET REPLIES TABLE
-- ============================================
CREATE TABLE public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ticket replies" ON public.ticket_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert replies" ON public.ticket_replies FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============================================
-- 9. CONTACT INFO TABLE
-- ============================================
CREATE TABLE public.contact_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  whatsapp TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  email TEXT DEFAULT '',
  call_number TEXT DEFAULT '',
  sms_number TEXT DEFAULT ''
);

ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contact info" ON public.contact_info FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update contact info" ON public.contact_info FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.contact_info (id) VALUES (1);

-- ============================================
-- 10. PLATFORM SETTINGS TABLE
-- ============================================
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.platform_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert settings" ON public.platform_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update settings" ON public.platform_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.platform_settings (key, value) VALUES ('maintenance_mode', 'false');
INSERT INTO public.platform_settings (key, value) VALUES ('terms_and_conditions', 'Welcome to RTRASP. By using this platform you agree to our terms.');

-- ============================================
-- 11. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 12. EXIT REQUESTS TABLE
-- ============================================
CREATE TABLE public.exit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES public.slots(id) ON DELETE SET NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exit requests" ON public.exit_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert exit requests" ON public.exit_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update exit requests" ON public.exit_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 13. SEAT CHANGE REQUESTS TABLE
-- ============================================
CREATE TABLE public.seat_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  current_seat INTEGER,
  requested_seat INTEGER,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seat_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own seat requests" ON public.seat_change_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert seat requests" ON public.seat_change_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update seat requests" ON public.seat_change_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 14. DISBURSEMENTS TABLE
-- ============================================
CREATE TABLE public.disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES public.slots(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  disbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.disbursements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own disbursements" ON public.disbursements FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert disbursements" ON public.disbursements FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update disbursements" ON public.disbursements FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 15. USER DEBTS TABLE
-- ============================================
CREATE TABLE public.user_debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own debts" ON public.user_debts FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert debts" ON public.user_debts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update debts" ON public.user_debts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 16. LEADERBOARD FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  nickname TEXT,
  profile_picture TEXT,
  is_vip BOOLEAN,
  total_paid NUMERIC,
  trust_score INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.first_name, p.last_name, p.nickname, p.profile_picture, p.is_vip, p.total_paid, p.trust_score
  FROM public.profiles p
  ORDER BY p.total_paid DESC
  LIMIT 50
$$;

-- ============================================
-- 17. PLATFORM STATS FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_groups', (SELECT COUNT(*) FROM public.groups),
    'total_transactions', (SELECT COUNT(*) FROM public.transactions),
    'total_paid', (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE status = 'approved'),
    'pending_transactions', (SELECT COUNT(*) FROM public.transactions WHERE status = 'pending')
  ) INTO result;
  RETURN result;
END;
$$;

-- ============================================
-- 18. SEND NOTIFICATION TO ALL FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.send_notification_to_all(p_message TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message)
  SELECT id, p_message FROM public.profiles;
END;
$$;

-- ============================================
-- 19. AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 20. UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 21. STORAGE BUCKET FOR UPLOADS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'uploads');
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads');
