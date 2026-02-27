import React from 'react';

interface SectionDividerProps {
  fromColor?: string;
  toColor?: string;
  variant?: number;
}

const sectionDividerData = [
  // Variant 0 — Gentle wave
  {
    fill: "M0,50 C320,120 640,130 960,70 C1280,10 1600,0 1920,60",
    navy: "M0,42 C320,102 640,108 960,58 C1280,0 1600,-12 1920,48 L1920,68 C1600,8 1280,20 960,78 C640,142 320,136 0,58 Z",
    light: "M0,58 C320,136 640,142 960,78 C1280,20 1600,8 1920,68 L1920,80 C1600,22 1280,32 960,88 C640,152 320,150 0,68 Z",
  },
  // Variant 1 — S-curve
  {
    fill: "M0,30 C320,110 640,120 960,60 C1280,0 1600,-10 1920,80",
    navy: "M0,22 C320,92 640,100 960,50 C1280,-10 1600,-16 1920,66 L1920,90 C1600,4 1280,10 960,70 C640,134 320,126 0,38 Z",
    light: "M0,38 C320,126 640,134 960,70 C1280,10 1600,4 1920,90 L1920,102 C1600,18 1280,22 960,80 C640,146 320,142 0,48 Z",
  },
  // Variant 2 — Inverted single wave
  {
    fill: "M0,85 C320,10 640,-5 960,55 C1280,115 1600,130 1920,35",
    navy: "M0,77 C320,-8 640,-25 960,45 C1280,107 1600,114 1920,21 L1920,45 C1600,144 1280,125 960,65 C640,9 320,26 0,93 Z",
    light: "M0,93 C320,26 640,9 960,65 C1280,125 1600,144 1920,45 L1920,57 C1600,158 1280,137 960,75 C640,21 320,40 0,103 Z",
  },
  // Variant 3 — Double wave (undulating)
  {
    fill: "M0,55 C240,110 480,110 720,60 C960,10 1200,10 1440,60 C1680,110 1800,110 1920,55",
    navy: "M0,47 C240,92 480,90 720,50 C960,2 1200,4 1440,50 C1680,92 1800,90 1920,41 L1920,65 C1800,124 1680,126 1440,70 C1200,24 960,18 720,70 C480,126 240,124 0,63 Z",
    light: "M0,63 C240,124 480,126 720,70 C960,20 1200,24 1440,70 C1680,126 1800,124 1920,65 L1920,77 C1800,136 1680,140 1440,80 C1200,38 960,32 720,80 C480,138 240,138 0,73 Z",
  },
];

export const SectionDivider: React.FC<SectionDividerProps> = ({
  fromColor = '#FDFBF7',
  toColor = '#FDFBF7',
  variant = 0,
}) => {
  const data = sectionDividerData[variant % sectionDividerData.length];
  const fillPath = `${data.fill} L1920,160 L0,160 Z`;

  return (
    <div
      className="relative w-full"
      style={{ backgroundColor: fromColor, marginTop: -1, marginBottom: -1 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 -40 1920 200"
        preserveAspectRatio="none"
        className="w-full block h-[50px] md:h-[75px] lg:h-[100px]"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Layer 1: Fill — transitions from fromColor to toColor */}
        <path d={fillPath} fill={toColor} />
        {/* Layer 2: Navy accent curve */}
        <path d={data.navy} fill="#1A2D63" />
        {/* Layer 3: Light accent curve */}
        <path d={data.light} fill="#7B8DB5" />
      </svg>
    </div>
  );
};
