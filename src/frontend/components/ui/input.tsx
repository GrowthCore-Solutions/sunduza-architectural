import * as React from "react";
import { cn } from "@/frontend/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded border border-rule/90 bg-white px-3.5 py-2 text-sm text-ink",
        "placeholder:text-muted/60",
        "shadow-[0_1px_3px_0_rgb(15_26_34/0.05)]",
        "transition-[border-color,box-shadow] duration-150",
        "focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(176_128_64/0.14)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-paper2",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
