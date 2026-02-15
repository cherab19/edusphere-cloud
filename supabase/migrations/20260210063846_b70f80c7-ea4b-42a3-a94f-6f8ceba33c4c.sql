
-- ==========================================
-- PHASE 1: CORE SAAS FOUNDATION
-- ==========================================

-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'student', 'parent', 'accountant', 'staff');

-- 2. Subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('starter', 'pro', 'enterprise');

-- 3. Subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled', 'trialing');

-- ==========================================
-- SCHOOLS TABLE
-- ==========================================
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SUBSCRIPTIONS TABLE
-- ==========================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'starter',
  status subscription_status NOT NULL DEFAULT 'trialing',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(school_id)
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PROFILES TABLE
-- ==========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- USER ROLES TABLE (separate from profiles!)
-- ==========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SECURITY DEFINER FUNCTIONS (avoid RLS recursion)
-- ==========================================

-- Get user's school_id
CREATE OR REPLACE FUNCTION public.get_school_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user belongs to a school
CREATE OR REPLACE FUNCTION public.belongs_to_school(_user_id UUID, _school_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = _user_id AND school_id = _school_id
  )
$$;

-- ==========================================
-- RLS POLICIES: SCHOOLS
-- ==========================================
CREATE POLICY "Users can view their own school"
  ON public.schools FOR SELECT TO authenticated
  USING (id = public.get_school_id(auth.uid()));

CREATE POLICY "Super admins can view all schools"
  ON public.schools FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins can update their school"
  ON public.schools FOR UPDATE TO authenticated
  USING (id = public.get_school_id(auth.uid()) AND public.has_role(auth.uid(), 'school_admin'));

-- Allow insert during onboarding (service role handles this via edge function later)
CREATE POLICY "Allow school creation during signup"
  ON public.schools FOR INSERT TO authenticated
  WITH CHECK (true);

-- ==========================================
-- RLS POLICIES: SUBSCRIPTIONS
-- ==========================================
CREATE POLICY "Users can view their school subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (school_id = public.get_school_id(auth.uid()));

CREATE POLICY "Super admins can view all subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Allow subscription creation during signup"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "School admins can update their subscription"
  ON public.subscriptions FOR UPDATE TO authenticated
  USING (school_id = public.get_school_id(auth.uid()) AND public.has_role(auth.uid(), 'school_admin'));

-- ==========================================
-- RLS POLICIES: PROFILES
-- ==========================================
CREATE POLICY "Users can view profiles in their school"
  ON public.profiles FOR SELECT TO authenticated
  USING (school_id = public.get_school_id(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow profile creation during signup"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ==========================================
-- RLS POLICIES: USER ROLES
-- ==========================================
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow role assignment during signup"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "School admins can view roles in their school"
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = public.user_roles.user_id
        AND p.school_id = public.get_school_id(auth.uid())
    )
    AND public.has_role(auth.uid(), 'school_admin')
  );

CREATE POLICY "School admins can assign roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'school_admin')
    AND public.belongs_to_school(public.user_roles.user_id, public.get_school_id(auth.uid()))
  );

-- ==========================================
-- PHASE 2 & 3: ERP TABLES
-- ==========================================

-- STUDENTS
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male','female','other')),
  date_of_birth DATE,
  grade_class TEXT,
  parent_contact TEXT,
  admission_date DATE DEFAULT CURRENT_DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for students"
  ON public.students FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- TEACHERS
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  subject_specialty TEXT,
  phone TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for teachers"
  ON public.teachers FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- CLASSES
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  class_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for classes"
  ON public.classes FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- SUBJECTS
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for subjects"
  ON public.subjects FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- ATTENDANCE
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present','absent','late')),
  marked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for attendance"
  ON public.attendance FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- GRADES
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  remark TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for grades"
  ON public.grades FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- FEES
CREATE TABLE public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  total_due NUMERIC(10,2) NOT NULL,
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid','unpaid','partial')),
  due_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for fees"
  ON public.fees FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- LIBRARY BOOKS
CREATE TABLE public.library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  copies_available INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for library_books"
  ON public.library_books FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- LIBRARY BORROWS
CREATE TABLE public.library_borrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
  return_date DATE,
  returned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.library_borrows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for library_borrows"
  ON public.library_borrows FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- TRANSPORT BUSES
CREATE TABLE public.transport_buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  bus_number TEXT NOT NULL,
  driver_name TEXT,
  route TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transport_buses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for transport_buses"
  ON public.transport_buses FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- TRANSPORT ASSIGNMENTS
CREATE TABLE public.transport_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  bus_id UUID NOT NULL REFERENCES public.transport_buses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);
ALTER TABLE public.transport_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for transport_assignments"
  ON public.transport_assignments FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all','teachers','students','parents')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for announcements"
  ON public.announcements FOR ALL TO authenticated
  USING (school_id = public.get_school_id(auth.uid()))
  WITH CHECK (school_id = public.get_school_id(auth.uid()));

-- ==========================================
-- UPDATED_AT TRIGGER FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON public.fees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_library_books_updated_at BEFORE UPDATE ON public.library_books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transport_buses_updated_at BEFORE UPDATE ON public.transport_buses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
