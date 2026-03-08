import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, Search, MoreHorizontal, Pencil, Trash2, Download, Bell } from "lucide-react";
import { downloadCSV } from "@/lib/csvExport";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSchoolQuery, useSchoolMutation } from "@/hooks/useSchoolData";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { sendNotification } from "@/lib/notifications";

interface Fee { id: string; student_id: string; total_due: number; paid_amount: number; status: string; due_date: string | null; description: string | null; school_id: string; }
interface Student { id: string; full_name: string; grade_class: string | null; }

const statusColor: Record<string, string> = {
  paid: "bg-success/10 text-success border-0",
  partial: "bg-warning/10 text-warning border-0",
  unpaid: "bg-destructive/10 text-destructive border-0",
};

const emptyForm = { student_id: "", total_due: "", paid_amount: "0", description: "", due_date: "", status: "unpaid" };

const Fees = () => {
  const { data: fees = [], isLoading } = useSchoolQuery<Fee>("fees", "fees");
  const { data: students = [] } = useSchoolQuery<Student>("students", "students");
  const { insert, update, remove } = useSchoolMutation("fees", "fees");
  const { schoolId } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Fee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [sendingReminders, setSendingReminders] = useState(false);

  const sendFeeReminders = async () => {
    if (!schoolId) return;
    setSendingReminders(true);
    try {
      const unpaidFees = fees.filter(f => f.status !== "paid");
      const studentIds = [...new Set(unpaidFees.map(f => f.student_id))];
      // Get user_ids for students who have accounts
      const studentsWithUsers = students.filter(s => studentIds.includes(s.id));

      await sendNotification({
        schoolId,
        title: "💰 Fee Payment Reminder",
        message: "You have outstanding fees. Please check the Fees section for details.",
        type: "fee_reminder",
        link: "/fees",
      });
      toast({ title: "Reminders sent", description: `Notified all school members about pending fees.` });
    } catch {
      toast({ title: "Error", description: "Failed to send reminders.", variant: "destructive" });
    } finally {
      setSendingReminders(false);
    }
  };

  const studentName = (id: string) => students.find((s) => s.id === id)?.full_name ?? "—";
  const studentGrade = (id: string) => students.find((s) => s.id === id)?.grade_class ?? "—";
  const filtered = fees.filter((f) => studentName(f.student_id).toLowerCase().includes(search.toLowerCase()));

  const totalCollected = fees.reduce((a, f) => a + Number(f.paid_amount), 0);
  const totalPending = fees.reduce((a, f) => a + (Number(f.total_due) - Number(f.paid_amount)), 0);
  const overdue = fees.filter((f) => f.status !== "paid" && f.due_date && new Date(f.due_date) < new Date()).length;

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (f: Fee) => {
    setEditing(f);
    setForm({ student_id: f.student_id, total_due: String(f.total_due), paid_amount: String(f.paid_amount), description: f.description ?? "", due_date: f.due_date ?? "", status: f.status });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const paid = Number(form.paid_amount);
    const total = Number(form.total_due);
    const status = paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid";
    const vals = { student_id: form.student_id, total_due: total, paid_amount: paid, status, description: form.description || null, due_date: form.due_date || null };
    if (editing) await update.mutateAsync({ id: editing.id, ...vals });
    else await insert.mutateAsync(vals);
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Fees</h1>
            <p className="text-muted-foreground text-sm">Track student fee payments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl gap-2" onClick={() => downloadCSV(fees.map((f) => ({ Student: studentName(f.student_id), Grade: studentGrade(f.student_id), Total: f.total_due, Paid: f.paid_amount, Status: f.status, DueDate: f.due_date ?? "", Description: f.description ?? "" })), "fees")} disabled={fees.length === 0}><Download className="w-4 h-4" /> Export CSV</Button>
            <Button className="rounded-xl gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Record Payment</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 rounded-xl shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-success" /></div>
              <div><p className="text-2xl font-display font-bold">ETB {totalCollected.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Collected</p></div>
            </div>
          </Card>
          <Card className="p-5 rounded-xl shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-warning" /></div>
              <div><p className="text-2xl font-display font-bold">ETB {totalPending.toLocaleString()}</p><p className="text-xs text-muted-foreground">Pending</p></div>
            </div>
          </Card>
          <Card className="p-5 rounded-xl shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-destructive" /></div>
              <div><p className="text-2xl font-display font-bold">{overdue}</p><p className="text-xs text-muted-foreground">Overdue</p></div>
            </div>
          </Card>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search fees..." className="pl-10 h-10 rounded-lg" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Grade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Paid</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Due Date</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border"><td colSpan={7} className="py-3 px-4"><Skeleton className="h-5 w-full" /></td></tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No fee records found</td></tr>
                ) : filtered.map((f) => (
                  <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{studentName(f.student_id)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{studentGrade(f.student_id)}</td>
                    <td className="py-3 px-4 text-muted-foreground">ETB {Number(f.total_due).toLocaleString()}</td>
                    <td className="py-3 px-4 text-muted-foreground">ETB {Number(f.paid_amount).toLocaleString()}</td>
                    <td className="py-3 px-4"><Badge variant="outline" className={`capitalize ${statusColor[f.status] ?? ""}`}>{f.status}</Badge></td>
                    <td className="py-3 px-4 text-muted-foreground">{f.due_date ?? "—"}</td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(f)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(f.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
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
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Fee" : "Record Fee"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Student *</Label>
              <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Total Due (ETB) *</Label><Input type="number" value={form.total_due} onChange={(e) => setForm({ ...form, total_due: e.target.value })} /></div>
            <div><Label>Paid Amount (ETB)</Label><Input type="number" value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Tuition Fee" /></div>
            <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            <Button className="w-full" onClick={handleSubmit} disabled={!form.student_id || !form.total_due}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete fee record?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (deleteId) await remove.mutateAsync(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Fees;
