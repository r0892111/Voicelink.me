import React from 'react';
import { LandingPageTemplate } from './LandingPageTemplate';

interface B2BSalesLandingProps {
  openModal: () => void;
}

export const B2BSalesLanding: React.FC<B2BSalesLandingProps> = ({ openModal }) => {
  return (
    <LandingPageTemplate
      openModal={openModal}
      hero={{
        title: 'Keep Pipedrive/Teamleader up-to-date while you\'re on the road.',
        subtitle: 'Voice → deal note + next step + stage update. Forecast stays real, follow-ups don\'t slip.',
        bullets: [
          '5 updates in 48 hours = your \'wow moment\'',
          'No more admin after customer visits',
          'Managers get a real pipeline',
        ],
      }}
    />
  );
};
