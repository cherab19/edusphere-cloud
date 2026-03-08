import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, BookOpen, ClipboardCheck, DollarSign, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudentLink { id: string; full_name: string; }

const ParentPortal = () => {
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const isParent = roles.includes("parent");

  // For parent role, fetch students linked to their user (via parent_contact or user association)
  // For demo, we show all students in the school - in production this would be filtered
  const { schoolId } = useAuth();

  const { data: students = [] } = useQuery({
    queryKey: ["parent_students", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      // Parents see students linked to them - for now show all (would filter by parent_contact in prod)
      const { data } = await supabase.from("students").select("id, full_name, grade_class, gender, date_of_birth")
        .eq("school_id", schoolId);
      return data ?? [];
    },
    enabled: !!schoolId,
  });

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const studentId = selectedStudent || students[0]?.id;

  const { data: grades = [] } = useQuery({
    queryKey: ["parent_grades", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await supabase.from("grades").select("id, score, exam_type, subject_id, created_at, subjects(name)")
        .eq("student_id", studentId);
      return data ?? [];
    },
    enabled: !!studentId,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["parent_attendance", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await supabase.from("attendance").select("id, date, status")
        .eq("student_id", studentId)
        .order("date", { ascending: false })
        .limit(30);
      return data ?? [];
    },
    enabled: !!studentId,
  });

  const { data: fees = [] } = useQuery({
    queryKey: ["parent_fees", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await supabase.from("fees").select("id, description, total_due, paid_amount, status, due_date")
        .eq("student_id", studentId)
        .order("due_date", { ascending: false });
      return data ?? [];
    },
    enabled: !!studentId,
  });

  const presentDays = attendance.filter(a => a.status === "present").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 0;
  const avgGrade = grades.length > 0 ? (grades.reduce((a, g) => a + Number(g.score), 0) / grades.length).toFixed(1) : "—";
  const totalOwed = fees.reduce((a, f) => a + Number(f.total_due) - Number(f.paid_amount), 0);

  const student = students.find(s => s.id === studentId);

  const statusColor = (s: string) => {
    switch (s) {
      case "paid": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "partial": return "bg-amber-500/10 text-amber-600 border-amber-200";
      default: return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Parent Portal</h1>
            <p className="text-muted-foreground text-sm">View your child's academic progress</p>
          </div>
          {students.length > 1 && (
            <Select value={studentId} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-64 rounded-xl">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Student Info */}
        {student && (
          <Card className="p-5 rounded-xl shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                {student.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">{student.full_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {student.grade_class ?? "No class"} • {student.gender}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-xl shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Grade</p>
                <p className="text-xl font-display font-bold">{avgGrade}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 rounded-xl shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-xl font-display font-bold">{attendanceRate}%</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 rounded-xl shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance Due</p>
                <p className="text-xl font-display font-bold">ETB {totalOwed.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="grades">
          <TabsList className="rounded-xl">
            <TabsTrigger value="grades" className="rounded-lg">Grades</TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-lg">Attendance</TabsTrigger>
            <TabsTrigger value="fees" className="rounded-lg">Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="mt-4">
            <Card className="rounded-xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No grades recorded</TableCell></TableRow>
                  ) : grades.map((g: any) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.subjects?.name ?? "—"}</TableCell>
                      <TableCell className="capitalize">{g.exam_type}</TableCell>
                      <TableCell>
                        <Badge variant={Number(g.score) >= 70 ? "default" : "destructive"} className="rounded-md">
                          {g.score}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(g.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="mt-4">
            <Card className="rounded-xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-8 text-muted-foreground">No attendance recorded</TableCell></TableRow>
                  ) : attendance.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === "present" ? "default" : "destructive"} className="capitalize rounded-md">
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="mt-4">
            <Card className="rounded-xl shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No fee records</TableCell></TableRow>
                  ) : fees.map((f: any) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.description ?? "School Fee"}</TableCell>
                      <TableCell>ETB {Number(f.total_due).toLocaleString()}</TableCell>
                      <TableCell>ETB {Number(f.paid_amount).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">ETB {(Number(f.total_due) - Number(f.paid_amount)).toLocaleString()}</TableCell>
                      <TableCell><Badge className={`${statusColor(f.status)} capitalize rounded-md`}>{f.status}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{f.due_date ? new Date(f.due_date).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ParentPortal;
