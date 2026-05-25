import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import FooterSection from "@/components/landing/FooterSection";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <div id="features">
        <FeaturesSection />
      </div>
      <HowItWorksSection />
      <div id="pricing">
        <PricingSection />
      </div>
      <FAQSection />
      <FinalCTASection />
      <FooterSection />
    </div>
  );
};

export default Landing;
