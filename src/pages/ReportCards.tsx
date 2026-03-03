import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSchoolQuery } from "@/hooks/useSchoolData";
import { FileText } from "lucide-react";

interface Student { id: string; full_name: string; grade_class: string | null; }
interface Subject { id: string; name: string; }
interface Grade { id: string; student_id: string; subject_id: string; exam_type: string; score: number; remark: string | null; }

const ReportCards = () => {
  const { data: students = [] } = useSchoolQuery<Student>("students", "students");
  const { data: subjects = [] } = useSchoolQuery<Subject>("subjects", "subjects");
  const { data: grades = [] } = useSchoolQuery<Grade>("grades", "grades");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [examType, setExamType] = useState("all");

  const student = students.find((s) => s.id === selectedStudent);
  const studentGrades = useMemo(() => {
    let filtered = grades.filter((g) => g.student_id === selectedStudent);
    if (examType !== "all") filtered = filtered.filter((g) => g.exam_type === examType);
    return filtered;
  }, [grades, selectedStudent, examType]);

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? "Unknown";
  const average = studentGrades.length > 0 ? Math.round(studentGrades.reduce((a, g) => a + g.score, 0) / studentGrades.length) : 0;

  const getRank = (avg: number) => {
    if (avg >= 90) return "A+";
    if (avg >= 80) return "A";
    if (avg >= 70) return "B";
    if (avg >= 60) return "C";
    if (avg >= 50) return "D";
    return "F";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Report Cards</h1>
          <p className="text-muted-foreground text-sm">Generate and view student report cards</p>
        </div>

        <Card className="p-6 rounded-xl shadow-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <Label>Select Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
                <SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Exam Type</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  <SelectItem value="Midterm">Midterm</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                  <SelectItem value="Assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!selectedStudent ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Select a student to generate their report card</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <h2 className="font-display font-bold text-lg">{student?.full_name}</h2>
                  <p className="text-sm text-muted-foreground">{student?.grade_class ?? "No class assigned"}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-display font-bold">{average}%</p>
                  <p className={`text-sm font-semibold ${average >= 70 ? "text-success" : average >= 50 ? "text-warning" : "text-destructive"}`}>
                    Grade: {getRank(average)}
                  </p>
                </div>
              </div>

              {studentGrades.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">No grades recorded for this student.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subject</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Exam</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Score</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Grade</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentGrades.map((g) => (
                      <tr key={g.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 font-medium">{subjectName(g.subject_id)}</td>
                        <td className="py-3 px-4 text-muted-foreground">{g.exam_type}</td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${g.score >= 70 ? "text-success" : g.score >= 50 ? "text-warning" : "text-destructive"}`}>{g.score}%</span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{getRank(g.score)}</td>
                        <td className="py-3 px-4 text-muted-foreground">{g.remark ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportCards;
