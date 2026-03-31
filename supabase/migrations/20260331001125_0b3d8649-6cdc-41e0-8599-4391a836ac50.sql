
DROP FUNCTION IF EXISTS public.get_leaderboard();

CREATE FUNCTION public.get_leaderboard()
 RETURNS TABLE(id uuid, first_name text, last_name text, nickname text, profile_picture text, is_vip boolean, total_paid numeric, trust_score integer, role app_role, groups_joined bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.first_name, p.last_name, p.nickname, p.profile_picture, p.is_vip, p.total_paid, p.trust_score, p.role,
    (SELECT COUNT(DISTINCT s.group_id) FROM public.slots s WHERE s.user_id = p.id) as groups_joined
  FROM public.profiles p
  ORDER BY p.total_paid DESC
  LIMIT 50
$function$;
