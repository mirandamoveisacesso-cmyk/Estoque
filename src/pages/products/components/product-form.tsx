import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import { useProducts, type Product, type ProductFormData } from "@/contexts/products-context";
import { useMaterials } from "@/contexts/materials-context";
import { useCategories } from "@/contexts/categories-context";
import { useDimensions } from "@/contexts/dimensions-context";
import { cn } from "@/lib/utils";

interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { addProduct, updateProduct } = useProducts();
  const { materials } = useMaterials();
  const { categories } = useCategories();
  const { dimensions } = useDimensions();
  const isEditing = !!product;

  // Estado do formulário
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    category: product?.category || "",
    categoryId: product?.categoryId || "",
    description: product?.description || "",
    price: product?.price || 0,
    discountPrice: product?.discountPrice,
    dimensions: product?.dimensions || [],
    materials: product?.materials || [],
    weightKg: product?.weightKg,
    warrantyMonths: product?.warrantyMonths || 12,
    assemblyRequired: product?.assemblyRequired ?? true,
    imageUrls: product?.imageUrls || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (formData.dimensions.length === 0) {
      newErrors.dimensions = "Selecione pelo menos uma dimensão";
    }
    if (formData.materials.length === 0) {
      newErrors.materials = "Selecione pelo menos um material";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Converte nomes de dimensões para IDs
      const dimensionIds = dimensions
        .filter((d) => formData.dimensions.includes(d.name))
        .map((d) => d.id);

      // Converte nomes de materiais para IDs
      const materialIds = materials
        .filter((m) => formData.materials.includes(m.name))
        .map((m) => m.id);

      if (isEditing && product) {
        await updateProduct(product.id, formData, dimensionIds, materialIds);
      } else {
        await addProduct(formData, dimensionIds, materialIds);
      }

      onSuccess();
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      setErrors({ name: "Erro ao salvar produto" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDimension = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: prev.dimensions.includes(name)
        ? prev.dimensions.filter((d) => d !== name)
        : [...prev.dimensions, name],
    }));
    setErrors((prev) => ({ ...prev, dimensions: "" }));
  };

  const toggleMaterial = (materialName: string) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.includes(materialName)
        ? prev.materials.filter((m) => m !== materialName)
        : [...prev.materials, materialName],
    }));
    setErrors((prev) => ({ ...prev, materials: "" }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({ ...prev, price: value }));
    setErrors((prev) => ({ ...prev, price: "" }));
  };

  const handleDiscountPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || undefined;
    setFormData((prev) => ({ ...prev, discountPrice: value }));
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Imagem */}
      <div>
        <label className="block text-sm font-medium text-lovely-white mb-2">
          Imagem do Produto
        </label>
        <ImageUpload
          value={formData.imageUrls}
          onChange={(urls) =>
            setFormData((prev) => ({ ...prev, imageUrls: urls }))
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
          placeholder="Ex: Sofá 3 Lugares Copenhague"
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

      {/* Preço à vista e Peso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preço à vista */}
        <div>
          <label
            htmlFor="discountPrice"
            className="block text-sm font-medium text-lovely-white mb-2"
          >
            Preço à Vista
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lovely-white/60 text-sm font-medium">
              R$
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.discountPrice || ""}
              onChange={handleDiscountPriceChange}
              placeholder="0.00"
              className="pl-10"
            />
          </div>
        </div>

        {/* Peso */}
        <div>
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-lovely-white mb-2"
          >
            Peso (kg)
          </label>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={formData.weightKg || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                weightKg: parseFloat(e.target.value) || undefined,
              }))
            }
            placeholder="Ex: 45.0"
          />
        </div>
      </div>

      {/* Garantia e Montagem */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Garantia */}
        <div>
          <label
            htmlFor="warranty"
            className="block text-sm font-medium text-lovely-white mb-2"
          >
            Garantia (meses)
          </label>
          <Input
            type="number"
            min="0"
            value={formData.warrantyMonths || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                warrantyMonths: parseInt(e.target.value) || 12,
              }))
            }
            placeholder="12"
          />
        </div>

        {/* Requer Montagem */}
        <div className="flex items-center gap-3 pt-7">
          <input
            type="checkbox"
            id="assemblyRequired"
            checked={formData.assemblyRequired}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                assemblyRequired: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-lovely-secondary/30"
          />
          <label
            htmlFor="assemblyRequired"
            className="text-sm font-medium text-lovely-white"
          >
            Requer Montagem
          </label>
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

      {/* Dimensões */}
      <div>
        <label className="block text-sm font-medium text-lovely-white mb-2">
          Dimensões Disponíveis *
        </label>
        <div className="flex flex-wrap gap-2">
          {dimensions.map((dimension) => {
            const isSelected = formData.dimensions.includes(dimension.name);
            return (
              <button
                key={dimension.id}
                type="button"
                onClick={() => toggleDimension(dimension.name)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200",
                  isSelected
                    ? "bg-lovely-secondary text-lovely-primary border-lovely-secondary"
                    : "bg-transparent text-lovely-white border-lovely-secondary/30 hover:border-lovely-secondary/60"
                )}
              >
                {dimension.name}
                {dimension.widthCm && (
                  <span className="text-xs opacity-70 ml-1">
                    ({dimension.widthCm}×{dimension.heightCm}×{dimension.depthCm}cm)
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {errors.dimensions && (
          <p className="mt-1.5 text-sm text-destructive">{errors.dimensions}</p>
        )}
      </div>

      {/* Materiais */}
      <div>
        <label className="block text-sm font-medium text-lovely-white mb-2">
          Materiais Disponíveis *
        </label>
        <div className="flex flex-wrap gap-2">
          {materials.map((material) => {
            const isSelected = formData.materials.includes(material.name);
            return (
              <button
                key={material.id}
                type="button"
                onClick={() => toggleMaterial(material.name)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all duration-200",
                  isSelected
                    ? "bg-lovely-secondary/20 text-lovely-secondary border-lovely-secondary"
                    : "bg-transparent text-lovely-white/70 border-lovely-secondary/30 hover:border-lovely-secondary/60"
                )}
              >
                {material.hexCode && (
                  <span
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ backgroundColor: material.hexCode }}
                  />
                )}
                {material.name}
              </button>
            );
          })}
        </div>
        {errors.materials && (
          <p className="mt-1.5 text-sm text-destructive">{errors.materials}</p>
        )}
      </div>

      {/* Materiais Selecionados */}
      {formData.materials.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-lovely-white/60 mb-2">
            Materiais selecionados:
          </label>
          <div className="flex flex-wrap gap-2">
            {formData.materials.map((materialName) => {
              const material = materials.find((m) => m.name === materialName);
              return (
                <Badge
                  key={materialName}
                  colorHex={material?.hexCode}
                  onRemove={() => toggleMaterial(materialName)}
                >
                  {materialName}
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
  );
}
