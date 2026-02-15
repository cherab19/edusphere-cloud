import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

const grades = [
  { student: "Abeba Tesfaye", subject: "Mathematics", exam: "Midterm", score: 92, remark: "Excellent" },
  { student: "Dawit Mengistu", subject: "Physics", exam: "Midterm", score: 78, remark: "Good" },
  { student: "Sara Hailu", subject: "English", exam: "Final", score: 88, remark: "Very Good" },
  { student: "Yonas Bekele", subject: "Biology", exam: "Midterm", score: 65, remark: "Satisfactory" },
  { student: "Meron Alemu", subject: "History", exam: "Final", score: 95, remark: "Excellent" },
];

const Grades = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Grades</h1>
            <p className="text-muted-foreground text-sm">Manage exam results and scores</p>
          </div>
          <Button className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Add Grades
          </Button>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search grades..." className="pl-10 h-10 rounded-lg" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Exam</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Remark</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{g.student}</td>
                    <td className="py-3 px-4 text-muted-foreground">{g.subject}</td>
                    <td className="py-3 px-4"><span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs">{g.exam}</span></td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${g.score >= 90 ? "text-success" : g.score >= 70 ? "text-info" : "text-warning"}`}>{g.score}%</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{g.remark}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
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

export default Grades;
