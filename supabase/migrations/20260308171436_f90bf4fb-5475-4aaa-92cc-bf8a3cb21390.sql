
-- Create invitations table
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(school_id, email)
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- School admins can view invitations for their school
CREATE POLICY "School admins can view invitations"
  ON public.invitations FOR SELECT
  USING (school_id = get_school_id(auth.uid()) AND has_role(auth.uid(), 'school_admin'));

-- School admins can insert invitations for their school
CREATE POLICY "School admins can insert invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (school_id = get_school_id(auth.uid()) AND has_role(auth.uid(), 'school_admin'));

-- School admins can update invitations for their school
CREATE POLICY "School admins can update invitations"
  ON public.invitations FOR UPDATE
  USING (school_id = get_school_id(auth.uid()) AND has_role(auth.uid(), 'school_admin'));

-- School admins can delete invitations for their school
CREATE POLICY "School admins can delete invitations"
  ON public.invitations FOR DELETE
  USING (school_id = get_school_id(auth.uid()) AND has_role(auth.uid(), 'school_admin'));

-- Function to process invitation acceptance
CREATE OR REPLACE FUNCTION public.accept_invitation(_user_id uuid, _email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _inv RECORD;
BEGIN
  -- Find pending invitation
  SELECT * INTO _inv FROM invitations
  WHERE email = _email AND status = 'pending'
  LIMIT 1;

  IF _inv IS NULL THEN
    RETURN;
  END IF;

  -- Create profile if not exists
  INSERT INTO profiles (user_id, school_id, full_name)
  VALUES (_user_id, _inv.school_id, split_part(_email, '@', 1))
  ON CONFLICT DO NOTHING;

  -- Assign role
  INSERT INTO user_roles (user_id, role)
  VALUES (_user_id, _inv.role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Mark invitation as accepted
  UPDATE invitations SET status = 'accepted', accepted_at = now()
  WHERE id = _inv.id;
END;
$$;
