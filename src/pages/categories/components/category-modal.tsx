import { Modal } from "@/components/ui/modal";
import { CategoryForm } from "./category-form";
import type { Category } from "@/types/database";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const isEditing = !!category;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Categoria" : "Nova Categoria"}
      description={
        isEditing
          ? "Atualize as informações da categoria"
          : "Preencha os dados da nova categoria"
      }
      size="md"
    >
      <CategoryForm category={category} onSuccess={onClose} onCancel={onClose} />
    </Modal>
  );
}
