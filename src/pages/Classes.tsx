import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const classes = [
  { id: 1, name: "Grade 1", section: "A", teacher: "W/ro Tigist Haile", students: 32 },
  { id: 2, name: "Grade 2", section: "A", teacher: "Ato Girma Tadesse", students: 28 },
  { id: 3, name: "Grade 5", section: "B", teacher: "Dr. Almaz Kebede", students: 35 },
  { id: 4, name: "Grade 8", section: "A", teacher: "W/ro Hanna Yohannes", students: 40 },
  { id: 5, name: "Grade 10", section: "A", teacher: "Ato Bereket Assefa", students: 38 },
  { id: 6, name: "Grade 12", section: "A", teacher: "Dr. Almaz Kebede", students: 30 },
];

const Classes = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Classes</h1>
            <p className="text-muted-foreground text-sm">Manage classes and sections</p>
          </div>
          <Button className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Add Class
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((c) => (
            <Card key={c.id} className="p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-lg">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">Section {c.section}</p>
                </div>
                <span className="bg-accent text-accent-foreground px-2.5 py-1 rounded-lg text-xs font-medium">
                  {c.students} students
                </span>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">Class Teacher</p>
                <p className="text-sm font-medium mt-0.5">{c.teacher}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Classes;
