
-- Fix schools insert policy: drop restrictive, create permissive
DROP POLICY IF EXISTS "Allow school creation during signup" ON public.schools;
CREATE POLICY "Allow school creation during signup"
ON public.schools FOR INSERT TO authenticated
WITH CHECK (get_school_id(auth.uid()) IS NULL);

-- Fix profiles insert policy: drop restrictive, create permissive
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
CREATE POLICY "Allow profile creation during signup"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix user_roles insert policies: drop restrictive, create permissive
DROP POLICY IF EXISTS "Allow role assignment during signup" ON public.user_roles;
CREATE POLICY "Allow role assignment during signup"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "School admins can assign roles" ON public.user_roles;
CREATE POLICY "School admins can assign roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'school_admin') AND belongs_to_school(user_id, get_school_id(auth.uid())));

-- Fix subscriptions insert policy: drop restrictive, create permissive
DROP POLICY IF EXISTS "Allow subscription creation during signup" ON public.subscriptions;
CREATE POLICY "Allow subscription creation during signup"
ON public.subscriptions FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.school_id = subscriptions.school_id
));

-- Fix user_roles select policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "School admins can view roles in their school" ON public.user_roles;
CREATE POLICY "School admins can view roles in their school"
ON public.user_roles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'school_admin') AND EXISTS (
  SELECT 1 FROM profiles p WHERE p.user_id = user_roles.user_id AND p.school_id = get_school_id(auth.uid())
));

-- Fix profiles select policies
DROP POLICY IF EXISTS "Users can view profiles in their school" ON public.profiles;
CREATE POLICY "Users can view profiles in their school"
ON public.profiles FOR SELECT TO authenticated
USING (school_id = get_school_id(auth.uid()));

DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix schools select/update policies
DROP POLICY IF EXISTS "Users can view their own school" ON public.schools;
CREATE POLICY "Users can view their own school"
ON public.schools FOR SELECT TO authenticated
USING (id = get_school_id(auth.uid()));

DROP POLICY IF EXISTS "Super admins can view all schools" ON public.schools;
CREATE POLICY "Super admins can view all schools"
ON public.schools FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "School admins can update their school" ON public.schools;
CREATE POLICY "School admins can update their school"
ON public.schools FOR UPDATE TO authenticated
USING (id = get_school_id(auth.uid()) AND has_role(auth.uid(), 'school_admin'))
WITH CHECK (id = get_school_id(auth.uid()));

-- Fix subscriptions select/update policies
DROP POLICY IF EXISTS "Users can view their school subscription" ON public.subscriptions;
CREATE POLICY "Users can view their school subscription"
ON public.subscriptions FOR SELECT TO authenticated
USING (school_id = get_school_id(auth.uid()));

DROP POLICY IF EXISTS "Super admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Super admins can view all subscriptions"
ON public.subscriptions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "School admins can update their subscription" ON public.subscriptions;
CREATE POLICY "School admins can update their subscription"
ON public.subscriptions FOR UPDATE TO authenticated
USING (school_id = get_school_id(auth.uid()) AND has_role(auth.uid(), 'school_admin'));
