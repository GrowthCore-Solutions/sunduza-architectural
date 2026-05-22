import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded border border-rule/90 bg-white px-3.5 py-3 text-sm text-ink",
        "placeholder:text-muted/60",
        "shadow-[0_1px_3px_0_rgb(15_26_34/0.05)]",
        "transition-[border-color,box-shadow] duration-150",
        "focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(176_128_64/0.14)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-paper2",
        "resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
