import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const subjects = [
  { id: 1, name: "Mathematics", code: "MATH", teachers: 3, classes: 12 },
  { id: 2, name: "Physics", code: "PHY", teachers: 2, classes: 6 },
  { id: 3, name: "English", code: "ENG", teachers: 4, classes: 12 },
  { id: 4, name: "Biology", code: "BIO", teachers: 2, classes: 6 },
  { id: 5, name: "History", code: "HIST", teachers: 2, classes: 8 },
  { id: 6, name: "Chemistry", code: "CHEM", teachers: 2, classes: 6 },
  { id: 7, name: "Amharic", code: "AMH", teachers: 3, classes: 12 },
  { id: 8, name: "Geography", code: "GEO", teachers: 1, classes: 4 },
];

const Subjects = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Subjects</h1>
            <p className="text-muted-foreground text-sm">{subjects.length} subjects registered</p>
          </div>
          <Button className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Add Subject
          </Button>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search subjects..." className="pl-10 h-10 rounded-lg" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Teachers</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Classes</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{s.name}</td>
                    <td className="py-3 px-4"><span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs font-mono">{s.code}</span></td>
                    <td className="py-3 px-4 text-muted-foreground">{s.teachers}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.classes}</td>
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

export default Subjects;
