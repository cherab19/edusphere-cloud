import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bell, Calendar } from "lucide-react";

const announcements = [
  { id: 1, title: "Midterm Exam Schedule Released", audience: "All", date: "2026-02-08", content: "Midterm exams will begin on March 1st. Please review the schedule posted on the notice board." },
  { id: 2, title: "Fee Payment Reminder", audience: "Parents", date: "2026-02-05", content: "Please complete all outstanding fee payments before the end of this month." },
  { id: 3, title: "Teacher Professional Development Day", audience: "Teachers", date: "2026-02-03", content: "All teachers are required to attend the PD session on February 15th." },
  { id: 4, title: "Holiday Notice - Adwa Victory Day", audience: "All", date: "2026-02-01", content: "School will be closed on March 2nd for Adwa Victory Day celebrations." },
];

const audienceColor: Record<string, string> = {
  All: "bg-info/10 text-info",
  Parents: "bg-warning/10 text-warning",
  Teachers: "bg-primary/10 text-primary",
  Students: "bg-success/10 text-success",
};

const Announcements = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Announcements</h1>
            <p className="text-muted-foreground text-sm">Broadcast messages to your school community</p>
          </div>
          <Button className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> New Announcement
          </Button>
        </div>

        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id} className="p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{a.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {a.date}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${audienceColor[a.audience]}`}>{a.audience}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Announcements;
