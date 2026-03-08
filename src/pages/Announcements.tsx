import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Bell, Calendar, Pencil, Trash2 } from "lucide-react";
import { useSchoolQuery, useSchoolMutation } from "@/hooks/useSchoolData";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { sendNotification } from "@/lib/notifications";

interface Announcement { id: string; title: string; content: string; target_audience: string; created_at: string; created_by: string | null; school_id: string; }

const audienceColor: Record<string, string> = {
  all: "bg-primary/10 text-primary",
  parents: "bg-warning/10 text-warning",
  teachers: "bg-accent text-accent-foreground",
  students: "bg-success/10 text-success",
};

const emptyForm = { title: "", content: "", target_audience: "all" };

const Announcements = () => {
  const { data: announcements = [], isLoading } = useSchoolQuery<Announcement>("announcements", "announcements");
  const { insert, update, remove } = useSchoolMutation("announcements", "announcements");
  const { user, schoolId } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({ title: a.title, content: a.content, target_audience: a.target_audience });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const vals = { ...form, created_by: user?.id ?? null };
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...vals });
    } else {
      await insert.mutateAsync(vals);
      // Send in-app notification to all school members
      if (schoolId) {
        try {
          await sendNotification({
            schoolId,
            title: `📢 ${form.title}`,
            message: form.content.slice(0, 100) + (form.content.length > 100 ? "…" : ""),
            type: "announcement",
            link: "/announcements",
          });
          toast({ title: "Announcement published", description: "All school members have been notified." });
        } catch {
          toast({ title: "Published", description: "Announcement saved but some notifications may have failed." });
        }
      }
    }
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Announcements</h1>
            <p className="text-muted-foreground text-sm">Broadcast messages to your school community</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> New Announcement</Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : announcements.length === 0 ? (
          <Card className="p-8 rounded-xl shadow-card text-center text-muted-foreground">No announcements yet.</Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <Card key={a.id} className="p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{a.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{a.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(a.created_at).toLocaleDateString()}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${audienceColor[a.target_audience] ?? ""}`}>{a.target_audience}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(a.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Announcement" : "New Announcement"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Content *</Label><Textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <div><Label>Target Audience</Label>
              <Select value={form.target_audience} onValueChange={(v) => setForm({ ...form, target_audience: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={!form.title || !form.content}>
              {editing ? "Update" : "Publish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete announcement?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (deleteId) await remove.mutateAsync(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Announcements;
