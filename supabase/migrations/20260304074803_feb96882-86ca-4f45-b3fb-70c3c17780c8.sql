
-- Fix the overly permissive subscription INSERT policy
DROP POLICY IF EXISTS "Allow subscription creation during signup" ON public.subscriptions;
CREATE POLICY "Allow subscription creation during signup" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND school_id = subscriptions.school_id)
);
