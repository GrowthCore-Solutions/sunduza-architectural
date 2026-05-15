import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-sm border border-[--color-rule] bg-white px-3 py-2 text-sm text-[--color-ink] placeholder:text-[--color-muted] transition-colors",
        "focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20",
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
