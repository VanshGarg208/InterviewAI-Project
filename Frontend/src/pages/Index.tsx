import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ForWhomSection from "@/components/landing/ForWhomSection";
import TechStackSection from "@/components/landing/TechStackSection";
import PricingSection from "@/components/landing/PricingSection";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ForWhomSection />
      <TechStackSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
};

export default Index;
