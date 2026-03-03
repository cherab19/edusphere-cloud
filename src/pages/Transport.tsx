import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Bus, Pencil, Trash2 } from "lucide-react";
import { useSchoolQuery, useSchoolMutation } from "@/hooks/useSchoolData";
import { Skeleton } from "@/components/ui/skeleton";

interface BusRecord { id: string; bus_number: string; driver_name: string | null; route: string | null; school_id: string; }

const emptyForm = { bus_number: "", driver_name: "", route: "" };

const Transport = () => {
  const { data: buses = [], isLoading } = useSchoolQuery<BusRecord>("transport_buses", "transport_buses");
  const { insert, update, remove } = useSchoolMutation("transport_buses", "transport_buses");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<BusRecord | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (b: BusRecord) => {
    setEditing(b);
    setForm({ bus_number: b.bus_number, driver_name: b.driver_name ?? "", route: b.route ?? "" });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const vals = { bus_number: form.bus_number, driver_name: form.driver_name || null, route: form.route || null };
    if (editing) await update.mutateAsync({ id: editing.id, ...vals });
    else await insert.mutateAsync(vals);
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Transport</h1>
            <p className="text-muted-foreground text-sm">Manage bus routes and assignments</p>
          </div>
          <Button className="rounded-xl gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Add Bus</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : buses.length === 0 ? (
          <Card className="p-8 rounded-xl shadow-card text-center text-muted-foreground">No buses registered yet.</Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {buses.map((r) => (
              <Card key={r.id} className="p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                    <Bus className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{r.bus_number}</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{r.route ?? "No route assigned"}</p>
                    <p className="text-xs text-muted-foreground">Driver: <span className="font-medium text-foreground">{r.driver_name ?? "Unassigned"}</span></p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Bus" : "Add Bus"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Bus Number *</Label><Input value={form.bus_number} onChange={(e) => setForm({ ...form, bus_number: e.target.value })} placeholder="e.g. BUS-001" /></div>
            <div><Label>Driver Name</Label><Input value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} /></div>
            <div><Label>Route</Label><Input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} placeholder="e.g. Bole → CMC → School" /></div>
            <Button className="w-full" onClick={handleSubmit} disabled={!form.bus_number}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete bus?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (deleteId) await remove.mutateAsync(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Transport;
