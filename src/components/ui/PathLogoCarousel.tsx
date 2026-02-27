import React, { useRef, useEffect, useState } from 'react';
import { gsap, MotionPathPlugin } from '../../lib/gsap';

interface LogoItem {
  name: string;
  logo: string;
}

const defaultLogos: LogoItem[] = [
  { name: 'Microphone', logo: '/icons/icon-microphone.svg' },
  { name: 'Waveform', logo: '/icons/icon-waveform.svg' },
  { name: 'Voice Contact', logo: '/icons/icon-voice-contact.svg' },
  { name: 'Follow-up', logo: '/icons/icon-followup.svg' },
  { name: 'Pipeline', logo: '/icons/icon-pipeline.svg' },
  { name: 'Multi Action', logo: '/icons/icon-multi-action.svg' },
  { name: 'Meeting Prep', logo: '/icons/icon-meeting-prep.svg' },
  { name: 'Note Routing', logo: '/icons/icon-note-routing.svg' },
  { name: 'Upsell', logo: '/icons/icon-upsell.svg' },
  { name: 'Handoff', logo: '/icons/icon-handoff.svg' },
];

function expandLogos(logos: LogoItem[], targetCount: number): LogoItem[] {
  const result: LogoItem[] = [];
  while (result.length < targetCount) {
    result.push(...logos);
  }
  return result.slice(0, targetCount);
}

interface PathLogoCarouselProps {
  className?: string;
  logoSize?: number;
  logos?: LogoItem[];
  spacingMultiplier?: number;
  pathD?: string;
  durationSeconds?: number;
}

// Desktop path: symmetric around x=800, very flat edges, steep S-curve through center
// Starts bottom-left, ends top-right
const DESKTOP_PATH = `M -100,760
  C 350,760 600,740 800,400
  C 1000,60 1250,40 1700,40`;

// Mobile path: wider version, same symmetric shape
const MOBILE_PATH = `M -900,760
  C -100,760 400,740 800,400
  C 1200,60 1500,40 2500,40
  C 3100,40 3600,40 4100,40`;

export const PathLogoCarousel: React.FC<PathLogoCarouselProps> = ({
  className = '',
  logoSize,
  logos = defaultLogos,
  spacingMultiplier = 1,
  pathD,
  durationSeconds,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [resizeKey, setResizeKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const expandedLogos = expandLogos(logos, 20);
  const size = logoSize ?? (isMobile ? 52 : 74);
  const spacing = isMobile ? 1.15 : spacingMultiplier;
  const duration = durationSeconds ?? 80;
  const activePath = pathD ?? (isMobile ? MOBILE_PATH : DESKTOP_PATH);

  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth < 1024);
  }, []);

  // Resize handler — only reacts to width changes
  useEffect(() => {
    let lastWidth = window.innerWidth;
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      const newWidth = window.innerWidth;
      if (newWidth === lastWidth) return;
      lastWidth = newWidth;
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsMobile(newWidth < 1024);
        setResizeKey(prev => prev + 1);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // GSAP animation
  useEffect(() => {
    if (!isMounted || !containerRef.current || !svgRef.current) return;

    const logoElements = containerRef.current.querySelectorAll('.floating-logo');
    const path = svgRef.current.querySelector('#pathCarouselMotionPath') as SVGPathElement;

    if (logoElements.length === 0 || !path) return;

    const totalLogos = logoElements.length;
    const logoSpacing = (1 / totalLogos) * spacing;

    const tweens: gsap.core.Tween[] = [];

    logoElements.forEach((logo, index) => {
      const startProgress = index * logoSpacing;

      gsap.set(logo, {
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        force3D: true,
      });

      const tween = gsap.fromTo(logo,
        {
          motionPath: {
            path: path,
            align: path,
            alignOrigin: [0.5, 0.5],
            autoRotate: 0,
            start: startProgress,
            end: startProgress,
          },
        },
        {
          motionPath: {
            path: path,
            align: path,
            alignOrigin: [0.5, 0.5],
            autoRotate: 0,
            start: startProgress,
            end: startProgress + 1,
          },
          duration: duration,
          ease: "none",
          repeat: -1,
          immediateRender: true,
          force3D: true,
        }
      );

      tweens.push(tween);
    });

    return () => {
      tweens.forEach(t => t.kill());
    };
  }, [isMounted, resizeKey, spacing, duration, activePath]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-visible ${className}`}
      style={{ zIndex: 6 }}
    >
      {/* Invisible SVG path track */}
      <svg
        ref={svgRef}
        className="absolute left-0 top-0"
        style={{
          width: '100%',
          height: '100%',
        }}
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
      >
        <path
          id="pathCarouselMotionPath"
          d={activePath}
          fill="none"
          stroke="transparent"
        />
      </svg>

      {/* Logo cards */}
      {expandedLogos.map((logo, index) => (
        <div
          key={`floating-${logo.name}-${index}`}
          className="floating-logo absolute"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: 0,
            top: 0,
            opacity: 0,
            willChange: 'transform',
          }}
        >
          <div className="w-full h-full rounded-xl bg-white shadow-lg shadow-black/10 border border-black/5 p-2.5 flex items-center justify-center opacity-75">
            <img
              src={logo.logo}
              alt={logo.name}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
