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
        title: 'Voor installateurs: van werf- en klantnotities naar duidelijke CRM-opvolging.',
        subtitle: 'Bezoeken, afspraken, wijzigingen: spreek het in en het wordt netjes gelogd bij de juiste klant, deal of project in Teamleader/Pipedrive.',
        bullets: [
          'Update na elk bezoek → notitie + volgende stap op de juiste fiche',
          'Minder ‘info in iemands hoofd’ → vlottere overdracht in het team',
          'Altijd een actueel status-overzicht van lopende dossiers',
        ],
      }}
    />
  );
};
