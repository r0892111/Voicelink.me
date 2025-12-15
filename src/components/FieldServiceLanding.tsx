import React from 'react';
import { LandingPageTemplate } from './LandingPageTemplate';

interface FieldServiceLandingProps {
  openModal: () => void;
}

export const FieldServiceLanding: React.FC<FieldServiceLandingProps> = ({ openModal }) => {
  return (
    <LandingPageTemplate
      openModal={openModal}
      hero={{
        title: 'Voor servicebedrijven: CRM-updates in 10 seconden, gewoon via spraak.',
        subtitle: 'Na elke interventie of klantcontact: notities, taken en vervolgacties automatisch in Teamleader/Pipedrive. Geen admin-achterstand meer.',
        bullets: [
          'Na elke job: 1 spraakupdate → notitie + volgende stap in je CRM',
'Minder vergeten opvolging → sneller plannen en factureren',
'Alles centraal en deelbaar voor het hele team'
        ],
      }}
    />
  );
};
