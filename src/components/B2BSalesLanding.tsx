import React from 'react';
import { LandingPageTemplate } from './LandingPageTemplate';

export const B2BSalesLanding: React.FC = () => {
  return (
    <LandingPageTemplate
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
