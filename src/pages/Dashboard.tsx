import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Users, GraduationCap, DollarSign, ClipboardCheck } from "lucide-react";
import { useSchoolQuery } from "@/hooks/useSchoolData";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import AIInsightsWidget from "@/components/dashboard/AIInsightsWidget";
import SchoolAIChatbot from "@/components/dashboard/SchoolAIChatbot";
import { motion } from "framer-motion";

interface Student { id: string; full_name: string; grade_class: string | null; gender: string; created_at: string; }
interface Teacher { id: string; full_name: string; }
interface Fee { id: string; paid_amount: number; total_due: number; status: string; }
interface AttendanceRecord { id: string; status: string; date: string; student_id: string; }
interface GradeRecord { id: string; score: number; exam_type: string; student_id: string; }

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))", "hsl(142, 76%, 36%)"];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const Dashboard = () => {
  const { schoolId } = useAuth();
  const { data: students = [], isLoading: sl } = useSchoolQuery<Student>("students", "students");
  const { data: teachers = [], isLoading: tl } = useSchoolQuery<Teacher>("teachers", "teachers");
  const { data: fees = [], isLoading: fl } = useSchoolQuery<Fee>("fees", "fees");

  const today = new Date().toISOString().split("T")[0];
  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance_today", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("attendance").select("id, status, student_id").eq("school_id", schoolId).eq("date", today);
      return (data ?? []) as AttendanceRecord[];
    },
    enabled: !!schoolId,
  });

  const { data: weeklyAttendance = [] } = useQuery({
    queryKey: ["attendance_weekly", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data } = await supabase.from("attendance").select("id, status, date, student_id")
        .eq("school_id", schoolId)
        .gte("date", weekAgo.toISOString().split("T")[0]);
      return (data ?? []) as AttendanceRecord[];
    },
    enabled: !!schoolId,
  });

  const { data: allGrades = [] } = useQuery({
    queryKey: ["grades_all", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("grades").select("id, score, exam_type, student_id").eq("school_id", schoolId);
      return (data ?? []) as GradeRecord[];
    },
    enabled: !!schoolId,
  });

  const totalFees = fees.reduce((a, f) => a + Number(f.paid_amount), 0);
  const totalDue = fees.reduce((a, f) => a + Number(f.total_due), 0);
  const presentToday = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentToday / attendance.length) * 100) : 0;
  const loading = sl || tl || fl;

  const genderData = [
    { name: "Male", value: students.filter(s => s.gender === "male" || s.gender === "Male").length },
    { name: "Female", value: students.filter(s => s.gender === "female" || s.gender === "Female").length },
  ].filter(d => d.value > 0);

  const feeStatusData = [
    { name: "Paid", value: fees.filter(f => f.status === "paid").length, fill: "hsl(142, 76%, 36%)" },
    { name: "Partial", value: fees.filter(f => f.status === "partial").length, fill: "hsl(var(--primary))" },
    { name: "Unpaid", value: fees.filter(f => f.status === "unpaid").length, fill: "hsl(var(--destructive))" },
  ].filter(d => d.value > 0);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyChartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayRecords = weeklyAttendance.filter(a => a.date === dateStr);
    const present = dayRecords.filter(a => a.status === "present").length;
    return { day: days[d.getDay()], present, absent: dayRecords.length - present };
  });

  const gradeDistribution = [
    { range: "90-100", count: allGrades.filter(g => g.score >= 90).length },
    { range: "80-89", count: allGrades.filter(g => g.score >= 80 && g.score < 90).length },
    { range: "70-79", count: allGrades.filter(g => g.score >= 70 && g.score < 80).length },
    { range: "60-69", count: allGrades.filter(g => g.score >= 60 && g.score < 70).length },
    { range: "Below 60", count: allGrades.filter(g => g.score < 60).length },
  ];

  const stats = [
    { label: "Total Students", value: String(students.length), icon: Users, trend: "+12%" },
    { label: "Teachers", value: String(teachers.length), icon: GraduationCap, trend: "+3%" },
    { label: "Fee Collection", value: `ETB ${totalFees.toLocaleString()}`, icon: DollarSign, sub: totalDue > 0 ? `of ETB ${totalDue.toLocaleString()}` : undefined },
    { label: "Attendance Today", value: attendance.length > 0 ? `${attendanceRate}%` : "—", icon: ClipboardCheck, sub: attendance.length > 0 ? `${presentToday}/${attendance.length} present` : undefined },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20 lg:pb-0">
        <motion.div {...fadeIn}>
          <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening at your school.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) :
            stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Card className="p-4 lg:p-5 rounded-xl shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs lg:text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-xl lg:text-2xl font-display font-bold">{stat.value}</p>
                      {stat.sub && <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>}
                    </div>
                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
        </div>

        {/* AI Insights */}
        <AIInsightsWidget students={students} grades={allGrades} attendance={weeklyAttendance} />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <Card className="p-5 lg:p-6 rounded-xl shadow-card">
              <h3 className="font-display font-semibold text-base lg:text-lg mb-4">Weekly Attendance</h3>
              {weeklyAttendance.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">No attendance data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Present" />
                    <Bar dataKey="absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
            <Card className="p-5 lg:p-6 rounded-xl shadow-card">
              <h3 className="font-display font-semibold text-base lg:text-lg mb-4">Grade Distribution</h3>
              {allGrades.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">No grade data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="p-5 lg:p-6 rounded-xl shadow-card">
            <h3 className="font-display font-semibold text-base lg:text-lg mb-4">Gender Distribution</h3>
            {genderData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">No students yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-5 lg:p-6 rounded-xl shadow-card">
            <h3 className="font-display font-semibold text-base lg:text-lg mb-4">Fee Status</h3>
            {feeStatusData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">No fee records yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={feeStatusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {feeStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-5 lg:p-6 rounded-xl shadow-card">
            <h3 className="font-display font-semibold text-base lg:text-lg mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: "Avg Grade", value: allGrades.length > 0 ? (allGrades.reduce((a, g) => a + Number(g.score), 0) / allGrades.length).toFixed(1) : "—" },
                { label: "Collection Rate", value: totalDue > 0 ? `${Math.round((totalFees / totalDue) * 100)}%` : "—" },
                { label: "Student-Teacher Ratio", value: teachers.length > 0 ? `${Math.round(students.length / teachers.length)}:1` : "—" },
                { label: "Total Exams Graded", value: String(allGrades.length) },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="font-display font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <SchoolAIChatbot />
    </DashboardLayout>
  );
};

export default Dashboard;
