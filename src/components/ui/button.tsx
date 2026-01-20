import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { HiArrowPath } from "react-icons/hi2";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-lovely-accent text-lovely-white hover:bg-lovely-accent/90 hover:shadow-lg hover:shadow-lovely-accent/25 hover:-translate-y-0.5 focus-visible:ring-lovely-accent",
        secondary:
          "bg-lovely-secondary text-lovely-primary hover:bg-lovely-secondary/90 hover:shadow-lg hover:shadow-lovely-secondary/25 hover:-translate-y-0.5 focus-visible:ring-lovely-secondary",
        outline:
          "border-2 border-lovely-secondary bg-transparent text-lovely-white hover:bg-lovely-secondary/10 hover:border-lovely-secondary focus-visible:ring-lovely-secondary",
        ghost:
          "text-lovely-white hover:bg-lovely-secondary/10 hover:text-lovely-secondary focus-visible:ring-lovely-secondary",
        link: "text-lovely-secondary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-md px-4 text-sm",
        lg: "h-14 rounded-lg px-8 text-lg",
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
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <HiArrowPath className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
