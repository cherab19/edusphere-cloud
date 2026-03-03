
-- Fix all RESTRICTIVE policies to PERMISSIVE

-- ===== SCHOOLS =====
DROP POLICY IF EXISTS "Allow school creation during signup" ON public.schools;
DROP POLICY IF EXISTS "School admins can update their school" ON public.schools;
DROP POLICY IF EXISTS "Super admins can view all schools" ON public.schools;
DROP POLICY IF EXISTS "Users can view their own school" ON public.schools;

CREATE POLICY "Allow school creation during signup" ON public.schools FOR INSERT TO authenticated WITH CHECK (public.get_school_id(auth.uid()) IS NULL);
CREATE POLICY "School admins can update their school" ON public.schools FOR UPDATE TO authenticated USING (id = public.get_school_id(auth.uid()) AND public.has_role(auth.uid(), 'school_admin')) WITH CHECK (id = public.get_school_id(auth.uid()));
CREATE POLICY "Super admins can view all schools" ON public.schools FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can view their own school" ON public.schools FOR SELECT TO authenticated USING (id = public.get_school_id(auth.uid()));

-- ===== PROFILES =====
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their school" ON public.profiles;

CREATE POLICY "Allow profile creation during signup" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view profiles in their school" ON public.profiles FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- ===== USER_ROLES =====
DROP POLICY IF EXISTS "Allow role assignment during signup" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can view roles in their school" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Allow role assignment during signup" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "School admins can assign roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'school_admin') AND public.belongs_to_school(user_id, public.get_school_id(auth.uid())));
CREATE POLICY "School admins can view roles in their school" ON public.user_roles FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = user_roles.user_id AND p.school_id = public.get_school_id(auth.uid())) AND public.has_role(auth.uid(), 'school_admin'));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ===== SUBSCRIPTIONS =====
DROP POLICY IF EXISTS "Allow subscription creation during signup" ON public.subscriptions;
DROP POLICY IF EXISTS "School admins can update their subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Super admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their school subscription" ON public.subscriptions;

CREATE POLICY "Allow subscription creation during signup" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "School admins can update their subscription" ON public.subscriptions FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid()) AND public.has_role(auth.uid(), 'school_admin'));
CREATE POLICY "Super admins can view all subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can view their school subscription" ON public.subscriptions FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- ===== TENANT TABLES (students, teachers, classes, subjects, attendance, grades, fees, library_books, library_borrows, transport_buses, transport_assignments, announcements) =====

-- STUDENTS
DROP POLICY IF EXISTS "Tenant isolation for students" ON public.students;
CREATE POLICY "Students select" ON public.students FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Students insert" ON public.students FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Students update" ON public.students FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Students delete" ON public.students FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- TEACHERS
DROP POLICY IF EXISTS "Tenant isolation for teachers" ON public.teachers;
CREATE POLICY "Teachers select" ON public.teachers FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Teachers insert" ON public.teachers FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Teachers update" ON public.teachers FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Teachers delete" ON public.teachers FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- CLASSES
DROP POLICY IF EXISTS "Tenant isolation for classes" ON public.classes;
CREATE POLICY "Classes select" ON public.classes FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Classes insert" ON public.classes FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Classes update" ON public.classes FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Classes delete" ON public.classes FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- SUBJECTS
DROP POLICY IF EXISTS "Tenant isolation for subjects" ON public.subjects;
CREATE POLICY "Subjects select" ON public.subjects FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Subjects insert" ON public.subjects FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Subjects update" ON public.subjects FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Subjects delete" ON public.subjects FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- ATTENDANCE
DROP POLICY IF EXISTS "Tenant isolation for attendance" ON public.attendance;
CREATE POLICY "Attendance select" ON public.attendance FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Attendance insert" ON public.attendance FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Attendance update" ON public.attendance FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Attendance delete" ON public.attendance FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- GRADES
DROP POLICY IF EXISTS "Tenant isolation for grades" ON public.grades;
CREATE POLICY "Grades select" ON public.grades FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Grades insert" ON public.grades FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Grades update" ON public.grades FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Grades delete" ON public.grades FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- FEES
DROP POLICY IF EXISTS "Tenant isolation for fees" ON public.fees;
CREATE POLICY "Fees select" ON public.fees FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Fees insert" ON public.fees FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Fees update" ON public.fees FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Fees delete" ON public.fees FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- LIBRARY_BOOKS
DROP POLICY IF EXISTS "Tenant isolation for library_books" ON public.library_books;
CREATE POLICY "Library books select" ON public.library_books FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Library books insert" ON public.library_books FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Library books update" ON public.library_books FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Library books delete" ON public.library_books FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- LIBRARY_BORROWS
DROP POLICY IF EXISTS "Tenant isolation for library_borrows" ON public.library_borrows;
CREATE POLICY "Library borrows select" ON public.library_borrows FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Library borrows insert" ON public.library_borrows FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Library borrows update" ON public.library_borrows FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Library borrows delete" ON public.library_borrows FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- TRANSPORT_BUSES
DROP POLICY IF EXISTS "Tenant isolation for transport_buses" ON public.transport_buses;
CREATE POLICY "Transport buses select" ON public.transport_buses FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Transport buses insert" ON public.transport_buses FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Transport buses update" ON public.transport_buses FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Transport buses delete" ON public.transport_buses FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- TRANSPORT_ASSIGNMENTS
DROP POLICY IF EXISTS "Tenant isolation for transport_assignments" ON public.transport_assignments;
CREATE POLICY "Transport assignments select" ON public.transport_assignments FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Transport assignments insert" ON public.transport_assignments FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Transport assignments update" ON public.transport_assignments FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Transport assignments delete" ON public.transport_assignments FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "Tenant isolation for announcements" ON public.announcements;
CREATE POLICY "Announcements select" ON public.announcements FOR SELECT TO authenticated USING (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Announcements insert" ON public.announcements FOR INSERT TO authenticated WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Announcements update" ON public.announcements FOR UPDATE TO authenticated USING (school_id = public.get_school_id(auth.uid())) WITH CHECK (school_id = public.get_school_id(auth.uid()));
CREATE POLICY "Announcements delete" ON public.announcements FOR DELETE TO authenticated USING (school_id = public.get_school_id(auth.uid()));
