
-- 1. Drop password_plain column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS password_plain;

-- 2. Fix profiles SELECT policy: users see only own profile, admins see all
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix profiles UPDATE policy: restrict sensitive columns
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND is_vip IS NOT DISTINCT FROM (SELECT is_vip FROM public.profiles WHERE id = auth.uid())
    AND is_banned IS NOT DISTINCT FROM (SELECT is_banned FROM public.profiles WHERE id = auth.uid())
    AND is_frozen IS NOT DISTINCT FROM (SELECT is_frozen FROM public.profiles WHERE id = auth.uid())
    AND is_restricted IS NOT DISTINCT FROM (SELECT is_restricted FROM public.profiles WHERE id = auth.uid())
    AND trust_score IS NOT DISTINCT FROM (SELECT trust_score FROM public.profiles WHERE id = auth.uid())
    AND total_paid IS NOT DISTINCT FROM (SELECT total_paid FROM public.profiles WHERE id = auth.uid())
  );

-- 4. Add admin UPDATE policy for profiles (can update any field)
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Fix ticket_replies INSERT policy to prevent is_admin spoofing
DROP POLICY IF EXISTS "Users can insert replies" ON public.ticket_replies;
CREATE POLICY "Users can insert replies" ON public.ticket_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (is_admin = false OR has_role(auth.uid(), 'admin'::app_role))
  );

-- 6. Fix audit_logs INSERT policy: allow users to insert their own audit logs
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- 7. Add admin SELECT policy for user_roles so admin pages work
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
