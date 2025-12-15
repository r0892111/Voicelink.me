import React from 'react';
import { LandingPageTemplate } from './LandingPageTemplate';

interface InstallatorsLandingProps {
  openModal: () => void;
}

export const InstallatorsLanding: React.FC<InstallatorsLandingProps> = ({ openModal }) => {
  return (
    <LandingPageTemplate
      openModal={openModal}
      hero={{
        title: 'From site notes to CRM updates — without the hassle.',
        subtitle: 'Site visits, change requests, agreements: speak it and it lands on the right deal/project in Teamleader/Pipedrive.',
        bullets: [
          'Site update → project/deal note + next step',
          'Less forgotten change work, better handover PM ↔ execution',
          'Clear project status at a glance',
        ],
      }}
    />
  );
};
