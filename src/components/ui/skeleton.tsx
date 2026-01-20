import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Componente Skeleton reutilizável para estados de loading.
 * Usa a paleta Lovely com animação de pulse sutil.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-lovely-secondary/10",
        className
      )}
    />
  );
}
