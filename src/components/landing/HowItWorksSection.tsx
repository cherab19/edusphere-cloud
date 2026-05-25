import { motion } from "framer-motion";
import { UserPlus, Settings2, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create your school",
    description: "Sign up in seconds and set up your school profile, classes, and academic year.",
  },
  {
    icon: Settings2,
    title: "Invite your team",
    description: "Add teachers, staff, and parents. Roles and permissions are handled for you.",
  },
  {
    icon: Rocket,
    title: "Run your school",
    description: "Track attendance, manage grades, communicate, and let AI surface what matters.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-4">
            How it works
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Up and running in minutes
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            No training required. Three steps from sign-up to a fully operational digital school.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="relative w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-primary" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
