import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { categoriesService } from "@/services/categories.service";
import type { Category } from "@/types/database";

interface CategoriesContextType {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

interface CategoriesProviderProps {
  children: ReactNode;
}

export function CategoriesProvider({ children }: CategoriesProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca categorias do Supabase
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      setError("Erro ao carregar categorias");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carrega categorias ao montar
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (name: string) => {
    try {
      setError(null);
      const newCategory = await categoriesService.create(name);
      setCategories((prev) => [newCategory, ...prev]);
    } catch (err) {
      console.error("Erro ao criar categoria:", err);
      setError("Erro ao criar categoria");
      throw err;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, name: string) => {
    try {
      setError(null);
      const updated = await categoriesService.update(id, name);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updated : cat))
      );
    } catch (err) {
      console.error("Erro ao atualizar categoria:", err);
      setError("Erro ao atualizar categoria");
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setError(null);
      await categoriesService.delete(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error("Erro ao deletar categoria:", err);
      setError("Erro ao deletar categoria");
      throw err;
    }
  }, []);

  const getCategoryById = useCallback(
    (id: string) => categories.find((cat) => cat.id === id),
    [categories]
  );

  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        isLoading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        refreshCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextType {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}
