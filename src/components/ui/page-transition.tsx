import { useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    if (pageKey) {
      // Inicia animação de saída
      setPhase("exit");
      setIsAnimating(true);

      // Após a animação de saída, troca o conteúdo
      const exitTimer = setTimeout(() => {
        setDisplayChildren(children);
        setPhase("enter");

        // Após a animação de entrada, finaliza
        const enterTimer = setTimeout(() => {
          setIsAnimating(false);
        }, 200);

        return () => clearTimeout(enterTimer);
      }, 150);

      return () => clearTimeout(exitTimer);
    }
  }, [pageKey, children]);

  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out",
        phase === "exit" && isAnimating && "opacity-0 translate-y-2",
        phase === "enter" && isAnimating && "opacity-100 translate-y-0",
        !isAnimating && "opacity-100 translate-y-0"
      )}
    >
      {displayChildren}
    </div>
  );
}
