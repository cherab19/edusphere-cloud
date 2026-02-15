import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";

const FinanceDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Finance Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of school financial health</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Revenue", value: "ETB 1.2M", sub: "This semester" },
            { label: "Expenses", value: "ETB 890K", sub: "This semester" },
            { label: "Net Income", value: "ETB 310K", sub: "+14% vs last" },
            { label: "Fee Collection Rate", value: "87%", sub: "Target: 95%" },
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
            <h3 className="font-display font-semibold mb-4">Monthly Fee Collection</h3>
            <div className="space-y-3">
              {["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((month, i) => {
                const pct = [95, 88, 92, 85, 78, 87][i];
                return (
                  <div key={month} className="flex items-center gap-3">
                    <span className="w-8 text-xs text-muted-foreground">{month}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-6 rounded-xl shadow-card">
            <h3 className="font-display font-semibold mb-4">Expense Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: "Staff Salaries", amount: "ETB 520K", pct: 58 },
                { label: "Utilities", amount: "ETB 85K", pct: 10 },
                { label: "Supplies", amount: "ETB 120K", pct: 13 },
                { label: "Maintenance", amount: "ETB 95K", pct: 11 },
                { label: "Other", amount: "ETB 70K", pct: 8 },
              ].map((e) => (
                <div key={e.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">{e.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{e.amount}</span>
                    <span className="text-xs text-muted-foreground w-8 text-right">{e.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinanceDashboard;
