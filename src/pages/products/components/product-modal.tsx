import { Modal } from "@/components/ui/modal";
import { ProductForm } from "./product-form";
import type { Product } from "@/contexts/products-context";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const isEditing = !!product;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Produto" : "Novo Produto"}
      description={
        isEditing
          ? "Atualize as informações do produto"
          : "Preencha os dados do novo produto"
      }
      size="xl"
    >
      <ProductForm product={product} onSuccess={onClose} onCancel={onClose} />
    </Modal>
  );
}
