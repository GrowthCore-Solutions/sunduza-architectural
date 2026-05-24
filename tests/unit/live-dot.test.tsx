// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LiveDot } from "@/frontend/components/ui/LiveDot";

describe("LiveDot", () => {
  it("renders an aria-hidden span with two inner pulse layers", () => {
    const { container, unmount } = render(<LiveDot />);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer).not.toBeNull();
    expect(outer.tagName).toBe("SPAN");
    expect(outer.getAttribute("aria-hidden")).toBe("true");
    // ping layer + solid dot
    expect(outer.children.length).toBe(2);
    unmount();
  });

  it("applies the requested colour class to both inner layers", () => {
    const { container, unmount } = render(<LiveDot color="bg-sage" />);
    const inner = container.firstElementChild!.children;
    expect(inner[0].className).toContain("bg-sage");
    expect(inner[1].className).toContain("bg-sage");
    unmount();
  });

  it("respects custom size", () => {
    const { container, unmount } = render(<LiveDot size={3} />);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.className).toContain("h-3");
    expect(outer.className).toContain("w-3");
    unmount();
  });

  it("merges arbitrary className", () => {
    const { container, unmount } = render(<LiveDot className="ml-2" />);
    expect((container.firstElementChild as HTMLElement).className).toContain("ml-2");
    unmount();
  });

  it("cleans up between tests", () => {
    cleanup();
    expect(document.body.innerHTML).toBe("");
  });
});
