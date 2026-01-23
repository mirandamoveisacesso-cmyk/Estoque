import { HiPencil, HiTrash, HiCube } from "react-icons/hi2";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/contexts/products-context";

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  // Parsing text fields to arrays for display if they are comma separated
  const colors = product.colors ? product.colors.split(',').map(s => s.trim()).filter(Boolean) : [];
  const models = product.models ? product.models.split(',').map(s => s.trim()).filter(Boolean) : [];
  const dimensions = product.dimensions ? product.dimensions.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <Card className="group overflow-hidden hover:border-lovely-secondary/40 hover:shadow-xl hover:shadow-lovely-secondary/5 transition-all duration-300">
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden bg-lovely-secondary/5">
        {(product.image_urls?.[0] || product.image_url) ? (
          <img
            src={product.image_urls?.[0] || product.image_url || ""}
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
          {product.category || "Sem categoria"}
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
          {product.discount_price && (
            <p className="text-xs text-green-400">
              À vista: {product.discount_price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          )}
        </div>

        {/* Cores (Badge) */}
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {colors.slice(0, 3).map((color, i) => (
              <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0.5 border-lovely-secondary/30 text-lovely-white/70">
                {color}
              </Badge>
            ))}
            {colors.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-lovely-secondary/30 text-lovely-white/70">
                +{colors.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Estoque */}
        <div className="text-[10px] text-lovely-white/50">
          Estoque: {product.stock_quantity || 0}
        </div>

        {/* Dimensões */}
        {dimensions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {dimensions.slice(0, 2).map((dim, i) => (
              <Badge key={i} variant="outline" className="text-[9px] px-1 py-0 border-lovely-white/20 text-lovely-white/60">
                {dim}
              </Badge>
            ))}
          </div>
        )}

        {/* Modelos */}
        {models.length > 0 && (
          <div className="text-[10px] text-lovely-white/50 mt-1 truncate">
            {models.join(", ")}
          </div>
        )}
      </div>
    </Card>
  );
}
