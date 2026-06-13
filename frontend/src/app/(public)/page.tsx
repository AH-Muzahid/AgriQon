import NavigationHeader from "@/features/velocity/components/shared/NavigationHeader";
import HeroSection from "@/features/velocity/components/sections/HeroSection";
import WhyVelocitySection from "@/features/velocity/components/sections/WhyVelocitySection";
import ProblemSection from "@/features/velocity/components/sections/ProblemSection";
import DataFlowSection from "@/features/velocity/components/sections/DataFlowSection";
import ComparisonSection from "@/features/velocity/components/sections/ComparisonSection";
import ExpandableFeatures from "@/features/velocity/components/sections/ExpandableFeatures";
import ArchitectureSection from "@/features/velocity/components/sections/ArchitectureSection";
import CommandCenterSection from "@/features/velocity/components/sections/CommandCenterSection";
import InfrastructureSection from "@/features/velocity/components/sections/InfrastructureSection";
import CommerceSection from "@/features/velocity/components/sections/CommerceSection";
import FoundationSection from "@/features/velocity/components/sections/FoundationSection";
import CTASection from "@/features/velocity/components/sections/CTASection";
import FooterSection from "@/features/velocity/components/shared/FooterSection";

export default function VelocityLandingPage() {
  return (
    <>
      <NavigationHeader />
      <main className="flex-1">
        <HeroSection />
        <WhyVelocitySection />
        <ProblemSection />
        <DataFlowSection />
        <ComparisonSection />
        <ExpandableFeatures />
        <ArchitectureSection />
        <CommandCenterSection />
        <InfrastructureSection />
        <CommerceSection />
        <FoundationSection />
        <CTASection />
      </main>
      <FooterSection />
    </>
  );
}
