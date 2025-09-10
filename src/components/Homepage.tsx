import React from 'react';
import { HeroDemo } from './HeroDemo';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { PricingSection } from './PricingSection';
import { TestimonialsSection } from './TestimonialsSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

interface HomepageProps {
  openModal: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ openModal }) => {
  return (
    <div className="pt-20">
      <HeroDemo />
      <HeroSection openModal={openModal} />
      <FeaturesSection />
      <PricingSection openModal={openModal} />
      <TestimonialsSection />
      <CTASection openModal={openModal} />
      <Footer />
    </div>
  );
};