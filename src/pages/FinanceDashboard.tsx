import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useSchoolQuery } from "@/hooks/useSchoolData";
import { Skeleton } from "@/components/ui/skeleton";

interface Fee { id: string; total_due: number; paid_amount: number; status: string; created_at: string; }

const FinanceDashboard = () => {
  const { data: fees = [], isLoading } = useSchoolQuery<Fee>("fees", "fees");

  const totalRevenue = fees.reduce((a, f) => a + Number(f.paid_amount), 0);
  const totalDue = fees.reduce((a, f) => a + Number(f.total_due), 0);
  const outstanding = totalDue - totalRevenue;
  const collectionRate = totalDue > 0 ? Math.round((totalRevenue / totalDue) * 100) : 0;

  const paid = fees.filter((f) => f.status === "paid").length;
  const partial = fees.filter((f) => f.status === "partial").length;
  const unpaid = fees.filter((f) => f.status === "unpaid").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Finance Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of school financial health</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "Total Revenue", value: `ETB ${totalRevenue.toLocaleString()}`, sub: `From ${fees.length} records` },
                { label: "Outstanding", value: `ETB ${outstanding.toLocaleString()}`, sub: `${unpaid + partial} pending` },
                { label: "Fee Collection Rate", value: `${collectionRate}%`, sub: "Target: 95%" },
                { label: "Total Records", value: String(fees.length), sub: `${paid} paid, ${partial} partial, ${unpaid} unpaid` },
              ].map((s) => (
                <Card key={s.label} className="p-5 rounded-xl shadow-card">
                  <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-display font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="p-6 rounded-xl shadow-card">
                <h3 className="font-display font-semibold mb-4">Payment Status Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: "Paid", count: paid, pct: fees.length > 0 ? Math.round((paid / fees.length) * 100) : 0, color: "bg-success" },
                    { label: "Partial", count: partial, pct: fees.length > 0 ? Math.round((partial / fees.length) * 100) : 0, color: "bg-warning" },
                    { label: "Unpaid", count: unpaid, pct: fees.length > 0 ? Math.round((unpaid / fees.length) * 100) : 0, color: "bg-destructive" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.label} ({item.count})</span>
                        <span className="font-medium">{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6 rounded-xl shadow-card">
                <h3 className="font-display font-semibold mb-4">Revenue Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Due</span>
                    <span className="font-semibold">ETB {totalDue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Collected</span>
                    <span className="font-semibold text-success">ETB {totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">Outstanding</span>
                    <span className="font-semibold text-destructive">ETB {outstanding.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FinanceDashboard;
