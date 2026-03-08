
-- Timetable slots table
CREATE TABLE public.timetable_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Timetable select" ON public.timetable_slots FOR SELECT TO authenticated
  USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Timetable insert" ON public.timetable_slots FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Timetable update" ON public.timetable_slots FOR UPDATE TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Timetable delete" ON public.timetable_slots FOR DELETE TO authenticated
  USING (school_id = public.get_school_id(auth.uid()));

-- Exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'midterm',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  exam_date DATE,
  max_score NUMERIC NOT NULL DEFAULT 100,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exams select" ON public.exams FOR SELECT TO authenticated
  USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Exams insert" ON public.exams FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Exams update" ON public.exams FOR UPDATE TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Exams delete" ON public.exams FOR DELETE TO authenticated
  USING (school_id = public.get_school_id(auth.uid()));

-- Storage bucket for school logos
INSERT INTO storage.buckets (id, name, public) VALUES ('school-logos', 'school-logos', true);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload logos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'school-logos');
CREATE POLICY "Anyone can view logos" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'school-logos');
CREATE POLICY "School admins can update logos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'school-logos');
CREATE POLICY "School admins can delete logos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'school-logos');

-- Triggers for updated_at
CREATE TRIGGER update_timetable_slots_updated_at BEFORE UPDATE ON public.timetable_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
