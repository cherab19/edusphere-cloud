import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ato Bekele Tadesse",
    role: "Principal, Lideta Academy",
    text: "Timhrtboost transformed how we manage our school. Attendance tracking alone saved us 10 hours per week.",
    rating: 5,
  },
  {
    name: "W/ro Meron Hailu",
    role: "Admin, Bright Future School",
    text: "The AI insights helped us identify at-risk students early. Our pass rate improved by 15% in one semester.",
    rating: 5,
  },
  {
    name: "Ato Daniel Girma",
    role: "Finance Head, Unity Academy",
    text: "Fee collection went from chaotic spreadsheets to a clean dashboard. Parents love the transparency.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            Loved by{" "}
            <span className="text-gradient-primary">Schools</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what school administrators say about Timhrtboost.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="relative p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <div>
                <p className="font-display font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
