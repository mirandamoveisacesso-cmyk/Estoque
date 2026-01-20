import { HiPencil, HiTrash, HiCube } from "react-icons/hi2";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMaterials } from "@/contexts/materials-context";
import type { Product } from "@/contexts/products-context";

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { materials } = useMaterials();

  const getMaterialHex = (materialName: string): string | undefined => {
    const material = materials.find((m) => m.name === materialName);
    return material?.hexCode;
  };

  return (
    <Card className="group overflow-hidden hover:border-lovely-secondary/40 hover:shadow-xl hover:shadow-lovely-secondary/5 transition-all duration-300">
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden bg-lovely-secondary/5">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiCube className="h-12 w-12 text-lovely-secondary/30" />
          </div>
        )}

        {/* Overlay com ações */}
        <div className="absolute inset-0 bg-gradient-to-t from-lovely-primary/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-lg bg-lovely-secondary/20 hover:bg-lovely-secondary/30 text-lovely-white backdrop-blur-sm border border-lovely-secondary/30 transition-all duration-200 hover:scale-105"
            aria-label="Editar produto"
          >
            <HiPencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 text-destructive backdrop-blur-sm border border-destructive/30 transition-all duration-200 hover:scale-105"
            aria-label="Excluir produto"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 space-y-2">
        {/* Categoria */}
        <span className="text-[11px] font-medium text-lovely-accent uppercase tracking-wide">
          {product.category}
        </span>

        {/* Nome */}
        <h3 className="text-sm font-semibold text-lovely-white line-clamp-1">
          {product.name}
        </h3>

        {/* Preço */}
        <div className="flex items-center gap-2">
          <p className="text-base font-bold text-lovely-secondary">
            {(product.price ?? 0).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          {product.discountPrice && (
            <p className="text-xs text-green-400">
              À vista: {product.discountPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          )}
        </div>

        {/* Dimensões */}
        <div className="flex flex-wrap gap-1">
          {product.dimensions.slice(0, 4).map((dimension) => (
            <Badge key={dimension} variant="outline" className="text-[10px] px-1.5 py-0.5">
              {dimension}
            </Badge>
          ))}
          {product.dimensions.length > 4 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
              +{product.dimensions.length - 4}
            </Badge>
          )}
        </div>

        {/* Materiais */}
        <div className="flex items-center gap-1">
          {product.materials.slice(0, 4).map((materialName) => (
            <span
              key={materialName}
              className="w-4 h-4 rounded-full border border-lovely-white/20 shadow-sm"
              style={{ backgroundColor: getMaterialHex(materialName) || "#888" }}
              title={materialName}
            />
          ))}
          {product.materials.length > 4 && (
            <span className="text-xs text-lovely-white/60">
              +{product.materials.length - 4}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
