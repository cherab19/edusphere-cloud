import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const FooterSection = () => {
  return (
    <footer className="bg-hero-gradient py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      
      <div className="container mx-auto px-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-primary-foreground">
                Timhrt<span className="text-primary">boost</span>
              </span>
            </div>
            <p className="text-sm text-primary-foreground/50 max-w-sm leading-relaxed">
              The all-in-one AI-powered school management platform for modern institutions.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-primary-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Pricing</a></li>
              <li><Link to="/login" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-primary-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-primary-foreground/50">Privacy Policy</span></li>
              <li><span className="text-sm text-primary-foreground/50">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/40">
            © {new Date().getFullYear()} Timhrtboost. All rights reserved.
          </p>
          <a
            href="https://lovable.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-foreground/40 hover:text-primary transition-colors inline-flex items-center gap-1.5"
          >
            <span>Built with</span>
            <span className="font-semibold">❤ Lovable</span>
            <span className="text-primary-foreground/30">· Sweepstake May 2026</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
