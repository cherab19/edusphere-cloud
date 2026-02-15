import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bus } from "lucide-react";

const routes = [
  { id: 1, bus: "BUS-001", driver: "Ato Tadesse G.", route: "Bole → CMC → School", students: 28 },
  { id: 2, bus: "BUS-002", driver: "Ato Kebede M.", route: "Megenagna → Gerji → School", students: 32 },
  { id: 3, bus: "BUS-003", driver: "Ato Samuel T.", route: "Piassa → Arat Kilo → School", students: 24 },
  { id: 4, bus: "BUS-004", driver: "Ato Dereje K.", route: "Ayat → Summit → School", students: 35 },
];

const Transport = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Transport</h1>
            <p className="text-muted-foreground text-sm">Manage bus routes and assignments</p>
          </div>
          <Button className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Route</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {routes.map((r) => (
            <Card key={r.id} className="p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Bus className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{r.bus}</h3>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{r.students} students</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{r.route}</p>
                  <p className="text-xs text-muted-foreground">Driver: <span className="font-medium text-foreground">{r.driver}</span></p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transport;
