import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FinalCTASection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-5xl mx-auto rounded-3xl bg-hero-gradient p-12 md:p-16 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 18v-4h-1v4h-4v1h4v4h1v-4h4v-1h-4z'/%3E%3C/g%3E%3C/svg%3E\")" }} />

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-8 right-8 w-32 h-32 rounded-full bg-primary/20 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-8 left-8 w-40 h-40 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-7 h-7 text-primary" />
            </motion.div>

            <h2 className="font-display text-4xl md:text-6xl font-extrabold text-primary-foreground mb-5 tracking-tight leading-[1.05]">
              Ready to run your school <span className="text-gradient-primary">smarter</span>?
            </h2>
            <p className="text-lg text-primary-foreground/70 mb-10 max-w-xl mx-auto leading-relaxed">
              Join schools modernising their operations with Timhrtboost. Free to start, no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base h-13 px-8 rounded-xl shadow-xl group">
                <Link to="/signup-school">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base h-13 px-8 rounded-xl border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm bg-transparent"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
