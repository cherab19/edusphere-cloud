import { GraduationCap } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="bg-hero-gradient py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-primary-foreground">
              EduERP<span className="text-primary">Cloud</span>
            </span>
          </div>
          <p className="text-sm text-primary-foreground/50">
            © 2026 EduERP Cloud. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
