import { useState } from "react";
import { HiPlus, HiCube } from "react-icons/hi2";
import { motion } from "motion/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { PageId } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/contexts/products-context";
import { ProductCard } from "./components/product-card";
import { ProductListItem } from "./components/product-list-item";
import { ProductModal } from "./components/product-modal";
import { DeleteConfirmModal } from "./components/delete-confirm-modal";
import { ViewToggle, type ViewMode } from "./components/view-toggle";
import type { Product } from "@/contexts/products-context";

interface ProductsPageProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export function ProductsPage({ currentPage, onNavigate }: ProductsPageProps) {
  const { products, deleteProduct, isLoading } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Skeleton para modo cards
  const ProductCardSkeleton = () => (
    <div className="flex flex-col gap-2 rounded-xl bg-card p-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  // Skeleton para modo lista
  const ProductListItemSkeleton = () => (
    <div className="flex items-center gap-4 rounded-xl bg-card p-3">
      <Skeleton className="h-16 w-16 rounded-lg" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <DashboardLayout
      title="Produtos"
      currentPage={currentPage}
      onNavigate={onNavigate}
      actions={
        <div className="flex items-center gap-2 sm:gap-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Button onClick={handleCreate} size="sm" className="sm:hidden">
            <HiPlus className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate} className="hidden sm:inline-flex">
            <HiPlus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      }
    >
      {/* Estado de Loading - Skeletons */}
      {isLoading ? (
        viewMode === "cards" ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductListItemSkeleton key={i} />
            ))}
          </div>
        )
      ) : products.length === 0 ? (
        // Estado vazio com animação
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="p-4 rounded-full bg-lovely-secondary/10 text-lovely-secondary mb-4"
          >
            <HiCube className="h-12 w-12" />
          </motion.div>
          <h2 className="text-xl font-semibold text-lovely-white mb-2">
            Nenhum produto cadastrado
          </h2>
          <p className="text-lovely-white/60 mb-6 max-w-md">
            Comece adicionando seu primeiro produto ao catálogo. Clique no botão
            acima para começar.
          </p>
          <Button onClick={handleCreate}>
            <HiPlus className="h-4 w-4" />
            Adicionar Primeiro Produto
          </Button>
        </motion.div>
      ) : viewMode === "cards" ? (
        // Grid de produtos em cards com stagger
        <motion.div 
          key="cards-grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05, delayChildren: 0.1 }
            }
          }}
          className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { 
                    duration: 0.3,
                    ease: "easeOut"
                  }
                }
              }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              layout
              layoutId={`product-${product.id}`}
              custom={index}
            >
              <ProductCard
                product={product}
                onEdit={() => handleEdit(product)}
                onDelete={() => handleDelete(product)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        // Lista de produtos com stagger
        <motion.div 
          key="list-view"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.04, delayChildren: 0.05 }
            }
          }}
          className="flex flex-col gap-3"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { 
                  opacity: 1, 
                  x: 0,
                  transition: { duration: 0.25, ease: "easeOut" }
                }
              }}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              layout
              layoutId={`product-${product.id}`}
              custom={index}
            >
              <ProductListItem
                product={product}
                onEdit={() => handleEdit(product)}
                onDelete={() => handleDelete(product)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal de Criar/Editar */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={confirmDelete}
        productName={deletingProduct?.name || ""}
      />
    </DashboardLayout>
  );
}
