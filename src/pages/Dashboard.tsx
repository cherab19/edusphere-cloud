import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Users, GraduationCap, DollarSign, ClipboardCheck, BookOpen, TrendingUp } from "lucide-react";
import { useSchoolQuery } from "@/hooks/useSchoolData";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface Student { id: string; full_name: string; grade_class: string | null; gender: string; created_at: string; }
interface Teacher { id: string; full_name: string; }
interface Fee { id: string; paid_amount: number; total_due: number; status: string; }
interface AttendanceRecord { id: string; status: string; date: string; }
interface GradeRecord { id: string; score: number; exam_type: string; }

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))", "hsl(142, 76%, 36%)"];

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
      const { data } = await supabase.from("attendance").select("id, status").eq("school_id", schoolId).eq("date", today);
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
      const { data } = await supabase.from("attendance").select("id, status, date")
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
      const { data } = await supabase.from("grades").select("id, score, exam_type").eq("school_id", schoolId);
      return (data ?? []) as GradeRecord[];
    },
    enabled: !!schoolId,
  });

  const totalFees = fees.reduce((a, f) => a + Number(f.paid_amount), 0);
  const totalDue = fees.reduce((a, f) => a + Number(f.total_due), 0);
  const presentToday = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentToday / attendance.length) * 100) : 0;
  const loading = sl || tl || fl;

  // Gender distribution
  const genderData = [
    { name: "Male", value: students.filter(s => s.gender === "male" || s.gender === "Male").length },
    { name: "Female", value: students.filter(s => s.gender === "female" || s.gender === "Female").length },
  ].filter(d => d.value > 0);

  // Fee status distribution
  const feeStatusData = [
    { name: "Paid", value: fees.filter(f => f.status === "paid").length, fill: "hsl(142, 76%, 36%)" },
    { name: "Partial", value: fees.filter(f => f.status === "partial").length, fill: "hsl(var(--primary))" },
    { name: "Unpaid", value: fees.filter(f => f.status === "unpaid").length, fill: "hsl(var(--destructive))" },
  ].filter(d => d.value > 0);

  // Weekly attendance chart data
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyChartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayRecords = weeklyAttendance.filter(a => a.date === dateStr);
    const present = dayRecords.filter(a => a.status === "present").length;
    return { day: days[d.getDay()], present, absent: dayRecords.length - present };
  });

  // Grade distribution
  const gradeDistribution = [
    { range: "90-100", count: allGrades.filter(g => g.score >= 90).length },
    { range: "80-89", count: allGrades.filter(g => g.score >= 80 && g.score < 90).length },
    { range: "70-79", count: allGrades.filter(g => g.score >= 70 && g.score < 80).length },
    { range: "60-69", count: allGrades.filter(g => g.score >= 60 && g.score < 70).length },
    { range: "Below 60", count: allGrades.filter(g => g.score < 60).length },
  ];

  const stats = [
    { label: "Total Students", value: String(students.length), icon: Users, color: "text-primary" },
    { label: "Teachers", value: String(teachers.length), icon: GraduationCap, color: "text-primary" },
    { label: "Fee Collection", value: `ETB ${totalFees.toLocaleString()}`, icon: DollarSign, sub: totalDue > 0 ? `of ETB ${totalDue.toLocaleString()}` : undefined },
    { label: "Attendance Today", value: attendance.length > 0 ? `${attendanceRate}%` : "—", icon: ClipboardCheck, sub: attendance.length > 0 ? `${presentToday}/${attendance.length} present` : undefined },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening at your school.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) :
            stats.map((stat) => (
              <Card key={stat.label} className="p-5 rounded-xl shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-display font-bold">{stat.value}</p>
                    {stat.sub && <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-6 rounded-xl shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Weekly Attendance</h3>
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

          <Card className="p-6 rounded-xl shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Grade Distribution</h3>
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
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="p-6 rounded-xl shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Gender Distribution</h3>
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

          <Card className="p-6 rounded-xl shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Fee Status</h3>
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

          <Card className="p-6 rounded-xl shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Avg Grade</span>
                <span className="font-display font-bold">
                  {allGrades.length > 0 ? (allGrades.reduce((a, g) => a + Number(g.score), 0) / allGrades.length).toFixed(1) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Collection Rate</span>
                <span className="font-display font-bold">
                  {totalDue > 0 ? `${Math.round((totalFees / totalDue) * 100)}%` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Student-Teacher Ratio</span>
                <span className="font-display font-bold">
                  {teachers.length > 0 ? `${Math.round(students.length / teachers.length)}:1` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Total Exams Graded</span>
                <span className="font-display font-bold">{allGrades.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
