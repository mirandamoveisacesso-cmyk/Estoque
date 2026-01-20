import * as React from "react";
import { HiChevronDown } from "react-icons/hi2";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-12 w-full appearance-none rounded-lg border bg-lovely-primary/50 px-4 py-3 pr-10 text-base text-lovely-white",
            "border-lovely-secondary/30 backdrop-blur-sm",
            "transition-all duration-300 ease-out",
            "focus:border-lovely-secondary focus:outline-none focus:ring-2 focus:ring-lovely-secondary/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-lovely-white/50">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-lovely-primary text-lovely-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-lovely-secondary/70 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
