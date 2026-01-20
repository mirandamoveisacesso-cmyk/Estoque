import { HiPencil, HiTrash, HiCube } from "react-icons/hi2";
import { Badge } from "@/components/ui/badge";
import { useMaterials } from "@/contexts/materials-context";
import type { Product } from "@/contexts/products-context";

interface ProductListItemProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductListItem({ product, onEdit, onDelete }: ProductListItemProps) {
  const { materials } = useMaterials();

  const getMaterialHex = (materialName: string): string | undefined => {
    const material = materials.find((m) => m.name === materialName);
    return material?.hexCode;
  };

  return (
    <div className="group flex items-center gap-4 p-4 bg-lovely-primary/30 rounded-xl border border-lovely-secondary/10 hover:border-lovely-secondary/30 hover:bg-lovely-primary/50 transition-colors duration-300">
      {/* Imagem Thumbnail */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-lovely-secondary/5">
        {product.imageUrls[0] ? (
          <img
            src={product.imageUrls[0]}
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
          {product.discountPrice && (
            <span className="text-xs text-green-400 whitespace-nowrap">
              À vista: {product.discountPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          )}
        </div>

        {/* Dimensões e Materiais em linha */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dimensões */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-lovely-white/50 mr-1">Dimensões:</span>
            {product.dimensions.slice(0, 3).map((dimension) => (
              <Badge key={dimension} variant="outline" className="text-[10px] px-1.5 py-0.5">
                {dimension}
              </Badge>
            ))}
            {product.dimensions.length > 3 && (
              <span className="text-[10px] text-lovely-white/50">
                +{product.dimensions.length - 3}
              </span>
            )}
          </div>

          {/* Separador */}
          <div className="hidden sm:block w-px h-4 bg-lovely-secondary/20" />

          {/* Materiais */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-lovely-white/50 mr-1">Materiais:</span>
            {product.materials.slice(0, 4).map((materialName) => (
              <span
                key={materialName}
                className="w-4 h-4 rounded-full border border-lovely-white/20 shadow-sm transition-transform duration-200 hover:scale-110"
                style={{ backgroundColor: getMaterialHex(materialName) || "#888" }}
                title={materialName}
              />
            ))}
            {product.materials.length > 4 && (
              <span className="text-[10px] text-lovely-white/50">
                +{product.materials.length - 4}
              </span>
            )}
          </div>

          {/* Info de Montagem */}
          {product.assemblyRequired === false && (
            <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              Pronta Entrega
            </span>
          )}
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
