import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { useProducts, type Product, type ProductFormData } from "@/contexts/products-context";

interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { addProduct, updateProduct } = useProducts();
  const isEditing = !!product;

  // Estado do formulário
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    category: product?.category || "",
    sector: product?.sector || "",
    description: product?.description || "",
    price: product?.price || 0,
    discountPrice: product?.discount_price || undefined,
    stockQuantity: product?.stock_quantity || 0,
    colors: product?.colors || "",
    models: product?.models || "",
    dimensions: product?.dimensions || "",
    isKit: product?.is_kit || false,
    imageUrls: product?.image_urls?.length
      ? product.image_urls
      : product?.image_url
        ? [product.image_url]
        : [],
    videoUrl: product?.video_url || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.category.trim()) newErrors.category = "Categoria é obrigatória";
    if (!formData.sector.trim()) newErrors.sector = "Setor é obrigatório";
    if (formData.price < 0) newErrors.price = "Preço não pode ser negativo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (isEditing && product) {
        await updateProduct(product.id, formData);
      } else {
        await addProduct(formData);
      }

      onSuccess();
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      // setErrors handled in context or just log here? context sets generic error.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Imagem */}
      <div>
        <label className="block text-sm font-medium text-lovely-white mb-2">
          Imagens do Produto (Máx. 5)
        </label>
        <ImageUpload
          value={formData.imageUrls}
          onChange={(urls) => handleChange("imageUrls", urls)}
          maxImages={5}
        />
      </div>

      {/* Video URL */}
      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium text-lovely-white mb-2">
          Link do Vídeo (YouTube/Vimeo)
        </label>
        <Input
          id="videoUrl"
          value={formData.videoUrl || ""}
          onChange={(e) => handleChange("videoUrl", e.target.value)}
          placeholder="https://..."
        />
      </div>

      {/* Nome */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-lovely-white mb-2">
          Nome do Produto *
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ex: Sofá Copenhague"
          error={errors.name}
        />
      </div>

      {/* Categoria e Setor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-lovely-white mb-2">
            Categoria *
          </label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="Ex: Sofás"
            error={errors.category}
          />
        </div>
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-lovely-white mb-2">
            Setor *
          </label>
          <Input
            id="sector"
            value={formData.sector}
            onChange={(e) => handleChange("sector", e.target.value)}
            placeholder="Ex: Sala de Estar"
            error={errors.sector}
          />
        </div>
      </div>

      {/* Preço e Estoque */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-lovely-white mb-2">
            Preço *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lovely-white/60 text-sm font-medium">R$</span>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              className="pl-10"
              value={formData.price}
              onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
              error={errors.price}
            />
          </div>
        </div>

        <div>
          <label htmlFor="discountPrice" className="block text-sm font-medium text-lovely-white mb-2">
            Preço Promo (Opcional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lovely-white/60 text-sm font-medium">R$</span>
            <Input
              id="discountPrice"
              type="number"
              step="0.01"
              min="0"
              className="pl-10"
              value={formData.discountPrice || ""}
              onChange={(e) => handleChange("discountPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-lovely-white mb-2">
            Estoque
          </label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stockQuantity}
            onChange={(e) => handleChange("stockQuantity", parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Listas de Texto: Cores, Modelos, Medidas */}
      <div className="space-y-4">
        <div>
          <label htmlFor="colors" className="block text-sm font-medium text-lovely-white mb-2">
            Cores Disponíveis
          </label>
          <Input
            id="colors"
            value={formData.colors || ""}
            onChange={(e) => handleChange("colors", e.target.value)}
            placeholder="Ex: Azul, Vermelho, Preto (separado por vírgula ou texto livre)"
          />
        </div>

        <div>
          <label htmlFor="models" className="block text-sm font-medium text-lovely-white mb-2">
            Modelos
          </label>
          <Input
            id="models"
            value={formData.models || ""}
            onChange={(e) => handleChange("models", e.target.value)}
            placeholder="Ex: Retrátil, Fixo (texto livre)"
          />
        </div>

        <div>
          <label htmlFor="dimensions" className="block text-sm font-medium text-lovely-white mb-2">
            Medidas
          </label>
          <Input
            id="dimensions"
            value={formData.dimensions || ""}
            onChange={(e) => handleChange("dimensions", e.target.value)}
            placeholder="Ex: 2.10m, 2.50m (texto livre)"
          />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-lovely-white mb-2">
          Descrição
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Descreva o produto..."
          rows={3}
        />
      </div>

      {/* Kit Checkbox */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isKit"
          checked={formData.isKit}
          onChange={(e) => handleChange("isKit", e.target.checked)}
          className="h-4 w-4 rounded border-lovely-secondary/30 accent-lovely-secondary"
        />
        <label htmlFor="isKit" className="text-sm font-medium text-lovely-white">
          Este produto é um Kit?
        </label>
      </div>

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
