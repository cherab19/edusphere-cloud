import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type ClassRow = Tables<"classes">;

const emptyForm = { name: "", grade_level: "" };

const Classes = () => {
  const { schoolId } = useAuth();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    if (!schoolId) return;
    const { data } = await supabase.from("classes").select("*").eq("school_id", schoolId).order("grade_level");
    setClasses(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [schoolId]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: ClassRow) => { setEditing(c); setForm({ name: c.name, grade_level: c.grade_level }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!schoolId || !form.name.trim() || !form.grade_level.trim()) { toast.error("Name and grade level are required"); return; }
    if (editing) {
      const { error } = await supabase.from("classes").update({ name: form.name, grade_level: form.grade_level }).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Class updated");
    } else {
      const { error } = await supabase.from("classes").insert({ school_id: schoolId, name: form.name, grade_level: form.grade_level });
      if (error) { toast.error(error.message); return; }
      toast.success("Class added");
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!editing) return;
    const { error } = await supabase.from("classes").delete().eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Class deleted");
    setDeleteOpen(false);
    setEditing(null);
    fetchData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Classes</h1>
            <p className="text-muted-foreground text-sm">{classes.length} classes</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Class</Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading…</p>
        ) : classes.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No classes yet. Add your first class.</p>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setEditing(c); setDeleteOpen(true); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Class" : "Add Class"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Class Name *</Label><Input placeholder="e.g. Grade 10 - A" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Grade Level *</Label><Input placeholder="e.g. Grade 10" value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Save Changes" : "Add Class"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{editing?.name}"? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Classes;
