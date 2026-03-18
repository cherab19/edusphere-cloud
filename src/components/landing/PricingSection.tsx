import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
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
    gradient: "from-muted/50 to-muted/30",
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
      "AI Insights",
      "Up to 1,000 students",
      "Priority support",
    ],
    popular: true,
    gradient: "from-primary/10 to-primary/5",
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
      "Real-time Messaging",
      "Advanced Analytics",
      "Unlimited students",
      "Dedicated support",
    ],
    popular: false,
    gradient: "from-muted/50 to-muted/30",
  },
];

const PricingSection = () => {
  return (
    <section className="py-28 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            Simple, Transparent{" "}
            <span className="text-gradient-primary">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your school. Upgrade or downgrade at any time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`relative p-8 rounded-2xl bg-card border transition-all duration-500 hover:-translate-y-1 ${
                plan.popular
                  ? "border-primary shadow-2xl shadow-primary/10 md:scale-105 z-10"
                  : "border-border shadow-card hover:shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-primary/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-display font-extrabold tracking-tight">{plan.price}</span>
                <span className="text-muted-foreground ml-1">{plan.currency}{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? "bg-primary/10" : "bg-muted"}`}>
                      <Check className={`w-3 h-3 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`w-full rounded-xl h-12 text-base font-semibold group ${plan.popular ? "" : ""}`}
                variant={plan.popular ? "default" : "outline"}
              >
                <Link to={`/signup-school?plan=${plan.name.toLowerCase()}`}>
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
