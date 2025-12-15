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
        title: 'Voor sales teams: houd Pipedrive/Teamleader up-to-date terwijl je onderweg bent.',
        subtitle: 'Na elk gesprek: deal-notitie, volgende stap en statusupdate automatisch gelogd. Forecast klopt en follow-ups slippen niet.',
        bullets: [
          'Na elk bezoek: 10 seconden spraak → CRM-update',
          'Geen admin-avond meer, wél consistente opvolging',
          'Managers zien een pipeline die écht klopt',
        ],
      }}
    />
  );
};
