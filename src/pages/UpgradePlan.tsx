import DashboardLayout from "@/components/layout/DashboardLayout";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: "2,500",
    currency: "ETB",
    period: "/month",
    description: "Perfect for small schools getting started",
    features: [
      "Student & Teacher Management",
      "Classes & Subjects",
      "Basic Announcements",
      "Up to 200 students",
      "Email support",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "5,000",
    currency: "ETB",
    period: "/month",
    description: "For growing schools that need more power",
    features: [
      "Everything in Starter",
      "Attendance System",
      "Exams & Grades",
      "Fees & Finance",
      "Parent Portal",
      "Up to 1,000 students",
      "Priority support",
    ],
    popular: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "12,000",
    currency: "ETB",
    period: "/month",
    description: "Full ERP for large institutions",
    features: [
      "Everything in Pro",
      "Library Module",
      "Transport Module",
      "Advanced Analytics",
      "Unlimited students",
      "Dedicated support",
      "Custom integrations",
    ],
  },
];

const UpgradePlan = () => {
  const { subscriptionPlan } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Upgrade Your Plan</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Choose the Right Plan for Your School</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Compare plans and unlock powerful features to streamline your school management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = subscriptionPlan === plan.key;
            const isUpgrade =
              !isCurrent &&
              (subscriptionPlan === "starter" ||
                (subscriptionPlan === "pro" && plan.key === "enterprise"));

            return (
              <div
                key={plan.key}
                className={cn(
                  "relative rounded-2xl border p-6 flex flex-col bg-card transition-all",
                  plan.popular
                    ? "border-primary shadow-xl ring-1 ring-primary/20"
                    : "border-border shadow-card",
                  isCurrent && "ring-2 ring-primary/40"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="secondary">Current Plan</Badge>
                  </div>
                )}

                <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-display font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">
                    {plan.currency}{plan.period}
                  </span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full rounded-xl h-11"
                  variant={isCurrent ? "outline" : isUpgrade ? "default" : "outline"}
                  disabled={isCurrent || (!isUpgrade && !isCurrent)}
                >
                  {isCurrent ? "Current Plan" : isUpgrade ? "Upgrade Now" : "Downgrade"}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Need help choosing? Contact our support team for a personalized recommendation.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default UpgradePlan;
