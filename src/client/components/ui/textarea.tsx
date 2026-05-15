import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-sm border border-[--color-rule] bg-white px-3 py-2 text-sm text-[--color-ink] placeholder:text-[--color-muted] resize-y transition-colors",
        "focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
