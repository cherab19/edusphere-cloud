
CREATE OR REPLACE FUNCTION public.complete_school_registration(
  _user_id uuid,
  _school_name text,
  _school_email text,
  _school_phone text,
  _admin_name text,
  _plan subscription_plan
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _school_id uuid;
BEGIN
  -- Create school
  INSERT INTO schools (name, email, phone)
  VALUES (_school_name, _school_email, _school_phone)
  RETURNING id INTO _school_id;

  -- Create profile
  INSERT INTO profiles (user_id, school_id, full_name)
  VALUES (_user_id, _school_id, _admin_name);

  -- Assign school_admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (_user_id, 'school_admin');

  -- Create subscription
  INSERT INTO subscriptions (school_id, plan, status)
  VALUES (_school_id, _plan, 'trialing');

  RETURN _school_id;
END;
$$;
