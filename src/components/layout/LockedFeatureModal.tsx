import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LockedFeatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  requiredPlan: string;
}

const featureDescriptions: Record<string, string> = {
  Timetable: "Create and manage class schedules, assign teachers to time slots, and generate printable timetables.",
  Attendance: "Track daily student attendance, generate reports, and monitor attendance trends over time.",
  Grades: "Record and manage student grades across subjects, exams, and terms.",
  Exams: "Create exams, schedule them, assign to classes, and manage scoring.",
  "Report Cards": "Generate comprehensive student report cards with grades, remarks, and performance summaries.",
  Fees: "Manage fee structures, track payments, send reminders, and generate financial reports.",
  Finance: "Get a complete financial dashboard with income, expenses, and collection analytics.",
  "Parent Portal": "Give parents access to their children's grades, attendance, and school announcements.",
  Library: "Manage your school library catalog, track book borrowing, and monitor returns.",
  Transport: "Manage school buses, routes, driver assignments, and student transport allocation.",
};

const LockedFeatureModal = ({
  open,
  onOpenChange,
  featureName,
  requiredPlan,
}: LockedFeatureModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-display">
            {featureName} is Locked
          </DialogTitle>
          <DialogDescription className="text-center">
            {featureDescriptions[featureName] ||
              `This feature is available on the ${requiredPlan} plan and above.`}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-muted/50 border border-border p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Available on</p>
          <p className="text-lg font-display font-bold text-primary">{requiredPlan} Plan</p>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Button
            className="w-full rounded-xl h-11 gap-2"
            onClick={() => {
              onOpenChange(false);
              navigate("/upgrade");
            }}
          >
            <Sparkles className="w-4 h-4" />
            View Upgrade Options
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LockedFeatureModal;
