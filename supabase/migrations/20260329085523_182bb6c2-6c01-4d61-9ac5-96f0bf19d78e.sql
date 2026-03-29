
-- Missing tables and functions

-- CHAT MESSAGES TABLE
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat messages" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert chat messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- GUIDE TIPS TABLE
CREATE TABLE public.guide_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guide_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guide tips" ON public.guide_tips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert guide tips" ON public.guide_tips FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update guide tips" ON public.guide_tips FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete guide tips" ON public.guide_tips FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- SEND NOTIFICATION TO USER FUNCTION
CREATE OR REPLACE FUNCTION public.send_notification_to_user(p_user_id UUID, p_message TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message) VALUES (p_user_id, p_message);
END;
$$;

-- SEND NOTIFICATION TO GROUP FUNCTION
CREATE OR REPLACE FUNCTION public.send_notification_to_group(p_group_id UUID, p_message TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message)
  SELECT DISTINCT s.user_id, p_message
  FROM public.slots s
  WHERE s.group_id = p_group_id AND s.user_id IS NOT NULL;
END;
$$;

-- CHECK AND MARK DEFAULTERS FUNCTION
CREATE OR REPLACE FUNCTION public.check_and_mark_defaulters()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark users who haven't paid as restricted
  UPDATE public.profiles SET is_restricted = true
  WHERE id IN (
    SELECT DISTINCT s.user_id FROM public.slots s
    JOIN public.groups g ON s.group_id = g.id
    WHERE g.is_live = true AND s.user_id IS NOT NULL
    AND s.user_id NOT IN (
      SELECT t.user_id FROM public.transactions t
      WHERE t.status = 'approved' AND t.group_id = g.id
    )
  );
END;
$$;
