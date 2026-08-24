// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import * as React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { useDragScroll } from "@/frontend/hooks/useDragScroll";

afterEach(cleanup);

interface RailHandle {
  el: HTMLDivElement;
  isDragging: () => boolean;
}

function setup() {
  const handle: { current: RailHandle | null } = { current: null };
  function Rail() {
    const [drag, setDrag] = React.useState(false);
    const { ref, isDragging } = useDragScroll<HTMLDivElement>({ threshold: 5 });
    React.useEffect(() => setDrag(isDragging), [isDragging]);
    React.useEffect(() => {
      if (ref.current) handle.current = { el: ref.current, isDragging: () => drag };
    }, [ref, drag]);
    return (
      <div
        ref={ref}
        data-testid="rail"
        style={{ width: 200, overflowX: "auto" }}
      >
        <a href="#hit" data-testid="link">
          click me
        </a>
      </div>
    );
  }
  const utils = render(<Rail />);
  // give effect a tick
  if (!handle.current) {
    const el = utils.getByTestId("rail") as HTMLDivElement;
    handle.current = { el, isDragging: () => false };
  }
  return { ...utils, get rail() {
    if (!handle.current) throw new Error("rail not mounted");
    return handle.current.el;
  }, get isDragging() {
    return handle.current?.isDragging() ?? false;
  } };
}

function pointer(type: string, init: Partial<PointerEvent> & { clientX: number }) {
  // happy-dom doesn't synthesise PointerEvent the same way as a browser;
  // construct a generic Event and decorate it with pointer fields the
  // hook reads (pointerType, button, pointerId, clientX).
  const ev = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(ev, {
    pointerType: "mouse",
    button: 0,
    pointerId: 1,
    clientX: init.clientX,
  });
  return ev;
}

describe("useDragScroll", () => {
  it("does not flag a drag below the movement threshold", () => {
    const s = setup();
    act(() => {
      s.rail.dispatchEvent(pointer("pointerdown", { clientX: 100 }));
      s.rail.dispatchEvent(pointer("pointermove", { clientX: 102 }));
      s.rail.dispatchEvent(pointer("pointerup", { clientX: 102 }));
    });
    expect(s.isDragging).toBe(false);
  });

  it("scrolls and flags isDragging once threshold is crossed", () => {
    const s = setup();
    Object.defineProperty(s.rail, "scrollLeft", {
      configurable: true,
      writable: true,
      value: 0,
    });
    // setPointerCapture isn't implemented in happy-dom — stub it
    (s.rail as unknown as { setPointerCapture: () => void }).setPointerCapture = () => {};
    (s.rail as unknown as { releasePointerCapture: () => void }).releasePointerCapture =
      () => {};
    act(() => {
      s.rail.dispatchEvent(pointer("pointerdown", { clientX: 100 }));
      s.rail.dispatchEvent(pointer("pointermove", { clientX: 120 }));
    });
    expect(s.rail.scrollLeft).toBe(-20);
    act(() => {
      s.rail.dispatchEvent(pointer("pointerup", { clientX: 120 }));
    });
  });

  it("calls preventDefault on the post-drag click so the link does not navigate", () => {
    const s = setup();
    (s.rail as unknown as { setPointerCapture: () => void }).setPointerCapture = () => {};
    (s.rail as unknown as { releasePointerCapture: () => void }).releasePointerCapture =
      () => {};

    act(() => {
      s.rail.dispatchEvent(pointer("pointerdown", { clientX: 100 }));
      s.rail.dispatchEvent(pointer("pointermove", { clientX: 130 }));
      // pointerup hasn't fired yet — drag state is still 'moved' when the
      // synthetic click arrives, mirroring the browser sequence.
    });

    const click = new Event("click", { bubbles: true, cancelable: true });
    s.rail.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);

    act(() => {
      s.rail.dispatchEvent(pointer("pointerup", { clientX: 130 }));
    });
  });

  it("does not suppress clicks when no drag occurred", () => {
    const s = setup();
    (s.rail as unknown as { setPointerCapture: () => void }).setPointerCapture = () => {};

    act(() => {
      s.rail.dispatchEvent(pointer("pointerdown", { clientX: 100 }));
      s.rail.dispatchEvent(pointer("pointermove", { clientX: 102 })); // below threshold
      s.rail.dispatchEvent(pointer("pointerup", { clientX: 102 }));
    });

    const click = new Event("click", { bubbles: true, cancelable: true });
    s.rail.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
  });

  it("ignores non-mouse pointers (touch keeps native scroll)", () => {
    const s = setup();
    const ev = new Event("pointerdown", { bubbles: true, cancelable: true });
    Object.assign(ev, { pointerType: "touch", button: 0, pointerId: 7, clientX: 100 });
    act(() => {
      s.rail.dispatchEvent(ev);
    });
    expect(s.isDragging).toBe(false);
  });
});
