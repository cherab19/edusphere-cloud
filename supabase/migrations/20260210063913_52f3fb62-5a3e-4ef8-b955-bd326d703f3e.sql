
-- Fix overly permissive INSERT policies

-- Schools: only allow insert if user has no school yet (onboarding)
DROP POLICY "Allow school creation during signup" ON public.schools;
CREATE POLICY "Allow school creation during signup"
  ON public.schools FOR INSERT TO authenticated
  WITH CHECK (public.get_school_id(auth.uid()) IS NULL);

-- Subscriptions: only allow insert for user's own school
DROP POLICY "Allow subscription creation during signup" ON public.subscriptions;
CREATE POLICY "Allow subscription creation during signup"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_school_id(auth.uid()));
