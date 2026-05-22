import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/frontend/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:translate-y-px select-none rounded",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-soft hover:bg-primary-dark hover:shadow-lift",
        secondary:
          "bg-ink text-white shadow-soft hover:bg-graphite hover:shadow-lift",
        outline:
          "border border-rule bg-white/90 text-ink hover:border-primary/60 hover:bg-paper2 hover:text-primary",
        ghost:
          "text-ink hover:bg-ink/6 hover:text-graphite",
        destructive:
          "bg-red-700 text-white shadow-soft hover:bg-red-800",
        link: "h-auto p-0 text-primary underline-offset-4 shadow-none hover:underline active:translate-y-0 font-medium",
      },
      size: {
        default: "h-11 px-5 py-2 tracking-[0.01em]",
        sm: "h-9 px-3.5 text-[0.8125rem]",
        lg: "h-12 px-7 text-[1rem] tracking-[0.01em]",
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
