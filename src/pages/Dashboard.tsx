import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Users, GraduationCap, DollarSign, ClipboardCheck } from "lucide-react";
import { useSchoolQuery } from "@/hooks/useSchoolData";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Student { id: string; full_name: string; grade_class: string | null; created_at: string; }
interface Teacher { id: string; full_name: string; }
interface Fee { id: string; paid_amount: number; }
interface AttendanceRecord { id: string; status: string; }

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

  const totalFees = fees.reduce((a, f) => a + Number(f.paid_amount), 0);
  const presentToday = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentToday / attendance.length) * 100) : 0;
  const loading = sl || tl || fl;

  const recentStudents = [...students].slice(0, 5);

  const stats = [
    { label: "Total Students", value: String(students.length), icon: Users, color: "text-primary" },
    { label: "Teachers", value: String(teachers.length), icon: GraduationCap, color: "text-primary" },
    { label: "Fee Collection", value: `ETB ${totalFees.toLocaleString()}`, icon: DollarSign, color: "text-success" },
    { label: "Attendance Today", value: attendance.length > 0 ? `${attendanceRate}%` : "—", icon: ClipboardCheck, color: "text-warning" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening at your school.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) :
            stats.map((stat) => (
              <Card key={stat.label} className="p-5 rounded-xl shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-display font-bold">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
        </div>

        <Card className="p-6 rounded-xl shadow-card">
          <h3 className="font-display font-semibold text-lg mb-4">Recent Students</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Grade</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.length === 0 ? (
                  <tr><td colSpan={2} className="py-8 text-center text-muted-foreground">No students yet. Add your first student.</td></tr>
                ) : recentStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{student.full_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{student.grade_class ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
