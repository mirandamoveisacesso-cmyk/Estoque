import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { HiXMark } from "react-icons/hi2";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-lovely-secondary/20 text-lovely-secondary border border-lovely-secondary/30",
        secondary:
          "bg-lovely-accent/20 text-lovely-accent border border-lovely-accent/30",
        outline:
          "bg-transparent border border-lovely-secondary/50 text-lovely-white",
        solid:
          "bg-lovely-secondary text-lovely-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  onRemove?: () => void;
  colorHex?: string;
}

function Badge({
  className,
  variant,
  onRemove,
  colorHex,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {colorHex && (
        <span
          className="w-3 h-3 rounded-full border border-white/30 shrink-0"
          style={{ backgroundColor: colorHex }}
        />
      )}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 p-0.5 rounded-full hover:bg-lovely-white/20 transition-colors"
          aria-label="Remover"
        >
          <HiXMark className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export { Badge, badgeVariants };
