import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LandingNavbar = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-primary-foreground">
            EduERP<span className="text-primary">Cloud</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="rounded-lg">
            <Link to="/signup-school">Start Free</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
