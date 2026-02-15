import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, CreditCard, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SchoolRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
}

interface SubscriptionRow {
  id: string;
  school_id: string;
  plan: string;
  status: string;
  current_period_end: string;
}

const SuperAdminDashboard = () => {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !roles.includes("super_admin")) {
      navigate("/dashboard");
    }
  }, [loading, roles, navigate]);

  useEffect(() => {
    const load = async () => {
      const [schoolsRes, subsRes] = await Promise.all([
        supabase.from("schools").select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*"),
      ]);
      if (schoolsRes.data) setSchools(schoolsRes.data);
      if (subsRes.data) setSubscriptions(subsRes.data as unknown as SubscriptionRow[]);
      setFetching(false);
    };
    if (roles.includes("super_admin")) load();
  }, [roles]);

  const subsByPlan = subscriptions.reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] || 0) + 1;
    return acc;
  }, {});

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const trialingCount = subscriptions.filter((s) => s.status === "trialing").length;

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-primary/10 text-primary";
      case "trialing": return "bg-info/10 text-info";
      case "expired": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Super Admin Dashboard</h1>
        <Badge variant="outline" className="text-xs">Platform Admin</Badge>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 rounded-xl shadow-card flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Schools</p>
              <p className="text-2xl font-bold font-display">{schools.length}</p>
            </div>
          </Card>
          <Card className="p-5 rounded-xl shadow-card flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-info/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Subs</p>
              <p className="text-2xl font-bold font-display">{activeCount}</p>
            </div>
          </Card>
          <Card className="p-5 rounded-xl shadow-card flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-warning/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trialing</p>
              <p className="text-2xl font-bold font-display">{trialingCount}</p>
            </div>
          </Card>
          <Card className="p-5 rounded-xl shadow-card flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-accent flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plans</p>
              <div className="flex gap-2 mt-1">
                {Object.entries(subsByPlan).map(([plan, count]) => (
                  <Badge key={plan} variant="secondary" className="text-xs capitalize">{plan}: {count}</Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Schools Table */}
        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-semibold text-lg">Registered Schools</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">School</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Registered</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => {
                  const sub = subscriptions.find((s) => s.school_id === school.id);
                  return (
                    <tr key={school.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{school.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{school.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="capitalize text-xs">{sub?.plan ?? "—"}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${statusColor(sub?.status ?? "")}`}>
                          {sub?.status ?? "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(school.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
                {schools.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No schools registered yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
