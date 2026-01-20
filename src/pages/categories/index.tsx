import { useState } from "react";
import { HiPlus, HiFolderOpen, HiPencil, HiTrash } from "react-icons/hi2";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { PageId } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/contexts/categories-context";
import { CategoryModal } from "./components/category-modal";
import { DeleteConfirmModal } from "./components/delete-confirm-modal";
import type { Category } from "@/types/database";

interface CategoriesPageProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export function CategoriesPage({ currentPage, onNavigate }: CategoriesPageProps) {
  const { categories, deleteCategory, isLoading } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Skeleton para item de categoria
  const CategoryItemSkeleton = () => (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
  };

  const confirmDelete = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <DashboardLayout
      title="Categorias"
      currentPage={currentPage}
      onNavigate={onNavigate}
      actions={
        <Button onClick={handleCreate}>
          <HiPlus className="h-4 w-4" />
          Nova Categoria
        </Button>
      }
    >
      {/* Estado de Loading - Skeletons */}
      {isLoading ? (
        <Card className="divide-y divide-lovely-secondary/10">
          {Array.from({ length: 5 }).map((_, i) => (
            <CategoryItemSkeleton key={i} />
          ))}
        </Card>
      ) : categories.length === 0 ? (
        // Estado vazio
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-lovely-secondary/10 text-lovely-secondary mb-4">
            <HiFolderOpen className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold text-lovely-white mb-2">
            Nenhuma categoria cadastrada
          </h2>
          <p className="text-lovely-white/60 mb-6 max-w-md">
            Comece adicionando sua primeira categoria.
          </p>
          <Button onClick={handleCreate}>
            <HiPlus className="h-4 w-4" />
            Adicionar Primeira Categoria
          </Button>
        </div>
      ) : (
        // Lista de categorias
        <Card className="divide-y divide-lovely-secondary/10">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-lovely-secondary/5 transition-colors"
            >
              {/* Nome da categoria */}
              <div className="flex items-center gap-3">
                <HiFolderOpen className="h-5 w-5 text-lovely-secondary/60" />
                <span className="font-medium text-lovely-white">
                  {category.name}
                </span>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEdit(category)}
                  className="p-2 rounded-lg text-lovely-white/60 hover:text-lovely-secondary hover:bg-lovely-secondary/10 transition-all duration-200"
                  aria-label="Editar categoria"
                >
                  <HiPencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  className="p-2 rounded-lg text-lovely-white/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  aria-label="Excluir categoria"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Modal de Criar/Editar */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={confirmDelete}
        categoryName={deletingCategory?.name || ""}
      />
    </DashboardLayout>
  );
}
