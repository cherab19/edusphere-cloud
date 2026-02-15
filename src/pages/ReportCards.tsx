import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";

const ReportCards = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Report Cards</h1>
          <p className="text-muted-foreground text-sm">Generate and view student report cards</p>
        </div>
        <Card className="p-8 rounded-xl shadow-card text-center">
          <p className="text-muted-foreground">Select a student and term to generate report cards. This module will be fully functional once connected to the backend.</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportCards;
