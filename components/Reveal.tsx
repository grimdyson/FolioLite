"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  /** Extra classes on the wrapper div */
  className?: string;
  /** Delay before the reveal starts (ms). Useful for staggering siblings. */
  delay?: number;
  /** Distance to translate up from (px). Default 32. */
  distance?: number;
  /** IntersectionObserver threshold (0-1). Default 0.15. */
  threshold?: number;
  /** If true, plays after `delay` ms on mount instead of waiting for scroll. */
  immediate?: boolean;
  /** HTML tag to render. Default "div". */
  as?: React.ElementType;
};

/**
 * Scroll-reveal wrapper inspired by linear.app.
 *
 * Starts invisible + shifted down, then fades/slides into place
 * when the element enters the viewport (via IntersectionObserver)
 * or after a delay on mount if `immediate` is set.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  distance = 32,
  threshold = 0.15,
  immediate = false,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (immediate) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Honour per-element delay for staggering within a group
          if (delay > 0) {
            setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold, immediate]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        transition: `opacity 2s cubic-bezier(0.16,1,0.3,1), transform 2s cubic-bezier(0.16,1,0.3,1)`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
