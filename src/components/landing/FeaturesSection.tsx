import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  DollarSign,
  Bus,
  Library,
  Bell,
  BarChart3,
} from "lucide-react";

const features = [
  { icon: Users, title: "Student & Teacher Management", description: "Complete CRUD management for all students, teachers, and staff with profiles and records." },
  { icon: BookOpen, title: "Classes & Subjects", description: "Organize classes from Grade 1–12, assign teachers, and manage subject allocations seamlessly." },
  { icon: ClipboardCheck, title: "Attendance Tracking", description: "Daily attendance marking with real-time analytics and monthly reports for all classes." },
  { icon: BarChart3, title: "Exams & Grades", description: "Full grade management with auto-generated report cards and parent-accessible performance views." },
  { icon: DollarSign, title: "Fees & Finance", description: "Track fee payments, manage expenses, and view financial analytics with beautiful dashboards." },
  { icon: Library, title: "Library System", description: "Manage books, track borrows and returns, and receive overdue alerts automatically." },
  { icon: Bus, title: "Transport Module", description: "Manage bus routes, assign drivers, and track student transportation assignments." },
  { icon: Bell, title: "Announcements", description: "Broadcast messages to teachers, students, and parents with targeted notification delivery." },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl font-bold mb-4">
            Everything Your School Needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive suite of modules designed to streamline every aspect of school operations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 shadow-card hover:shadow-card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-6 h-6 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
