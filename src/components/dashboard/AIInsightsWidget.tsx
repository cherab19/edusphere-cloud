import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle, Users } from "lucide-react";
import { motion } from "framer-motion";

interface Student {
  id: string;
  full_name: string;
  grade_class: string | null;
}

interface Grade {
  id: string;
  score: number;
  student_id: string;
}

interface AttendanceRecord {
  id: string;
  status: string;
  student_id: string;
}

interface AIInsightsWidgetProps {
  students: Student[];
  grades: Grade[];
  attendance: AttendanceRecord[];
}

const AIInsightsWidget = ({ students, grades, attendance }: AIInsightsWidgetProps) => {
  // Calculate insights locally (no API call needed for basic stats)
  const studentPerformance = students.map((s) => {
    const studentGrades = grades.filter((g) => g.student_id === s.id);
    const avgScore = studentGrades.length > 0
      ? studentGrades.reduce((sum, g) => sum + Number(g.score), 0) / studentGrades.length
      : null;
    const studentAttendance = attendance.filter((a) => a.student_id === s.id);
    const attendanceRate = studentAttendance.length > 0
      ? (studentAttendance.filter((a) => a.status === "present").length / studentAttendance.length) * 100
      : null;
    return { ...s, avgScore, attendanceRate };
  });

  const atRisk = studentPerformance.filter(
    (s) => (s.avgScore !== null && s.avgScore < 60) || (s.attendanceRate !== null && s.attendanceRate < 70)
  );

  const topPerformers = studentPerformance
    .filter((s) => s.avgScore !== null && s.avgScore >= 85)
    .sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0))
    .slice(0, 3);

  const avgSchoolScore = grades.length > 0
    ? grades.reduce((sum, g) => sum + Number(g.score), 0) / grades.length
    : 0;

  if (students.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="p-6 rounded-xl shadow-card border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">AI Insights</h3>
            <p className="text-xs text-muted-foreground">Smart analysis of your school data</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">Beta</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* At-risk students */}
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs font-semibold text-destructive">At-Risk Students</span>
            </div>
            <p className="text-2xl font-display font-bold">{atRisk.length}</p>
            {atRisk.length > 0 && (
              <div className="mt-2 space-y-1">
                {atRisk.slice(0, 3).map((s) => (
                  <p key={s.id} className="text-xs text-muted-foreground truncate">
                    {s.full_name} — {s.avgScore !== null ? `${s.avgScore.toFixed(0)}%` : "Low attendance"}
                  </p>
                ))}
                {atRisk.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{atRisk.length - 3} more</p>
                )}
              </div>
            )}
          </div>

          {/* Top performers */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Top Performers</span>
            </div>
            <p className="text-2xl font-display font-bold">{topPerformers.length}</p>
            {topPerformers.length > 0 && (
              <div className="mt-2 space-y-1">
                {topPerformers.map((s) => (
                  <p key={s.id} className="text-xs text-muted-foreground truncate">
                    {s.full_name} — {s.avgScore?.toFixed(0)}%
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* School average */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold">School Average</span>
            </div>
            <p className="text-2xl font-display font-bold">{avgSchoolScore > 0 ? `${avgSchoolScore.toFixed(1)}%` : "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {avgSchoolScore >= 70 ? "Above benchmark ✓" : avgSchoolScore > 0 ? "Below benchmark — needs attention" : "No data yet"}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AIInsightsWidget;
