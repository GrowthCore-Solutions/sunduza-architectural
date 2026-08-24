"use client";

import * as React from "react";

interface UseScrollArrowsOptions {
  /** Fraction of the visible width to advance per arrow press. Default 0.8. */
  pageRatio?: number;
}

// Tracks the scroll position of a horizontal overflow container and exposes
// prev/next handlers plus whether each direction can still scroll. This gives
// non-touch (mouse) users on-screen arrows to page through a hidden-scrollbar
// rail they otherwise couldn't move without a visible scrollbar or swipe.
// Returns the ref to attach to the scroll container.
export function useScrollArrows<T extends HTMLElement>({
  pageRatio = 0.8,
}: UseScrollArrowsOptions = {}) {
  const ref = React.useRef<T | null>(null);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  const update = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // 1px tolerance absorbs sub-pixel rounding at either extreme.
    setCanPrev(scrollLeft > 1);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    // Recompute when the rail or its content is resized (responsive breakpoints,
    // font load, content swap) so the arrows reflect real overflow.
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const scrollByPage = React.useCallback(
    (dir: 1 | -1) => {
      const el = ref.current;
      if (!el) return;
      el.scrollBy({
        left: dir * el.clientWidth * pageRatio,
        behavior: "smooth",
      });
    },
    [pageRatio]
  );

  const scrollPrev = React.useCallback(() => scrollByPage(-1), [scrollByPage]);
  const scrollNext = React.useCallback(() => scrollByPage(1), [scrollByPage]);

  return { ref, canPrev, canNext, scrollPrev, scrollNext };
}
