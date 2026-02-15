import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Teacher = Tables<"teachers">;

const emptyForm = { full_name: "", subject_specialty: "", phone: "", hire_date: "" };

const Teachers = () => {
  const { schoolId } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    if (!schoolId) return;
    const { data } = await supabase.from("teachers").select("*").eq("school_id", schoolId).order("full_name");
    setTeachers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [schoolId]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({ full_name: t.full_name, subject_specialty: t.subject_specialty ?? "", phone: t.phone ?? "", hire_date: t.hire_date ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!schoolId || !form.full_name.trim()) { toast.error("Name is required"); return; }
    const payload = { full_name: form.full_name, subject_specialty: form.subject_specialty || null, phone: form.phone || null, hire_date: form.hire_date || null };
    if (editing) {
      const { error } = await supabase.from("teachers").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Teacher updated");
    } else {
      const { error } = await supabase.from("teachers").insert({ ...payload, school_id: schoolId });
      if (error) { toast.error(error.message); return; }
      toast.success("Teacher added");
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!editing) return;
    const { error } = await supabase.from("teachers").delete().eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Teacher deleted");
    setDeleteOpen(false);
    setEditing(null);
    fetchData();
  };

  const filtered = teachers.filter((t) => t.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Teachers</h1>
            <p className="text-muted-foreground text-sm">{teachers.length} teachers on staff</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Teacher</Button>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search teachers..." className="pl-10 h-10 rounded-lg" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hire Date</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No teachers found</td></tr>
                ) : filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{t.full_name}</td>
                    <td className="py-3 px-4"><span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-md text-xs font-medium">{t.subject_specialty ?? "—"}</span></td>
                    <td className="py-3 px-4 text-muted-foreground">{t.phone ?? "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">{t.hire_date ?? "—"}</td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => { setEditing(t); setDeleteOpen(true); }}><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Teacher" : "Add Teacher"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>Subject Specialty</Label><Input value={form.subject_specialty} onChange={(e) => setForm({ ...form, subject_specialty: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Hire Date</Label><Input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Save Changes" : "Add Teacher"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {editing?.full_name}? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Teachers;
