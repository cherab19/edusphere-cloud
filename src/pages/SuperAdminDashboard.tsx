import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, School, Users, CreditCard, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface SchoolRow {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface SubscriptionRow {
  id: string;
  school_id: string;
  plan: string;
  status: string;
  current_period_end: string;
}

const PLAN_COLORS: Record<string, string> = {
  starter: "hsl(168, 80%, 36%)",
  pro: "hsl(210, 90%, 52%)",
  enterprise: "hsl(38, 92%, 50%)",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trialing: "secondary",
  expired: "destructive",
  cancelled: "outline",
};

const SuperAdminDashboard = () => {
  const { roles, loading: authLoading } = useAuth();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = roles.includes("super_admin");

  useEffect(() => {
    if (!isSuperAdmin) return;

    const fetchData = async () => {
      const [schoolsRes, subsRes] = await Promise.all([
        supabase.from("schools").select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*"),
      ]);
      if (schoolsRes.data) setSchools(schoolsRes.data);
      if (subsRes.data) setSubscriptions(subsRes.data as SubscriptionRow[]);
      setLoading(false);
    };

    fetchData();
  }, [isSuperAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const subBySchool = new Map(subscriptions.map((s) => [s.school_id, s]));

  // Stats
  const totalSchools = schools.length;
  const activeSubs = subscriptions.filter((s) => s.status === "active" || s.status === "trialing").length;
  const planCounts = subscriptions.reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(planCounts).map(([name, value]) => ({ name, value }));

  // Revenue estimate
  const planPrices: Record<string, number> = { starter: 2500, pro: 5000, enterprise: 12000 };
  const monthlyRevenue = subscriptions
    .filter((s) => s.status === "active" || s.status === "trialing")
    .reduce((sum, s) => sum + (planPrices[s.plan] || 0), 0);

  // Registrations by month (last 6 months)
  const now = new Date();
  const monthLabels: string[] = [];
  const monthCounts: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthLabels.push(label);
    const count = schools.filter((s) => {
      const sd = new Date(s.created_at);
      return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
    }).length;
    monthCounts.push(count);
  }
  const barData = monthLabels.map((month, i) => ({ month, schools: monthCounts[i] }));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Platform Overview</h1>
          <p className="text-muted-foreground text-sm">Super Admin dashboard — monitor all schools and subscriptions.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="p-5 rounded-xl shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Schools</p>
                    <p className="text-2xl font-display font-bold">{totalSchools}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <School className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
              </Card>
              <Card className="p-5 rounded-xl shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Subscriptions</p>
                    <p className="text-2xl font-display font-bold">{activeSubs}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <Activity className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
              </Card>
              <Card className="p-5 rounded-xl shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Revenue</p>
                    <p className="text-2xl font-display font-bold">ETB {monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
              </Card>
              <Card className="p-5 rounded-xl shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                    <p className="text-2xl font-display font-bold">{totalSchools}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2 p-6 rounded-xl shadow-card">
                <h3 className="font-display font-semibold text-lg mb-4">School Registrations</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Bar dataKey="schools" fill="hsl(168, 80%, 36%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-6 rounded-xl shadow-card">
                <h3 className="font-display font-semibold text-lg mb-4">Plans Distribution</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={PLAN_COLORS[entry.name] || "hsl(var(--muted))"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-12">No subscription data yet.</p>
                )}
              </Card>
            </div>

            {/* Schools Table */}
            <Card className="p-6 rounded-xl shadow-card">
              <h3 className="font-display font-semibold text-lg mb-4">Registered Schools</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">School</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map((school) => {
                      const sub = subBySchool.get(school.id);
                      return (
                        <tr key={school.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{school.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{school.email}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="capitalize">{sub?.plan ?? "—"}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={STATUS_VARIANT[sub?.status ?? ""] ?? "outline"} className="capitalize">
                              {sub?.status ?? "—"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(school.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                    {schools.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">No schools registered yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;