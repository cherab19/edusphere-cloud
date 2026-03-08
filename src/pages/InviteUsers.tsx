import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Send, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  role: z.enum(["teacher", "student", "parent", "accountant", "staff"]),
});

const roleLabels: Record<string, string> = {
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  accountant: "Accountant",
  staff: "Staff",
};

const statusConfig: Record<string, { icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { icon: Clock, variant: "secondary" },
  accepted: { icon: CheckCircle2, variant: "default" },
  expired: { icon: XCircle, variant: "destructive" },
};

const InviteUsers = () => {
  const { schoolId, user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["invitations", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId,
  });

  const sendInvite = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Invitation sent", description: `Invite sent to ${email}` });
      setEmail("");
      setRole("");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send invite", description: error.message, variant: "destructive" });
    },
  });

  const deleteInvite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invitations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Invitation removed" });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = inviteSchema.safeParse({ email, role });
    if (!result.success) {
      toast({ title: "Invalid input", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }
    sendInvite.mutate({ email: result.data.email, role: result.data.role });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Invite Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send email invitations to teachers, students, and parents to join your school.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Send Invitation
            </CardTitle>
            <CardDescription>
              The invitee will receive an email with a magic link to join your school.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="invite-email" className="sr-only">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>
              <div className="w-full sm:w-48">
                <Label htmlFor="invite-role" className="sr-only">Role</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={sendInvite.isPending || !role}>
                <Send className="w-4 h-4 mr-2" />
                {sendInvite.isPending ? "Sending…" : "Send Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sent Invitations</CardTitle>
            <CardDescription>{invitations.length} invitation(s) sent</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
            ) : invitations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No invitations sent yet. Use the form above to invite users.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((inv: any) => {
                      const config = statusConfig[inv.status] || statusConfig.pending;
                      const StatusIcon = config.icon;
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{roleLabels[inv.role] || inv.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={config.variant} className="gap-1">
                              <StatusIcon className="w-3 h-3" />
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(inv.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {inv.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteInvite.mutate(inv.id)}
                                disabled={deleteInvite.isPending}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InviteUsers;
