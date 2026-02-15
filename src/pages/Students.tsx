import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Student = Tables<"students">;

const emptyForm = { full_name: "", gender: "Male", date_of_birth: "", grade_class: "", parent_contact: "" };

const Students = () => {
  const { schoolId } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetch = async () => {
    if (!schoolId) return;
    const { data } = await supabase.from("students").select("*").eq("school_id", schoolId).order("full_name");
    setStudents(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [schoolId]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({ full_name: s.full_name, gender: s.gender, date_of_birth: s.date_of_birth ?? "", grade_class: s.grade_class ?? "", parent_contact: s.parent_contact ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!schoolId || !form.full_name.trim()) { toast.error("Name is required"); return; }
    if (editing) {
      const { error } = await supabase.from("students").update({ full_name: form.full_name, gender: form.gender, date_of_birth: form.date_of_birth || null, grade_class: form.grade_class || null, parent_contact: form.parent_contact || null }).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Student updated");
    } else {
      const { error } = await supabase.from("students").insert({ school_id: schoolId, full_name: form.full_name, gender: form.gender, date_of_birth: form.date_of_birth || null, grade_class: form.grade_class || null, parent_contact: form.parent_contact || null });
      if (error) { toast.error(error.message); return; }
      toast.success("Student added");
    }
    setDialogOpen(false);
    fetch();
  };

  const handleDelete = async () => {
    if (!editing) return;
    const { error } = await supabase.from("students").delete().eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Student deleted");
    setDeleteOpen(false);
    setEditing(null);
    fetch();
  };

  const filtered = students.filter((s) => s.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Students</h1>
            <p className="text-muted-foreground text-sm">{students.length} students enrolled</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Student</Button>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-10 h-10 rounded-lg" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Gender</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date of Birth</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Grade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Parent Contact</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No students found</td></tr>
                ) : filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{s.full_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.gender}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.date_of_birth ?? "—"}</td>
                    <td className="py-3 px-4"><span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-md text-xs font-medium">{s.grade_class ?? "—"}</span></td>
                    <td className="py-3 px-4 text-muted-foreground">{s.parent_contact ?? "—"}</td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => { setEditing(s); setDeleteOpen(true); }}><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Student" : "Add Student"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></div>
            <div><Label>Grade / Class</Label><Input value={form.grade_class} onChange={(e) => setForm({ ...form, grade_class: e.target.value })} /></div>
            <div><Label>Parent Contact</Label><Input value={form.parent_contact} onChange={(e) => setForm({ ...form, parent_contact: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Save Changes" : "Add Student"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {editing?.full_name}? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Students;
