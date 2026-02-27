import React from 'react';

interface ScrollAnimationProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left';
  className?: string;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform = direction === 'up' ? 'translateY(24px)' : 'translateX(-24px)';

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : hiddenTransform,
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};
