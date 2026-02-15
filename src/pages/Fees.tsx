import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const fees = [
  { student: "Abeba Tesfaye", grade: "Grade 10", total: 15000, paid: 15000, status: "Paid", due: "2025-12-01" },
  { student: "Dawit Mengistu", grade: "Grade 8", total: 12000, paid: 8000, status: "Partial", due: "2025-12-01" },
  { student: "Sara Hailu", grade: "Grade 12", total: 18000, paid: 0, status: "Unpaid", due: "2025-11-15" },
  { student: "Yonas Bekele", grade: "Grade 7", total: 10000, paid: 10000, status: "Paid", due: "2025-12-01" },
  { student: "Meron Alemu", grade: "Grade 11", total: 16000, paid: 16000, status: "Paid", due: "2025-12-01" },
];

const statusColor: Record<string, string> = {
  Paid: "bg-success/10 text-success border-0",
  Partial: "bg-warning/10 text-warning border-0",
  Unpaid: "bg-destructive/10 text-destructive border-0",
};

const Fees = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Fees</h1>
            <p className="text-muted-foreground text-sm">Track student fee payments</p>
          </div>
          <Button className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Record Payment
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 rounded-xl shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">ETB 49K</p>
                <p className="text-xs text-muted-foreground">Total Collected</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 rounded-xl shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">ETB 22K</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 rounded-xl shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">1</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search fees..." className="pl-10 h-10 rounded-lg" />
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
                </tr>
              </thead>
              <tbody>
                {fees.map((f, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{f.student}</td>
                    <td className="py-3 px-4 text-muted-foreground">{f.grade}</td>
                    <td className="py-3 px-4 text-muted-foreground">ETB {f.total.toLocaleString()}</td>
                    <td className="py-3 px-4 text-muted-foreground">ETB {f.paid.toLocaleString()}</td>
                    <td className="py-3 px-4"><Badge variant="outline" className={statusColor[f.status]}>{f.status}</Badge></td>
                    <td className="py-3 px-4 text-muted-foreground">{f.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Fees;
