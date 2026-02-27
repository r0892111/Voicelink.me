import React from 'react';
import { LandingPageTemplate } from './LandingPageTemplate';

export const B2BSalesLanding: React.FC = () => {
  return (
    <LandingPageTemplate
      hero={{
        title: 'Voor sales teams: houd Pipedrive/Teamleader up-to-date terwijl je onderweg bent.',
        subtitle: 'Na elk gesprek: deal-notitie, volgende stap en statusupdate automatisch gelogd. Forecast klopt en follow-ups slippen niet.',
        bullets: [
          'Na elk bezoek: 10 seconden spraak → CRM-update',
          'Geen admin-avond meer, w\u00e9l consistente opvolging',
          'Managers zien een pipeline die \u00e9cht klopt',
        ],
      }}
    />
  );
};
