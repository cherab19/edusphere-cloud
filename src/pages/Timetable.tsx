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
import { Plus, Trash2, Calendar, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Timetable = () => {
  const { schoolId } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("1");

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["timetable", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("timetable_slots")
        .select("*, classes(name), subjects(name), teachers(full_name)")
        .eq("school_id", schoolId)
        .order("start_time");
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

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects_list", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("subjects").select("id, name").eq("school_id", schoolId);
      return data ?? [];
    },
    enabled: !!schoolId,
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers_list", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase.from("teachers").select("id, full_name").eq("school_id", schoolId);
      return data ?? [];
    },
    enabled: !!schoolId,
  });

  const [form, setForm] = useState({
    class_id: "", subject_id: "", teacher_id: "", day_of_week: "1",
    start_time: "08:00", end_time: "09:00", room: "",
  });

  const addSlot = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("timetable_slots").insert({
        school_id: schoolId!,
        class_id: form.class_id || null,
        subject_id: form.subject_id || null,
        teacher_id: form.teacher_id || null,
        day_of_week: parseInt(form.day_of_week),
        start_time: form.start_time,
        end_time: form.end_time,
        room: form.room || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable"] });
      setDialogOpen(false);
      setForm({ class_id: "", subject_id: "", teacher_id: "", day_of_week: "1", start_time: "08:00", end_time: "09:00", room: "" });
      toast({ title: "Slot added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("timetable_slots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable"] });
      toast({ title: "Slot removed" });
    },
  });

  const daySlots = slots.filter((s: any) => s.day_of_week === parseInt(selectedDay));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Timetable</h1>
            <p className="text-muted-foreground text-sm">Manage class schedules</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Slot</Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl">
              <DialogHeader><DialogTitle>Add Timetable Slot</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select value={form.day_of_week} onValueChange={v => setForm({ ...form, day_of_week: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Room</Label>
                    <Input className="rounded-xl" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} placeholder="e.g. Room 101" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" className="rounded-xl" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" className="rounded-xl" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
                  </div>
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
                  <Label>Subject</Label>
                  <Select value={form.subject_id} onValueChange={v => setForm({ ...form, subject_id: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <Select value={form.teacher_id} onValueChange={v => setForm({ ...form, teacher_id: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent>
                      {teachers.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full rounded-xl" onClick={() => addSlot.mutate()} disabled={addSlot.isPending}>
                  {addSlot.isPending ? "Adding…" : "Add Slot"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Day selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {DAYS.map((day, i) => (
            <Button
              key={i}
              variant={selectedDay === String(i) ? "default" : "outline"}
              className="rounded-xl flex-shrink-0"
              onClick={() => setSelectedDay(String(i))}
            >
              {day}
            </Button>
          ))}
        </div>

        <Card className="rounded-xl shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daySlots.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No slots for {DAYS[parseInt(selectedDay)]}</TableCell></TableRow>
              ) : daySlots.map((slot: any) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                    </div>
                  </TableCell>
                  <TableCell>{slot.subjects?.name ?? "—"}</TableCell>
                  <TableCell>{slot.classes?.name ?? "—"}</TableCell>
                  <TableCell>{slot.teachers?.full_name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{slot.room ?? "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => deleteSlot.mutate(slot.id)}>
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

export default Timetable;
