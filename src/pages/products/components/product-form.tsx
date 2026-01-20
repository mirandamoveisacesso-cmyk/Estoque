import { useState, type FormEvent } from "react";
import { HiPlus } from "react-icons/hi2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import { useProducts, type Product, type ProductFormData } from "@/contexts/products-context";
import { useColors } from "@/contexts/colors-context";
import { useCategories } from "@/contexts/categories-context";
import { useSizes } from "@/contexts/sizes-context";
import { cn } from "@/lib/utils";
import { ColorPickerModal } from "./color-picker-modal";

interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { addProduct, updateProduct } = useProducts();
  const { colors } = useColors();
  const { categories } = useCategories();
  const { sizes } = useSizes();
  const isEditing = !!product;

  // Estado do formulário
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    category: product?.category || "",
    categoryId: product?.categoryId || "",
    description: product?.description || "",
    price: product?.price || 0,
    sizes: product?.sizes || [], // Códigos de tamanho (PP, P, M...)
    colors: product?.colors || [], // Nomes de cores
    imageUrl: product?.imageUrl || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }
    if (!formData.categoryId) {
      newErrors.category = "Categoria é obrigatória";
    }
    if (formData.price <= 0) {
      newErrors.price = "Preço deve ser maior que zero";
    }
    if (formData.sizes.length === 0) {
      newErrors.sizes = "Selecione pelo menos um tamanho";
    }
    if (formData.colors.length === 0) {
      newErrors.colors = "Selecione pelo menos uma cor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Converte códigos de tamanho para IDs
      const sizeIds = sizes
        .filter((s) => formData.sizes.includes(s.code))
        .map((s) => s.id);

      // Converte nomes de cores para IDs
      const colorIds = colors
        .filter((c) => formData.colors.includes(c.name))
        .map((c) => c.id);

      if (isEditing && product) {
        await updateProduct(product.id, formData, sizeIds, colorIds);
      } else {
        await addProduct(formData, sizeIds, colorIds);
      }

      onSuccess();
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      setErrors({ name: "Erro ao salvar produto" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSize = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(code)
        ? prev.sizes.filter((s) => s !== code)
        : [...prev.sizes, code],
    }));
    setErrors((prev) => ({ ...prev, sizes: "" }));
  };

  const toggleColor = (colorName: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(colorName)
        ? prev.colors.filter((c) => c !== colorName)
        : [...prev.colors, colorName],
    }));
    setErrors((prev) => ({ ...prev, colors: "" }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({ ...prev, price: value }));
    setErrors((prev) => ({ ...prev, price: "" }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const category = categories.find((c) => c.id === categoryId);
    setFormData((prev) => ({
      ...prev,
      categoryId,
      category: category?.name || "",
    }));
    setErrors((prev) => ({ ...prev, category: "" }));
  };

  // Opções de categoria vindas do Supabase
  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Imagem */}
        <div>
          <label className="block text-sm font-medium text-lovely-white mb-2">
            Imagem do Produto
          </label>
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) =>
              setFormData((prev) => ({ ...prev, imageUrl: url }))
            }
          />
        </div>

        {/* Nome */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-lovely-white mb-2"
          >
            Nome do Produto *
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="Ex: Vestido Floral Midi"
            error={errors.name}
          />
        </div>

        {/* Categoria e Preço - lado a lado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Categoria */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-lovely-white mb-2"
            >
              Categoria *
            </label>
            <Select
              id="category"
              value={formData.categoryId}
              onChange={handleCategoryChange}
              options={categoryOptions}
              placeholder="Selecione uma categoria"
            />
            {errors.category && (
              <p className="mt-1.5 text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Preço */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-lovely-white mb-2"
            >
              Preço *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lovely-white/60 text-sm font-medium">
                R$
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ""}
                onChange={handlePriceChange}
                placeholder="0.00"
                className="pl-10"
                error={errors.price}
              />
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-lovely-white mb-2"
          >
            Descrição
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Descreva o produto..."
            rows={3}
          />
        </div>

        {/* Tamanhos - vindos do Supabase */}
        <div>
          <label className="block text-sm font-medium text-lovely-white mb-2">
            Tamanhos Disponíveis *
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = formData.sizes.includes(size.code);
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => toggleSize(size.code)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200",
                    isSelected
                      ? "bg-lovely-secondary text-lovely-primary border-lovely-secondary"
                      : "bg-transparent text-lovely-white border-lovely-secondary/30 hover:border-lovely-secondary/60"
                  )}
                >
                  {size.code}
                </button>
              );
            })}
          </div>
          {errors.sizes && (
            <p className="mt-1.5 text-sm text-destructive">{errors.sizes}</p>
          )}
        </div>

        {/* Cores - vindas do Supabase */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-lovely-white">
              Cores Disponíveis *
            </label>
            <button
              type="button"
              onClick={() => setIsColorModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-lovely-secondary hover:text-lovely-accent border border-lovely-secondary/30 hover:border-lovely-secondary/60 rounded-lg transition-all duration-200"
            >
              <HiPlus className="h-3 w-3" />
              Nova Cor
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = formData.colors.includes(color.name);
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => toggleColor(color.name)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all duration-200",
                    isSelected
                      ? "bg-lovely-secondary/20 text-lovely-secondary border-lovely-secondary"
                      : "bg-transparent text-lovely-white/70 border-lovely-secondary/30 hover:border-lovely-secondary/60",
                    color.isCustom && "ring-1 ring-lovely-accent/30"
                  )}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                  {color.isCustom && (
                    <span className="text-[10px] text-lovely-accent">✨</span>
                  )}
                </button>
              );
            })}
          </div>
          {errors.colors && (
            <p className="mt-1.5 text-sm text-destructive">{errors.colors}</p>
          )}
        </div>

        {/* Cores Selecionadas */}
        {formData.colors.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-lovely-white/60 mb-2">
              Cores selecionadas:
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.colors.map((colorName) => {
                const color = colors.find((c) => c.name === colorName);
                return (
                  <Badge
                    key={colorName}
                    colorHex={color?.hex}
                    onRemove={() => toggleColor(colorName)}
                  >
                    {colorName}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-lovely-secondary/20">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Salvar Alterações" : "Criar Produto"}
          </Button>
        </div>
      </form>

      {/* Modal de Nova Cor */}
      <ColorPickerModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        onSuccess={() => {}}
      />
    </>
  );
}
