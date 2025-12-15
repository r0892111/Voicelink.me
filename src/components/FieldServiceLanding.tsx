import React from 'react';
import { LandingPageTemplate } from './LandingPageTemplate';

export const FieldServiceLanding: React.FC = () => {
  return (
    <LandingPageTemplate
      hero={{
        title: 'Work orders & follow-ups in your CRM in 10 seconds (with voice).',
        subtitle: 'No more admin backlog after interventions. Notes + tasks + next steps automatically logged in Teamleader/Pipedrive.',
        bullets: [
          'After each job: speak 1 update → CRM note + task created',
          'Fewer missed follow-ups → faster invoicing and scheduling',
          'Everything centralized, even when someone is away',
        ],
      }}
    />
  );
};
