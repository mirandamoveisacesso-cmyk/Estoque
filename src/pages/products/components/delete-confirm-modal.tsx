import { HiExclamationTriangle } from "react-icons/hi2";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        {/* Ícone */}
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <HiExclamationTriangle className="h-6 w-6 text-destructive" />
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-lovely-white mb-2">
          Excluir Produto
        </h3>

        {/* Mensagem */}
        <p className="text-lovely-white/70 mb-6">
          Tem certeza que deseja excluir{" "}
          <span className="font-medium text-lovely-white">"{productName}"</span>?
          Esta ação não pode ser desfeita.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Excluir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
