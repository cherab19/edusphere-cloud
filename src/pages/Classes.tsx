import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSchoolQuery, useSchoolMutation } from "@/hooks/useSchoolData";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassRecord { id: string; name: string; grade_level: string; class_teacher_id: string | null; school_id: string; }
interface Teacher { id: string; full_name: string; }

const emptyForm = { name: "", grade_level: "", class_teacher_id: "" };

const Classes = () => {
  const { data: classes = [], isLoading } = useSchoolQuery<ClassRecord>("classes", "classes");
  const { data: teachers = [] } = useSchoolQuery<Teacher>("teachers", "teachers");
  const { insert, update, remove } = useSchoolMutation("classes", "classes");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ClassRecord | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: ClassRecord) => {
    setEditing(c);
    setForm({ name: c.name, grade_level: c.grade_level, class_teacher_id: c.class_teacher_id ?? "" });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const vals = { ...form, class_teacher_id: form.class_teacher_id || null };
    if (editing) await update.mutateAsync({ id: editing.id, ...vals });
    else await insert.mutateAsync(vals);
    setDialogOpen(false);
  };

  const teacherName = (id: string | null) => teachers.find((t) => t.id === id)?.full_name ?? "Unassigned";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Classes</h1>
            <p className="text-muted-foreground text-sm">Manage classes and sections</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Class</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : classes.length === 0 ? (
          <Card className="p-8 rounded-xl shadow-card text-center text-muted-foreground">No classes yet. Add your first class.</Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((c) => (
              <Card key={c.id} className="p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-semibold text-lg">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">{c.grade_level}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">Class Teacher</p>
                  <p className="text-sm font-medium mt-0.5">{teacherName(c.class_teacher_id)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Class" : "Add Class"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Class Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Grade 10 - A" /></div>
            <div><Label>Grade Level *</Label><Input value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} placeholder="e.g. Grade 10" /></div>
            <div><Label>Class Teacher</Label>
              <Select value={form.class_teacher_id} onValueChange={(v) => setForm({ ...form, class_teacher_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={!form.name || !form.grade_level}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete class?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (deleteId) await remove.mutateAsync(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Classes;
