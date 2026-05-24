"use client";

import * as React from "react";

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

/**
 * Counts up to `end` once the element scrolls into view.
 * Respects prefers-reduced-motion (shows final value immediately).
 */
export function CountUp({ end, suffix = "", duration = 1400, className }: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  // Lazy initializer reads prefers-reduced-motion at mount and seeds the value
  // with the final number when the user has opted out of motion — avoids any
  // animation pulse and any synchronous setState inside the effect below.
  const [value, setValue] = React.useState(() => {
    if (typeof window === "undefined") return 0;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? end : 0;
  });
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      startedRef.current = true;
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const startTime = performance.now();
            const tick = (now: number) => {
              const elapsed = now - startTime;
              const t = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
              setValue(Math.round(end * eased));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
