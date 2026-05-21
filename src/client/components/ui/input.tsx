import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-rule/85 bg-white/95 px-3.5 py-2 text-sm text-ink shadow-sm shadow-ink/5 placeholder:text-muted/75 transition-colors",
        "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
