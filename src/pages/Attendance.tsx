import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const attendanceData = [
  { name: "Abeba Tesfaye", grade: "Grade 10", status: "present" as const },
  { name: "Dawit Mengistu", grade: "Grade 10", status: "present" as const },
  { name: "Sara Hailu", grade: "Grade 10", status: "absent" as const },
  { name: "Yonas Bekele", grade: "Grade 10", status: "late" as const },
  { name: "Meron Alemu", grade: "Grade 10", status: "present" as const },
  { name: "Henok Tadesse", grade: "Grade 10", status: "present" as const },
];

const statusStyles = {
  present: "bg-success/10 text-success border-0",
  absent: "bg-destructive/10 text-destructive border-0",
  late: "bg-warning/10 text-warning border-0",
};

const Attendance = () => {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Attendance</h1>
            <p className="text-muted-foreground text-sm">{today}</p>
          </div>
          <Button className="rounded-xl">Mark Attendance</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 rounded-xl shadow-card text-center">
            <p className="text-3xl font-display font-bold text-success">4</p>
            <p className="text-sm text-muted-foreground mt-1">Present</p>
          </Card>
          <Card className="p-5 rounded-xl shadow-card text-center">
            <p className="text-3xl font-display font-bold text-destructive">1</p>
            <p className="text-sm text-muted-foreground mt-1">Absent</p>
          </Card>
          <Card className="p-5 rounded-xl shadow-card text-center">
            <p className="text-3xl font-display font-bold text-warning">1</p>
            <p className="text-sm text-muted-foreground mt-1">Late</p>
          </Card>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-display font-semibold">Grade 10 – Section A</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((s) => (
                  <tr key={s.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{s.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`capitalize ${statusStyles[s.status]}`}>{s.status}</Badge>
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

export default Attendance;
