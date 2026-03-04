import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return mobile;
}

export function useIsCompactHero() {
  const [compact, setCompact] = useState(() => window.innerWidth <= 1200);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1200px)');
    const handler = (e: MediaQueryListEvent) => setCompact(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return compact;
}

// Returns a scale factor for the HowItWorks demo window based on viewport width:
// 1.0 below 1536px, 1.15 at 1536–1919px, 1.3 at 1920px+
export function useScaleFactor() {
  const getScale = () => {
    if (window.innerWidth >= 1920) return 1.3;
    if (window.innerWidth >= 1536) return 1.15;
    return 1;
  };
  const [scale, setScale] = useState(getScale);
  useEffect(() => {
    const onResize = () => setScale(getScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
}
