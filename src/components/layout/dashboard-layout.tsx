import { type ReactNode } from "react";
import { Sidebar, type PageId } from "./sidebar";
import { motion, AnimatePresence } from "motion/react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export function DashboardLayout({ 
  children, 
  title, 
  actions, 
  currentPage, 
  onNavigate 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex bg-lovely-primary">
      {/* Sidebar - não anima */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Header com animação sutil */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="sticky top-0 z-30 bg-lovely-secondary/10 backdrop-blur-sm border-b border-lovely-secondary/30 shadow-sm shadow-lovely-secondary/5 px-4 lg:px-8 py-3 sm:py-4"
        >
          <div className="flex items-center justify-between gap-3 sm:gap-4 max-w-7xl mx-auto">
            {/* Title com animação */}
            <AnimatePresence mode="wait">
              <motion.h1 
                key={title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="text-xl sm:text-2xl font-bold text-lovely-white pl-10 sm:pl-12 lg:pl-0 truncate"
              >
                {title}
              </motion.h1>
            </AnimatePresence>

            {/* Actions */}
            {actions && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex items-center gap-2 flex-shrink-0"
              >
                {actions}
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* Content com animação de página */}
        <main className="flex-1 px-4 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                duration: 0.35, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

