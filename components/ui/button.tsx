import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#b88b4a] text-white hover:bg-[#a07740] focus-visible:ring-[#b88b4a]",
        secondary:
          "bg-[#0f172a] text-white hover:bg-[#1e293b] focus-visible:ring-[#0f172a]",
        outline:
          "border border-[#b88b4a] text-[#b88b4a] hover:bg-[#b88b4a]/10 focus-visible:ring-[#b88b4a]",
        ghost:
          "text-[#0f172a] hover:bg-[#0f172a]/5 focus-visible:ring-[#0f172a]",
        destructive:
          "bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700",
        link:
          "text-[#b88b4a] underline-offset-4 hover:underline focus-visible:ring-[#b88b4a]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
