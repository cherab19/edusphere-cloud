import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, GraduationCap, Shield, Zap, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRef } from "react";

const floatingAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
};

const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={ref} className="relative min-h-[100vh] bg-hero-gradient overflow-hidden flex items-center">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      {/* Decorative orbs with parallax */}
      <motion.div className="absolute inset-0 overflow-hidden" style={{ y: yBg }}>
        <motion.div animate={floatingAnimation} className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/8 blur-3xl" />
        <motion.div animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }} className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/12 blur-3xl" />
        <motion.div animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.5 } }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/6 blur-3xl" />
      </motion.div>

      {/* Floating glassmorphism cards */}
      <motion.div
        initial={{ opacity: 0, x: -50, rotate: -12 }}
        animate={{ opacity: 1, x: 0, rotate: -12 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="hidden xl:block absolute left-[5%] top-[20%] w-48 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
      >
        <motion.div animate={floatingAnimation}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary-foreground/80">Students</span>
          </div>
          <p className="text-2xl font-display font-bold text-primary-foreground">2,847</p>
          <p className="text-xs text-primary-foreground/50 mt-1 flex items-center gap-1">
            <span className="text-emerald-400">↑ 12%</span> this term
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50, rotate: 8 }}
        animate={{ opacity: 1, x: 0, rotate: 8 }}
        transition={{ duration: 1, delay: 1 }}
        className="hidden xl:block absolute right-[5%] top-[30%] w-52 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
      >
        <motion.div animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.8 } }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Star className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-primary-foreground/80">Attendance</span>
          </div>
          <p className="text-2xl font-display font-bold text-primary-foreground">94.2%</p>
          <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "94%" }}
              transition={{ duration: 1.5, delay: 1.5 }}
              className="bg-emerald-400 h-1.5 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-primary text-sm font-medium">
              <Zap className="w-4 h-4" />
              AI-Powered School Management Platform
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/20 text-xs font-bold">NEW</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-primary-foreground mb-6 leading-[0.95]"
          >
            Manage Your School{" "}
            <span className="text-gradient-primary relative">
              Smarter
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/40 rounded-full origin-left"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Timhrtboost is the all-in-one school management platform with AI-powered insights.
            Students, teachers, finances, attendance — everything in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="text-base h-13 px-8 rounded-xl shadow-xl group relative overflow-hidden">
              <Link to="/signup-school">
                <span className="relative z-10 flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base h-13 px-8 rounded-xl border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm"
            >
              <Link to="/login" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Sign In
              </Link>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-16"
          >
            <p className="text-xs uppercase tracking-widest text-primary-foreground/40 mb-6 font-medium">Trusted by institutions across Ethiopia</p>
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              {[
                { icon: GraduationCap, label: "500+ Schools", value: "500+" },
                { icon: Shield, label: "Bank-Level Security", value: "256-bit" },
                { icon: Zap, label: "99.9% Uptime", value: "99.9%" },
              ].map(({ icon: Icon, label, value }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl backdrop-blur-sm bg-white/5 border border-white/5"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-lg font-display font-bold text-primary-foreground">{value}</span>
                  <span className="text-xs text-primary-foreground/50 font-medium">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 73.3C120 66.7 240 53.3 360 48C480 42.7 600 45.3 720 50.7C840 56 960 64 1080 64C1200 64 1320 56 1380 52L1440 48V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
