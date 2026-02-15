import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal } from "lucide-react";

const students = [
  { id: 1, name: "Abeba Tesfaye", gender: "Female", dob: "2008-03-15", grade: "Grade 10", parent: "+251 911 234 567", admitted: "2020-09-01" },
  { id: 2, name: "Dawit Mengistu", gender: "Male", dob: "2009-07-22", grade: "Grade 8", parent: "+251 922 345 678", admitted: "2021-09-01" },
  { id: 3, name: "Sara Hailu", gender: "Female", dob: "2006-11-10", grade: "Grade 12", parent: "+251 933 456 789", admitted: "2018-09-01" },
  { id: 4, name: "Yonas Bekele", gender: "Male", dob: "2010-01-05", grade: "Grade 7", parent: "+251 944 567 890", admitted: "2022-09-01" },
  { id: 5, name: "Meron Alemu", gender: "Female", dob: "2007-05-18", grade: "Grade 11", parent: "+251 955 678 901", admitted: "2019-09-01" },
  { id: 6, name: "Henok Tadesse", gender: "Male", dob: "2008-09-30", grade: "Grade 10", parent: "+251 966 789 012", admitted: "2020-09-01" },
];

const Students = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Students</h1>
            <p className="text-muted-foreground text-sm">{students.length} students enrolled</p>
          </div>
          <Button className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-10 h-10 rounded-lg" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Gender</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date of Birth</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Grade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Parent Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Admitted</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{s.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.gender}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.dob}</td>
                    <td className="py-3 px-4"><span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-md text-xs font-medium">{s.grade}</span></td>
                    <td className="py-3 px-4 text-muted-foreground">{s.parent}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.admitted}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
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

export default Students;
