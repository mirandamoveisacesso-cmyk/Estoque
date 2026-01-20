import { HiPencil, HiTrash, HiCube } from "react-icons/hi2";
import { Badge } from "@/components/ui/badge";
import { useColors } from "@/contexts/colors-context";
import type { Product } from "@/contexts/products-context";

interface ProductListItemProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductListItem({ product, onEdit, onDelete }: ProductListItemProps) {
  const { colors } = useColors();

  const getColorHex = (colorName: string): string | undefined => {
    const color = colors.find((c) => c.name === colorName);
    return color?.hex;
  };

  return (
    <div className="group flex items-center gap-4 p-4 bg-lovely-primary/30 rounded-xl border border-lovely-secondary/10 hover:border-lovely-secondary/30 hover:bg-lovely-primary/50 transition-colors duration-300">
      {/* Imagem Thumbnail */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-lovely-secondary/5">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex-none w-6 h-6">
              <HiCube className="h-6 w-6 text-lovely-secondary/30" />
            </div>
          </div>
        )}
      </div>

      {/* Informações do Produto */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Categoria e Nome */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-lovely-accent uppercase tracking-wide px-2 py-0.5 bg-lovely-accent/10 rounded-full">
            {product.category}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <h3 className="text-sm sm:text-base font-semibold text-lovely-white truncate">
            {product.name}
          </h3>
          <span className="text-sm font-bold text-lovely-secondary whitespace-nowrap">
            {(product.price ?? 0).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>

        {/* Tamanhos e Cores em linha */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tamanhos */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-lovely-white/50 mr-1">Tamanhos:</span>
            {product.sizes.slice(0, 3).map((size) => (
              <Badge key={size} variant="outline" className="text-[10px] px-1.5 py-0.5">
                {size}
              </Badge>
            ))}
            {product.sizes.length > 3 && (
              <span className="text-[10px] text-lovely-white/50">
                +{product.sizes.length - 3}
              </span>
            )}
          </div>

          {/* Separador */}
          <div className="hidden sm:block w-px h-4 bg-lovely-secondary/20" />

          {/* Cores */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-lovely-white/50 mr-1">Cores:</span>
            {product.colors.slice(0, 4).map((colorName) => (
              <span
                key={colorName}
                className="w-4 h-4 rounded-full border border-lovely-white/20 shadow-sm transition-transform duration-200 hover:scale-110"
                style={{ backgroundColor: getColorHex(colorName) || "#888" }}
                title={colorName}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-lovely-white/50">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ações - visíveis em hover no desktop, sempre visíveis no mobile */}
      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 rounded-lg bg-lovely-secondary/20 hover:bg-lovely-secondary/30 text-lovely-white border border-lovely-secondary/30 transition-colors duration-200"
          aria-label="Editar produto"
        >
          <div className="flex-none w-4 h-4">
            <HiPencil className="h-4 w-4" />
          </div>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30 transition-colors duration-200"
          aria-label="Excluir produto"
        >
          <div className="flex-none w-4 h-4">
            <HiTrash className="h-4 w-4" />
          </div>
        </button>
      </div>
    </div>
  );
}
