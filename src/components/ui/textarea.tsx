import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-lg border bg-lovely-primary/50 px-4 py-3 text-base text-lovely-white placeholder:text-lovely-white/50",
            "border-lovely-secondary/30 backdrop-blur-sm resize-none",
            "transition-all duration-300 ease-out",
            "focus:border-lovely-secondary focus:outline-none focus:ring-2 focus:ring-lovely-secondary/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:border-destructive focus:ring-destructive/30",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
