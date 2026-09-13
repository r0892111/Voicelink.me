import React from 'react';

interface LogoItem {
  src: string;
  alt: string;
  comingSoon?: boolean;
}

const logos: LogoItem[] = [
  { src: '/Teamleader_Icon.svg', alt: 'Teamleader' },
  { src: '/Pipedrive_id-7ejZnwv_0.svg', alt: 'Pipedrive' },
  { src: '/odoo_logo.svg', alt: 'Odoo' },
  { src: '/Catermonkey_Icon.png', alt: 'Catermonkey', comingSoon: true },
  { src: '/whatsapp.svg', alt: 'WhatsApp' },
];

interface LogoCarouselProps {
  label?: string;
  comingSoonLabel?: string;
}

export const LogoCarousel: React.FC<LogoCarouselProps> = ({ label, comingSoonLabel }) => {
  return (
    <div className="w-full overflow-hidden py-8">
      {label && (
        <p className="text-center text-sm font-instrument text-muted-blue tracking-wide uppercase mb-6">
          {label}
        </p>
      )}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-porcelain to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-porcelain to-transparent z-10" />

        <div className="flex animate-scroll-logos w-max">
          {/* Double the logos for seamless loop */}
          {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
            <div
              key={i}
              className={`relative flex-shrink-0 mx-6 flex items-center justify-center rounded-xl bg-white shadow-lg border border-navy/5 w-20 h-20 p-4 ${
                logo.comingSoon ? 'opacity-60' : ''
              }`}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-full h-full object-contain"
                draggable={false}
              />
              {logo.comingSoon && comingSoonLabel && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-instrument font-semibold uppercase tracking-wide text-white shadow">
                  {comingSoonLabel}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
