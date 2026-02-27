import React from 'react';
import { LandingPageTemplate } from './LandingPageTemplate';

export const InstallatorsLanding: React.FC = () => {
  return (
    <LandingPageTemplate
      hero={{
        title: 'Voor installateurs: van werf- en klantnotities naar duidelijke CRM-opvolging.',
        subtitle: 'Bezoeken, afspraken, wijzigingen: spreek het in en het wordt netjes gelogd bij de juiste klant, deal of project in Teamleader/Pipedrive.',
        bullets: [
          'Update na elk bezoek → notitie + volgende stap op de juiste fiche',
          'Minder \u2018info in iemands hoofd\u2019 → vlottere overdracht in het team',
          'Altijd een actueel status-overzicht van lopende dossiers',
        ],
      }}
    />
  );
};
