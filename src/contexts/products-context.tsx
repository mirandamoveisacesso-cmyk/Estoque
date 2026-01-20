import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  productsService,
  type CreateProductDTO,
  type UpdateProductDTO,
} from "@/services/products.service";
import type { ProductWithRelations } from "@/types/database";

// Interface para manter compatibilidade com o código anterior
export interface Product {
  id: string;
  name: string;
  category: string; // Nome da categoria
  categoryId: string; // ID da categoria
  description: string;
  price: number;
  discountPrice?: number; // Novo: preço à vista
  dimensions: string[]; // Array de nomes de dimensões
  materials: string[]; // Array de nomes de materiais
  weightKg?: number; // Novo: peso em kg
  warrantyMonths?: number; // Novo: garantia em meses
  assemblyRequired?: boolean; // Novo: requer montagem
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData {
  name: string;
  category: string; // Nome da categoria
  categoryId: string; // ID da categoria
  description: string;
  price: number;
  discountPrice?: number;
  dimensions: string[]; // Nomes ou IDs
  materials: string[]; // Nomes ou IDs
  weightKg?: number;
  warrantyMonths?: number;
  assemblyRequired?: boolean;
  imageUrl: string;
}

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  addProduct: (data: ProductFormData, dimensionIds: string[], materialIds: string[]) => Promise<void>;
  updateProduct: (id: string, data: ProductFormData, dimensionIds: string[], materialIds: string[]) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Converte ProductWithRelations para o formato Product legado
function toProduct(p: ProductWithRelations): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category?.name || "",
    categoryId: p.category_id,
    description: p.description || "",
    price: p.price,
    discountPrice: p.discount_price ?? undefined,
    dimensions: (p.dimensions || []).map((d) => d.name),
    materials: (p.materials || []).map((m) => m.name),
    weightKg: p.weight_kg ?? undefined,
    warrantyMonths: p.warranty_months ?? undefined,
    assemblyRequired: p.assembly_required,
    imageUrl: p.image_url || "",
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
  };
}

interface ProductsProviderProps {
  children: ReactNode;
}

export function ProductsProvider({ children }: ProductsProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca produtos do Supabase
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productsService.getAll();
      setProducts(data.map(toProduct));
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setError("Erro ao carregar produtos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carrega produtos ao montar
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(
    async (data: ProductFormData, dimensionIds: string[], materialIds: string[]) => {
      try {
        setError(null);
        const dto: CreateProductDTO = {
          name: data.name,
          categoryId: data.categoryId,
          description: data.description,
          price: data.price,
          discountPrice: data.discountPrice,
          imageUrl: data.imageUrl,
          weightKg: data.weightKg,
          warrantyMonths: data.warrantyMonths,
          assemblyRequired: data.assemblyRequired,
          dimensionIds,
          materialIds,
        };

        const newProduct = await productsService.create(dto);
        setProducts((prev) => [toProduct(newProduct), ...prev]);
      } catch (err) {
        console.error("Erro ao criar produto:", err);
        setError("Erro ao criar produto");
        throw err;
      }
    },
    []
  );

  const updateProduct = useCallback(
    async (id: string, data: ProductFormData, dimensionIds: string[], materialIds: string[]) => {
      try {
        setError(null);
        const dto: UpdateProductDTO = {
          name: data.name,
          categoryId: data.categoryId,
          description: data.description,
          price: data.price,
          discountPrice: data.discountPrice,
          imageUrl: data.imageUrl,
          weightKg: data.weightKg,
          warrantyMonths: data.warrantyMonths,
          assemblyRequired: data.assemblyRequired,
          dimensionIds,
          materialIds,
        };

        const updated = await productsService.update(id, dto);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? toProduct(updated) : p))
        );
      } catch (err) {
        console.error("Erro ao atualizar produto:", err);
        setError("Erro ao atualizar produto");
        throw err;
      }
    },
    []
  );

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setError(null);
      await productsService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erro ao deletar produto:", err);
      setError("Erro ao deletar produto");
      throw err;
    }
  }, []);

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        refreshProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextType {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
