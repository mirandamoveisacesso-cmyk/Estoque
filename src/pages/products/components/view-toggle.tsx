import { HiSquares2X2, HiListBullet } from "react-icons/hi2";
import { cn } from "@/lib/utils";

export type ViewMode = "cards" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-lovely-secondary/10 rounded-lg border border-lovely-secondary/20">
      <button
        type="button"
        onClick={() => onViewModeChange("cards")}
        className={cn(
          "p-2 rounded-md transition-all duration-200",
          viewMode === "cards"
            ? "bg-lovely-secondary/30 text-lovely-white shadow-sm"
            : "text-lovely-white/60 hover:text-lovely-white hover:bg-lovely-secondary/15"
        )}
        aria-label="Visualização em cards"
        aria-pressed={viewMode === "cards"}
      >
        <HiSquares2X2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange("list")}
        className={cn(
          "p-2 rounded-md transition-all duration-200",
          viewMode === "list"
            ? "bg-lovely-secondary/30 text-lovely-white shadow-sm"
            : "text-lovely-white/60 hover:text-lovely-white hover:bg-lovely-secondary/15"
        )}
        aria-label="Visualização em lista"
        aria-pressed={viewMode === "list"}
      >
        <HiListBullet className="h-4 w-4" />
      </button>
    </div>
  );
}
