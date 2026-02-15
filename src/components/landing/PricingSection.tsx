import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
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
    popular: false,
  },
  {
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
      "Up to 1,000 students",
      "Priority support",
    ],
    popular: true,
  },
  {
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
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your school. Upgrade or downgrade at any time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl bg-card border transition-all duration-300 ${
                plan.popular
                  ? "border-primary shadow-xl scale-105"
                  : "border-border shadow-card hover:shadow-card-hover"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-display font-extrabold">{plan.price}</span>
                <span className="text-muted-foreground ml-1">{plan.currency}{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`w-full rounded-xl h-11 ${plan.popular ? "" : "variant-outline"}`}
                variant={plan.popular ? "default" : "outline"}
              >
                <Link to="/signup-school">Get Started</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
