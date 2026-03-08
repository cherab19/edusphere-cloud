import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ExamManagement = () => {
  const { schoolId } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["exams", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("exams")
        .select("*, subjects(name), classes(name)")
        .eq("school_id", schoolId)
        .order("exam_date", { ascending: false });
      return data ?? [];
    },
    enabled: !!schoolId,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects_list", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("subjects").select("id, name").eq("school_id", schoolId);
      return data ?? [];
    },
    enabled: !!schoolId,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["classes_list", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("classes").select("id, name").eq("school_id", schoolId);
      return data ?? [];
    },
    enabled: !!schoolId,
  });

  const [form, setForm] = useState({
    name: "", exam_type: "midterm", subject_id: "", class_id: "",
    exam_date: "", max_score: "100", description: "",
  });

  const addExam = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("exams").insert({
        school_id: schoolId!,
        name: form.name,
        exam_type: form.exam_type,
        subject_id: form.subject_id || null,
        class_id: form.class_id || null,
        exam_date: form.exam_date || null,
        max_score: parseFloat(form.max_score) || 100,
        description: form.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams"] });
      setDialogOpen(false);
      setForm({ name: "", exam_type: "midterm", subject_id: "", class_id: "", exam_date: "", max_score: "100", description: "" });
      toast({ title: "Exam created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteExam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams"] });
      toast({ title: "Exam deleted" });
    },
  });

  const typeColor = (t: string) => {
    switch (t) {
      case "final": return "bg-destructive/10 text-destructive border-destructive/20";
      case "midterm": return "bg-primary/10 text-primary border-primary/20";
      case "quiz": return "bg-amber-500/10 text-amber-600 border-amber-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Exam Management</h1>
            <p className="text-muted-foreground text-sm">Create and manage exams</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Create Exam</Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl">
              <DialogHeader><DialogTitle>Create Exam</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Exam Name</Label>
                  <Input className="rounded-xl" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Midterm Mathematics" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.exam_type} onValueChange={v => setForm({ ...form, exam_type: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="midterm">Midterm</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Score</Label>
                    <Input type="number" className="rounded-xl" value={form.max_score} onChange={e => setForm({ ...form, max_score: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" className="rounded-xl" value={form.exam_date} onChange={e => setForm({ ...form, exam_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={form.subject_id} onValueChange={v => setForm({ ...form, subject_id: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={form.class_id} onValueChange={v => setForm({ ...form, class_id: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea className="rounded-xl" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional notes..." />
                </div>
                <Button className="w-full rounded-xl" onClick={() => addExam.mutate()} disabled={addExam.isPending || !form.name}>
                  {addExam.isPending ? "Creating…" : "Create Exam"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-xl shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Max Score</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No exams created yet</TableCell></TableRow>
              ) : exams.map((exam: any) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.name}</TableCell>
                  <TableCell><Badge className={`${typeColor(exam.exam_type)} capitalize rounded-md`}>{exam.exam_type}</Badge></TableCell>
                  <TableCell>{exam.subjects?.name ?? "—"}</TableCell>
                  <TableCell>{exam.classes?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>{exam.max_score}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => deleteExam.mutate(exam.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ExamManagement;
