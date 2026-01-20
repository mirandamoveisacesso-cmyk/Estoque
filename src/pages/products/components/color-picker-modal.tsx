import { useState, type FormEvent } from "react";
import { HiXMark, HiCheck } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useColors } from "@/contexts/colors-context";

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ColorPickerModal({ isOpen, onClose, onSuccess }: ColorPickerModalProps) {
  const { addColor, colors } = useColors();
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#ea9fc2");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!colorName.trim()) {
      setError("Digite um nome para a cor");
      return;
    }

    // Verifica se já existe uma cor com esse nome
    const exists = colors.some(
      (c) => c.name.toLowerCase() === colorName.trim().toLowerCase()
    );
    if (exists) {
      setError("Já existe uma cor com esse nome");
      return;
    }

    addColor(colorName.trim(), colorHex);
    setColorName("");
    setColorHex("#ea9fc2");
    setError("");
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    setColorName("");
    setColorHex("#ea9fc2");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nova Cor">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Color Picker e Preview */}
        <div className="flex items-center gap-4">
          {/* Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-16 h-16 rounded-xl cursor-pointer border-2 border-lovely-secondary/30 hover:border-lovely-secondary/60 transition-colors"
              style={{ backgroundColor: colorHex }}
            />
          </div>

          {/* Preview */}
          <div className="flex-1 p-4 rounded-xl bg-lovely-primary/50 border border-lovely-secondary/20">
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-full border-2 border-lovely-white/30 shadow-lg transition-all duration-200"
                style={{ backgroundColor: colorHex }}
              />
              <div>
                <p className="text-sm text-lovely-white/60">Preview</p>
                <p className="text-lovely-white font-medium">
                  {colorName || "Nome da cor"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nome da Cor */}
        <div>
          <label
            htmlFor="colorName"
            className="block text-sm font-medium text-lovely-white mb-2"
          >
            Nome da Cor *
          </label>
          <Input
            id="colorName"
            value={colorName}
            onChange={(e) => {
              setColorName(e.target.value);
              setError("");
            }}
            placeholder="Ex: Coral, Lavanda, Terracota..."
            error={error}
          />
        </div>

        {/* Hex atual */}
        <div className="flex items-center gap-2 text-sm text-lovely-white/50">
          <span>Código:</span>
          <code className="px-2 py-1 rounded bg-lovely-primary/50 font-mono text-lovely-secondary">
            {colorHex.toUpperCase()}
          </code>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-lovely-secondary/20">
          <Button type="button" variant="ghost" onClick={handleClose}>
            <HiXMark className="h-4 w-4" />
            Cancelar
          </Button>
          <Button type="submit">
            <HiCheck className="h-4 w-4" />
            Criar Cor
          </Button>
        </div>
      </form>
    </Modal>
  );
}
