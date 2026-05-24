// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import * as React from "react";
import { ToastProvider, useToast } from "@/frontend/components/ui/toast";

afterEach(cleanup);

function setup() {
  let api: ReturnType<typeof useToast> | null = null;
  function Capture() {
    api = useToast();
    return null;
  }
  const utils = render(
    <ToastProvider>
      <Capture />
    </ToastProvider>
  );
  return { ...utils, get api() {
    if (!api) throw new Error("api not captured");
    return api;
  } };
}

describe("Toast", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders a success toast with the message and dismiss control", () => {
    const { api, container } = setup();
    act(() => {
      api.success("Saved");
    });
    expect(container.textContent).toContain("Saved");
    const dismiss = container.querySelector('button[aria-label="Dismiss notification"]');
    expect(dismiss).not.toBeNull();
  });

  it("error toast uses role=alert; non-error uses role=status", () => {
    const { api, container } = setup();
    act(() => {
      api.error("Bad");
      api.info("Hello");
    });
    const alerts = container.querySelectorAll('[role="alert"]');
    const statuses = container.querySelectorAll('[role="status"]');
    expect(alerts.length).toBe(1);
    expect(statuses.length).toBeGreaterThanOrEqual(1);
  });

  it("auto-dismisses after the duration elapses", () => {
    const { api, container } = setup();
    act(() => {
      api.info("Bye", { duration: 1000 });
    });
    expect(container.textContent).toContain("Bye");
    act(() => {
      vi.advanceTimersByTime(1001);
    });
    expect(container.textContent).not.toContain("Bye");
  });

  it("manual dismiss removes the toast immediately", () => {
    const { api, container } = setup();
    act(() => {
      api.success("Closable", { duration: 100000 });
    });
    const btn = container.querySelector(
      'button[aria-label="Dismiss notification"]'
    ) as HTMLButtonElement;
    act(() => {
      fireEvent.click(btn);
    });
    expect(container.textContent).not.toContain("Closable");
  });

  it("stacks multiple toasts independently", () => {
    const { api, container } = setup();
    act(() => {
      api.info("One");
      api.info("Two");
      api.info("Three");
    });
    expect(container.textContent).toContain("One");
    expect(container.textContent).toContain("Two");
    expect(container.textContent).toContain("Three");
  });

  it("renders a title above the message when provided", () => {
    const { api, container } = setup();
    act(() => {
      api.error("the body", { title: "the title" });
    });
    const html = container.innerHTML;
    expect(html.indexOf("the title")).toBeGreaterThan(-1);
    expect(html.indexOf("the title")).toBeLessThan(html.indexOf("the body"));
  });

  it("useToast throws when used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Bad() {
      useToast();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
