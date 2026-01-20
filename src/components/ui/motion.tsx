/**
 * Componentes de animação reutilizáveis usando Framer Motion
 * Padroniza animações em todo o sistema para consistência visual
 */
import { motion, AnimatePresence, type Variants } from "motion/react";
import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from "react";

// ============================================================================
// VARIANTES DE ANIMAÇÃO
// ============================================================================

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.15 }
  }
};

export const slideInFromLeft: Variants = {
  hidden: { x: "-100%" },
  visible: { 
    x: 0,
    transition: { type: "spring", damping: 30, stiffness: 300 }
  },
  exit: { 
    x: "-100%",
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

// ============================================================================
// COMPONENTES DE ANIMAÇÃO
// ============================================================================

interface FadeInProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  delay?: number;
}

/**
 * Componente para fade-in com slide up
 */
export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeInUp}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeIn.displayName = "FadeIn";

interface StaggerContainerProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  className?: string;
}

/**
 * Container que anima filhos em sequência (stagger effect)
 */
export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerContainer.displayName = "StaggerContainer";

interface StaggerItemProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  className?: string;
}

/**
 * Item individual para uso dentro de StaggerContainer
 */
export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={staggerItem}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerItem.displayName = "StaggerItem";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper para transição de páginas
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ModalAnimationProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}

/**
 * Wrapper para modais com animação de entrada/saída
 */
export function ModalAnimation({ children, isOpen }: ModalAnimationProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          {/* Content */}
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// HOVER/TAP PRESETS
// ============================================================================

export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

export const cardTap = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

export const buttonHover = {
  scale: 1.02,
  transition: { type: "spring", stiffness: 400, damping: 25 }
};

export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

// Re-export motion e AnimatePresence para uso direto
export { motion, AnimatePresence };
