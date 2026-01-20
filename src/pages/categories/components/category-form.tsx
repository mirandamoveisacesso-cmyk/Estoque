import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/contexts/categories-context";
import type { Category } from "@/types/database";

interface CategoryFormProps {
  category: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const { addCategory, updateCategory } = useCategories();
  const isEditing = !!category;

  const [name, setName] = useState(category?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (isEditing && category) {
        await updateCategory(category.id, name);
      } else {
        await addCategory(name);
      }
      onSuccess();
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
      setErrors({ name: "Erro ao salvar categoria" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-lovely-white mb-2"
        >
          Nome da Categoria *
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: "" }));
          }}
          placeholder="Ex: Vestidos"
          error={errors.name}
          autoFocus
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-lovely-secondary/20">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
