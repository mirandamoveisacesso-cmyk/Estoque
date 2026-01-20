import { useState } from "react";
import {
  HiCube,
  HiFolderOpen,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
  HiBars3,
  HiXMark,
  HiArrowUpTray,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import logoMiranda from "@/assets/logo-miranda.png";
import { motion, AnimatePresence } from "motion/react";

export type PageId = "products" | "categories" | "import" | "settings";

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  {
    id: "products",
    label: "Produtos",
    icon: <HiCube className="h-5 w-5" />,
  },
  {
    id: "categories",
    label: "Categorias",
    icon: <HiFolderOpen className="h-5 w-5" />,
  },
  {
    id: "import",
    label: "Importar",
    icon: <HiArrowUpTray className="h-5 w-5" />,
  },
  {
    id: "settings",
    label: "Configurações",
    icon: <HiCog6Tooth className="h-5 w-5" />,
  },
];

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  className?: string;
}

export function Sidebar({ currentPage, onNavigate, className }: SidebarProps) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (page: PageId) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-miranda-primary/10 border border-miranda-primary/20 text-white lg:hidden"
        aria-label="Abrir menu"
      >
        <HiBars3 className="h-6 w-6" />
      </motion.button>

      {/* Mobile Backdrop com animação */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar com animação no mobile */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 flex flex-col",
          "bg-miranda-gray border-r border-white/10 shadow-lg",
          "lg:translate-x-0 lg:sticky lg:z-auto lg:h-screen lg:top-0",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <img
            src={logoMiranda}
            alt="Miranda Móveis"
            className="w-36 h-auto"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
            aria-label="Fechar menu"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-miranda-primary text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.disabled && (
                  <span className="text-xs text-white/40">Em breve</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-destructive/20 transition-all duration-200"
          >
            <HiArrowRightOnRectangle className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
