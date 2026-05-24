"use client";

import * as React from "react";

interface UseDragScrollOptions {
  /** Multiplier applied to pointer delta. Default 1 (1:1 with cursor). */
  speed?: number;
  /** Minimum pixels of movement before a drag is recognised. */
  threshold?: number;
}

// Adds mouse drag-to-scroll on top of native overflow scrolling without
// interfering with touch (native momentum scroll wins on touch devices).
// Returns the ref to attach + a flag for cursor styling.
export function useDragScroll<T extends HTMLElement>({
  speed = 1,
  threshold = 5,
}: UseDragScrollOptions = {}) {
  const ref = React.useRef<T | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const stateRef = React.useRef({
    active: false,
    moved: false,
    startX: 0,
    startScrollLeft: 0,
    pointerId: -1,
  });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      stateRef.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        startScrollLeft: el.scrollLeft,
        pointerId: e.pointerId,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.active || e.pointerId !== s.pointerId) return;
      const dx = e.clientX - s.startX;
      if (!s.moved && Math.abs(dx) < threshold) return;
      if (!s.moved) {
        s.moved = true;
        setIsDragging(true);
        // Capture pointer so we keep getting moves even if the cursor leaves
        // the rail mid-drag.
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* setPointerCapture can throw on detached nodes — safe to ignore. */
        }
      }
      el.scrollLeft = s.startScrollLeft - dx * speed;
      e.preventDefault();
    };

    const finish = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.active || e.pointerId !== s.pointerId) return;
      const wasDrag = s.moved;
      s.active = false;
      s.moved = false;
      s.pointerId = -1;
      if (wasDrag) {
        setIsDragging(false);
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* releasePointerCapture can throw if capture was never set. */
        }
      }
    };

    // Suppress the click that follows a drag so links don't navigate when
    // the user was actually scrolling.
    const onClickCapture = (e: MouseEvent) => {
      if (stateRef.current.moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", finish);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", finish);
      el.removeEventListener("pointercancel", finish);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, [speed, threshold]);

  return { ref, isDragging };
}
