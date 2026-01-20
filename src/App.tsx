import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ProductsProvider } from "@/contexts/products-context";
import { CategoriesProvider } from "@/contexts/categories-context";
import { MaterialsProvider } from "@/contexts/materials-context";
import { DimensionsProvider } from "@/contexts/dimensions-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { LoginPage } from "@/pages/login";
import { ProductsPage } from "@/pages/products";
import { CategoriesPage } from "@/pages/categories";
import { ImportPage } from "@/pages/import";
import { SettingsPage } from "@/pages/settings";
import type { PageId } from "@/components/layout/sidebar";
import { HiArrowPath } from "react-icons/hi2";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>("products");

  // Loading inicial
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <HiArrowPath className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // Não autenticado → Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Renderizar página atual
  const renderPage = () => {
    switch (currentPage) {
      case "products":
        return (
          <ProductsPage
            currentPage={currentPage}
            onNavigate={setCurrentPage}
          />
        );
      case "categories":
        return (
          <CategoriesPage
            currentPage={currentPage}
            onNavigate={setCurrentPage}
          />
        );
      case "import":
        return (
          <ImportPage
            currentPage={currentPage}
            onNavigate={setCurrentPage}
          />
        );
      case "settings":
        return (
          <SettingsPage
            currentPage={currentPage}
            onNavigate={setCurrentPage}
          />
        );
      default:
        return (
          <ProductsPage
            currentPage={currentPage}
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  // Autenticado → Dashboard com providers do Supabase
  return (
    <DimensionsProvider>
      <MaterialsProvider>
        <CategoriesProvider>
          <ProductsProvider>{renderPage()}</ProductsProvider>
        </CategoriesProvider>
      </MaterialsProvider>
    </DimensionsProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
