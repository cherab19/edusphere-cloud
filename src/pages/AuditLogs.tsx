import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadCSV } from "@/lib/csvExport";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any>;
  created_at: string;
}

const actionColor: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  update: "bg-blue-500/10 text-blue-600 border-blue-200",
  delete: "bg-destructive/10 text-destructive border-destructive/20",
};

const AuditLogs = () => {
  const { schoolId } = useAuth();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit_logs", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await (supabase as any)
        .from("audit_logs")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as AuditLog[];
    },
    enabled: !!schoolId,
  });

  const handleExport = () => {
    downloadCSV(
      logs.map((l) => ({
        action: l.action,
        entity_type: l.entity_type,
        entity_id: l.entity_id ?? "",
        details: JSON.stringify(l.details),
        timestamp: new Date(l.created_at).toLocaleString(),
      })),
      "audit_logs"
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Audit Logs</h1>
            <p className="text-muted-foreground text-sm">Track all changes made in your school</p>
          </div>
          <Button variant="outline" className="rounded-xl gap-2" onClick={handleExport} disabled={logs.length === 0}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        <Card className="p-6 rounded-xl shadow-card">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16">
              <ScrollText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No audit logs recorded yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Actions performed in the system will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Entity</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Details</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`capitalize ${actionColor[log.action] ?? ""}`}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 capitalize text-muted-foreground">{log.entity_type}</td>
                      <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                        {Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
