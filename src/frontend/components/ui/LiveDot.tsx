import * as React from "react";
import { cn } from "@/frontend/lib/utils";

interface LiveDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tailwind colour class for the dot fill (e.g. "bg-primary", "bg-sage"). */
  color?: string;
  /** Size in tailwind h/w numbers — defaults to 2 (= 0.5rem). */
  size?: 2 | 2.5 | 3;
}

export function LiveDot({
  color = "bg-primary",
  size = 2,
  className,
  ...rest
}: LiveDotProps) {
  const dim = size === 3 ? "h-3 w-3" : size === 2.5 ? "h-2.5 w-2.5" : "h-2 w-2";
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-flex", dim, className)}
      {...rest}
    >
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping",
          color
        )}
      />
      <span className={cn("relative inline-flex rounded-full", dim, color)} />
    </span>
  );
}
