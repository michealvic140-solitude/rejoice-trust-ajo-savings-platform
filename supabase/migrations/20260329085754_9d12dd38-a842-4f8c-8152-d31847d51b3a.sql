
-- Fix overly permissive RLS on slots UPDATE
DROP POLICY IF EXISTS "Authenticated users can update slots" ON public.slots;

-- Users can only claim available slots (set user_id to themselves) or admins can update any slot
CREATE POLICY "Users can claim available slots" ON public.slots 
FOR UPDATE TO authenticated 
USING (
  user_id IS NULL OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);
