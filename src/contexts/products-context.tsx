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
import type { Product as DBProduct } from "@/types/database";

// Interface compatível com o frontend
export interface Product extends DBProduct {
  // Campos adicionais de UI se necessário, mas por enquanto vamos estender o DBProduct
  // O DBProduct já tem tudo que precisamos: name, category, sector, etc.
}

export interface ProductFormData {
  name: string;
  category: string;
  sector: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  colors: string;
  models: string;
  dimensions: string;
  isKit: boolean;
  imageUrls: string[];
  videoUrl?: string; // New field
  seoKeys: string[]; // Frontend handles as array of tags
}

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  addProduct: (data: ProductFormData) => Promise<void>;
  updateProduct: (id: string, data: ProductFormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Converte DBProduct para Product (se precisarmos de formatação extra)
// function toProduct(p: DBProduct): Product {
//   return p;
// }

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
      setProducts(data);
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
    async (data: ProductFormData) => {
      try {
        setError(null);
        const dto: CreateProductDTO = {
          name: data.name,
          category: data.category,
          sector: data.sector,
          description: data.description,
          price: data.price,
          discountPrice: data.discountPrice,
          imageUrls: data.imageUrls,
          videoUrl: data.videoUrl,
          stockQuantity: data.stockQuantity,
          colors: data.colors,
          models: data.models,
          dimensions: data.dimensions,
          isKit: data.isKit,
          seoSlug: data.seoKeys.join("-"), // Convert array to slug
        };

        const newProduct = await productsService.create(dto);
        setProducts((prev) => [newProduct, ...prev]);
      } catch (err) {
        console.error("Erro ao criar produto:", err);
        setError("Erro ao criar produto");
        throw err;
      }
    },
    []
  );

  const updateProduct = useCallback(
    async (id: string, data: ProductFormData) => {
      try {
        setError(null);
        const dto: UpdateProductDTO = {
          name: data.name,
          category: data.category,
          sector: data.sector,
          description: data.description,
          price: data.price,
          discountPrice: data.discountPrice,
          imageUrls: data.imageUrls,
          videoUrl: data.videoUrl,
          stockQuantity: data.stockQuantity,
          colors: data.colors,
          models: data.models,
          dimensions: data.dimensions,
          isKit: data.isKit,
          seoSlug: data.seoKeys.join("-"), // Convert array to slug
        };

        const updated = await productsService.update(id, dto);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updated : p))
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
