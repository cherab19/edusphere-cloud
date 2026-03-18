import { motion, useInView } from "framer-motion";
import {
  Users, BookOpen, ClipboardCheck, DollarSign, Bus, Library, Bell, BarChart3, Brain, MessageSquare, Globe, Shield,
} from "lucide-react";
import { useRef } from "react";

const features = [
  { icon: Users, title: "Student & Teacher Management", description: "Complete management for all students, teachers, and staff with profiles and records.", color: "168 80% 36%" },
  { icon: BookOpen, title: "Classes & Subjects", description: "Organize classes from Grade 1–12, assign teachers, and manage subject allocations.", color: "210 90% 52%" },
  { icon: ClipboardCheck, title: "Attendance Tracking", description: "Daily attendance marking with real-time analytics and monthly reports.", color: "152 70% 40%" },
  { icon: BarChart3, title: "Exams & Grades", description: "Full grade management with auto-generated report cards and performance views.", color: "38 92% 50%" },
  { icon: DollarSign, title: "Fees & Finance", description: "Track fee payments, manage expenses, and view financial analytics.", color: "0 72% 51%" },
  { icon: Library, title: "Library System", description: "Manage books, track borrows and returns with overdue alerts.", color: "270 60% 50%" },
  { icon: Bus, title: "Transport Module", description: "Manage bus routes, assign drivers, and track transportation.", color: "200 80% 45%" },
  { icon: Bell, title: "Smart Notifications", description: "Targeted real-time alerts for announcements, fees, and performance.", color: "330 65% 50%" },
  { icon: Brain, title: "AI-Powered Insights", description: "Student performance predictions and smart recommendations powered by AI.", color: "168 80% 36%", isNew: true },
  { icon: MessageSquare, title: "Real-Time Messaging", description: "In-app parent-teacher messaging with instant notifications.", color: "210 90% 52%", isNew: true },
  { icon: Globe, title: "Multi-Language Support", description: "Access the platform in English and Amharic for broader reach.", color: "152 70% 40%", isNew: true },
  { icon: Shield, title: "Enterprise Security", description: "Bank-level encryption, role-based access, and complete audit trails.", color: "38 92% 50%", isNew: true },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider"
          >
            Comprehensive Platform
          </motion.span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            Everything Your School{" "}
            <span className="text-gradient-primary">Needs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A comprehensive suite of modules designed to streamline every aspect of school operations — now with AI.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500 shadow-card hover:shadow-xl hover:-translate-y-1"
            >
              {feature.isNew && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  New
                </span>
              )}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                style={{
                  backgroundColor: `hsl(${feature.color} / 0.1)`,
                }}
              >
                <feature.icon
                  className="w-6 h-6 transition-colors duration-300"
                  style={{ color: `hsl(${feature.color})` }}
                />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
