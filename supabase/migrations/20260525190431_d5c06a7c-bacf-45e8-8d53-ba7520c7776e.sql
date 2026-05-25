
-- 1) Remove open self-assignment of roles. Signup uses SECURITY DEFINER fn which bypasses RLS.
DROP POLICY IF EXISTS "Allow role assignment during signup" ON public.user_roles;

-- 2) Realtime channel authorization (scope by school_id or user_id in topic)
-- Topic conventions to use from client:
--   notifications:    "notifications:<user_id>"
--   direct_messages:  "dm:<user_id>"  (subscribe to your own inbox)
--   school broadcast: "school:<school_id>"
DROP POLICY IF EXISTS "Authenticated can read own realtime topics" ON realtime.messages;
CREATE POLICY "Authenticated can read own realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() = 'notifications:' || auth.uid()::text)
  OR (realtime.topic() = 'dm:' || auth.uid()::text)
  OR (realtime.topic() = 'school:' || public.get_school_id(auth.uid())::text)
);

-- 3) Storage: school-logos bucket — path-based ownership + admin role check
-- Path convention: "<school_id>/<filename>"
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins can update logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view logos" ON storage.objects;

CREATE POLICY "Public can view school logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-logos');

CREATE POLICY "School admins can upload own school logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-logos'
  AND public.has_role(auth.uid(), 'school_admin'::public.app_role)
  AND (storage.foldername(name))[1] = public.get_school_id(auth.uid())::text
);

CREATE POLICY "School admins can update own school logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-logos'
  AND public.has_role(auth.uid(), 'school_admin'::public.app_role)
  AND (storage.foldername(name))[1] = public.get_school_id(auth.uid())::text
);

CREATE POLICY "School admins can delete own school logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-logos'
  AND public.has_role(auth.uid(), 'school_admin'::public.app_role)
  AND (storage.foldername(name))[1] = public.get_school_id(auth.uid())::text
);

-- 4) Lock down SECURITY DEFINER / helper functions — revoke from anon & public
REVOKE EXECUTE ON FUNCTION public.complete_school_registration(uuid, text, text, text, text, public.subscription_plan) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.accept_invitation(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_school_id(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.belongs_to_school(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 5) Hide tables from anonymous GraphQL/REST discovery (RLS still protects authenticated reads)
REVOKE SELECT ON
  public.announcements, public.attendance, public.audit_logs, public.classes,
  public.direct_messages, public.exams, public.fees, public.grades,
  public.invitations, public.library_books, public.library_borrows,
  public.notifications, public.profiles, public.schools, public.students,
  public.subjects, public.subscriptions, public.teachers,
  public.timetable_slots, public.transport_assignments, public.transport_buses,
  public.user_roles
FROM anon;
