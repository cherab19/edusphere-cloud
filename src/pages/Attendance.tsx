import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchoolQuery, useSchoolMutation } from "@/hooks/useSchoolData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface Student { id: string; full_name: string; grade_class: string | null; }
interface AttendanceRecord { id: string; student_id: string; date: string; status: string; school_id: string; }

const statusStyles: Record<string, string> = {
  present: "bg-success/10 text-success border-0",
  absent: "bg-destructive/10 text-destructive border-0",
  late: "bg-warning/10 text-warning border-0",
};

const Attendance = () => {
  const { schoolId, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const { data: students = [] } = useSchoolQuery<Student>("students", "students", { orderBy: "full_name" });
  const qc = useQueryClient();

  const { data: records = [] } = useQuery({
    queryKey: ["attendance", schoolId, selectedDate],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase.from("attendance").select("*").eq("school_id", schoolId).eq("date", selectedDate);
      if (error) throw error;
      return (data ?? []) as AttendanceRecord[];
    },
    enabled: !!schoolId,
  });

  const getStatus = (studentId: string) => records.find((r) => r.student_id === studentId)?.status ?? null;

  const markAttendance = async (studentId: string, status: string) => {
    if (!schoolId || !user) return;
    const existing = records.find((r) => r.student_id === studentId);
    if (existing) {
      await supabase.from("attendance").update({ status }).eq("id", existing.id);
    } else {
      await supabase.from("attendance").insert({ student_id: studentId, school_id: schoolId, date: selectedDate, status, marked_by: user.id });
    }
    qc.invalidateQueries({ queryKey: ["attendance"] });
  };

  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Attendance</h1>
            <p className="text-muted-foreground text-sm">Mark daily attendance</p>
          </div>
          <Input type="date" className="w-auto" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 rounded-xl shadow-card text-center">
            <p className="text-3xl font-display font-bold text-success">{present}</p>
            <p className="text-sm text-muted-foreground mt-1">Present</p>
          </Card>
          <Card className="p-5 rounded-xl shadow-card text-center">
            <p className="text-3xl font-display font-bold text-destructive">{absent}</p>
            <p className="text-sm text-muted-foreground mt-1">Absent</p>
          </Card>
          <Card className="p-5 rounded-xl shadow-card text-center">
            <p className="text-3xl font-display font-bold text-warning">{late}</p>
            <p className="text-sm text-muted-foreground mt-1">Late</p>
          </Card>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Grade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No students. Add students first.</td></tr>
                ) : students.map((s) => {
                  const status = getStatus(s.id);
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{s.full_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{s.grade_class ?? "—"}</td>
                      <td className="py-3 px-4">
                        {status ? <Badge variant="outline" className={`capitalize ${statusStyles[status]}`}>{status}</Badge> : <span className="text-muted-foreground text-xs">Not marked</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {["present", "absent", "late"].map((st) => (
                            <Button key={st} size="sm" variant={status === st ? "default" : "outline"} className="text-xs h-7 capitalize" onClick={() => markAttendance(s.id, st)}>{st}</Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
