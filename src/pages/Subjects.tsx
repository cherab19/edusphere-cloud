import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Subject = Tables<"subjects">;

const emptyForm = { name: "", code: "" };

const Subjects = () => {
  const { schoolId } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    if (!schoolId) return;
    const { data } = await supabase.from("subjects").select("*").eq("school_id", schoolId).order("name");
    setSubjects(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [schoolId]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (s: Subject) => { setEditing(s); setForm({ name: s.name, code: s.code ?? "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!schoolId || !form.name.trim()) { toast.error("Subject name is required"); return; }
    const payload = { name: form.name, code: form.code || null };
    if (editing) {
      const { error } = await supabase.from("subjects").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Subject updated");
    } else {
      const { error } = await supabase.from("subjects").insert({ ...payload, school_id: schoolId });
      if (error) { toast.error(error.message); return; }
      toast.success("Subject added");
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!editing) return;
    const { error } = await supabase.from("subjects").delete().eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Subject deleted");
    setDeleteOpen(false);
    setEditing(null);
    fetchData();
  };

  const filtered = subjects.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Subjects</h1>
            <p className="text-muted-foreground text-sm">{subjects.length} subjects registered</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Subject</Button>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search subjects..." className="pl-10 h-10 rounded-lg" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No subjects found</td></tr>
                ) : filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{s.name}</td>
                    <td className="py-3 px-4"><span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs font-mono">{s.code ?? "—"}</span></td>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Subject" : "Add Subject"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Subject Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Code</Label><Input placeholder="e.g. MATH" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Save Changes" : "Add Subject"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{editing?.name}"? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Subjects;
