import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Users, GraduationCap, DollarSign, ClipboardCheck, TrendingUp, TrendingDown } from "lucide-react";

const stats = [
  { label: "Total Students", value: "1,284", change: "+12%", trend: "up", icon: Users, color: "text-info" },
  { label: "Teachers", value: "86", change: "+3%", trend: "up", icon: GraduationCap, color: "text-primary" },
  { label: "Fee Collection", value: "ETB 845K", change: "+8%", trend: "up", icon: DollarSign, color: "text-success" },
  { label: "Avg Attendance", value: "94.2%", change: "-0.5%", trend: "down", icon: ClipboardCheck, color: "text-warning" },
];

const recentStudents = [
  { name: "Abeba Tesfaye", grade: "Grade 10", status: "Active" },
  { name: "Dawit Mengistu", grade: "Grade 8", status: "Active" },
  { name: "Sara Hailu", grade: "Grade 12", status: "Active" },
  { name: "Yonas Bekele", grade: "Grade 7", status: "Inactive" },
  { name: "Meron Alemu", grade: "Grade 11", status: "Active" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening at your school.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-5 rounded-xl shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-display font-bold">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-success" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                )}
                <span className={stat.trend === "up" ? "text-success" : "text-destructive"}>{stat.change}</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Students */}
        <Card className="p-6 rounded-xl shadow-card">
          <h3 className="font-display font-semibold text-lg mb-4">Recent Students</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Grade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((student) => (
                  <tr key={student.name} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{student.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{student.grade}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {student.status}
                      </span>
                    </td>
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

export default Dashboard;
