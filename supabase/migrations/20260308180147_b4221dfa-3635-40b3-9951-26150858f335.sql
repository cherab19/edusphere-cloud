CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School admins can view audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (
    school_id = get_school_id(auth.uid())
    AND has_role(auth.uid(), 'school_admin')
  );

CREATE POLICY "School members can insert audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (school_id = get_school_id(auth.uid()));

CREATE INDEX idx_audit_logs_school ON public.audit_logs(school_id, created_at DESC);