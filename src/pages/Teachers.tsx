import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal } from "lucide-react";

const teachers = [
  { id: 1, name: "Dr. Almaz Kebede", subject: "Mathematics", phone: "+251 911 111 111", hired: "2015-09-01" },
  { id: 2, name: "Ato Girma Tadesse", subject: "Physics", phone: "+251 922 222 222", hired: "2018-02-15" },
  { id: 3, name: "W/ro Tigist Haile", subject: "English", phone: "+251 933 333 333", hired: "2019-09-01" },
  { id: 4, name: "Ato Bereket Assefa", subject: "Biology", phone: "+251 944 444 444", hired: "2020-01-10" },
  { id: 5, name: "W/ro Hanna Yohannes", subject: "History", phone: "+251 955 555 555", hired: "2017-09-01" },
];

const Teachers = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Teachers</h1>
            <p className="text-muted-foreground text-sm">{teachers.length} teachers on staff</p>
          </div>
          <Button className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Add Teacher
          </Button>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search teachers..." className="pl-10 h-10 rounded-lg" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hire Date</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{t.name}</td>
                    <td className="py-3 px-4"><span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-md text-xs font-medium">{t.subject}</span></td>
                    <td className="py-3 px-4 text-muted-foreground">{t.phone}</td>
                    <td className="py-3 px-4 text-muted-foreground">{t.hired}</td>
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

export default Teachers;
