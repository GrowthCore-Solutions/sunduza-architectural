import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-sm border border-[#c8bfa8] bg-white px-3 py-2 text-sm text-[#0e0e0e] placeholder:text-[#8a7a60] focus:border-[#b88b4a] focus:outline-none focus:ring-2 focus:ring-[#b88b4a]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
