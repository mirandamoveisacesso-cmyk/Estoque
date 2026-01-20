// Tipos principais do catálogo de móveis

export interface Product {
    id: string;
    name: string;
    slug: string;
    category: string;
    categoryId: string;
    description: string;
    price: number;
    discountPrice?: number;
    dimensions: Dimension[];
    materials: Material[];
    weightKg?: number;
    warrantyMonths?: number;
    assemblyRequired?: boolean;
    imageUrl?: string;
    imageBase64?: string;
    isActive: boolean;
    isFeatured: boolean;
    stockStatus: StockStatus;
    createdAt: Date;
    updatedAt: Date;
}

export type ProductFormData = Omit<Product, "id" | "createdAt" | "updatedAt" | "slug">;

export interface Dimension {
    id: string;
    name: string;
    widthCm?: number;
    heightCm?: number;
    depthCm?: number;
    displayOrder: number;
    isActive: boolean;
}

export interface Material {
    id: string;
    name: string;
    type: MaterialType;
    hexCode?: string;
    description?: string;
    isCustom: boolean;
    displayOrder: number;
}

export type MaterialType = "wood" | "fabric" | "metal" | "glass" | "other";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";

// Categorias de móveis
export const PRODUCT_CATEGORIES = [
    "Sofás",
    "Mesas",
    "Cadeiras",
    "Camas",
    "Estantes",
    "Armários",
    "Cômodas",
    "Escrivaninhas",
    "Acessórios",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Tipos de materiais
export const MATERIAL_TYPES = [
    { value: "wood", label: "Madeira" },
    { value: "fabric", label: "Tecido" },
    { value: "metal", label: "Metal" },
    { value: "glass", label: "Vidro" },
    { value: "other", label: "Outro" },
] as const;

// Materiais padrão para exibição
export const DEFAULT_MATERIALS: Material[] = [
    { id: "1", name: "Madeira Maciça", type: "wood", hexCode: "#8B4513", isCustom: false, displayOrder: 1 },
    { id: "2", name: "MDF Freijó", type: "wood", hexCode: "#D2B48C", isCustom: false, displayOrder: 2 },
    { id: "3", name: "MDF Branco", type: "wood", hexCode: "#F5F5F5", isCustom: false, displayOrder: 3 },
    { id: "4", name: "MDF Preto", type: "wood", hexCode: "#2D2D2D", isCustom: false, displayOrder: 4 },
    { id: "5", name: "Linho Cru", type: "fabric", hexCode: "#FAF0E6", isCustom: false, displayOrder: 10 },
    { id: "6", name: "Veludo Verde", type: "fabric", hexCode: "#228B22", isCustom: false, displayOrder: 12 },
    { id: "7", name: "Veludo Azul", type: "fabric", hexCode: "#4169E1", isCustom: false, displayOrder: 13 },
    { id: "8", name: "Couro Marrom", type: "fabric", hexCode: "#8B4513", isCustom: false, displayOrder: 15 },
    { id: "9", name: "Metal Dourado", type: "metal", hexCode: "#FFD700", isCustom: false, displayOrder: 20 },
    { id: "10", name: "Metal Preto Fosco", type: "metal", hexCode: "#2D2D2D", isCustom: false, displayOrder: 21 },
    { id: "11", name: "Vidro Transparente", type: "glass", hexCode: "#E0FFFF", isCustom: false, displayOrder: 30 },
];

// Dimensões padrão
export const DEFAULT_DIMENSIONS: Dimension[] = [
    { id: "1", name: "Compacto", widthCm: 120, heightCm: 75, depthCm: 60, displayOrder: 1, isActive: true },
    { id: "2", name: "Padrão", widthCm: 180, heightCm: 85, depthCm: 80, displayOrder: 2, isActive: true },
    { id: "3", name: "Grande", widthCm: 240, heightCm: 90, depthCm: 90, displayOrder: 3, isActive: true },
    { id: "4", name: "King", widthCm: 300, heightCm: 95, depthCm: 100, displayOrder: 4, isActive: true },
];

// Status de estoque
export const STOCK_STATUS_OPTIONS = [
    { value: "in_stock", label: "Em Estoque" },
    { value: "low_stock", label: "Estoque Baixo" },
    { value: "out_of_stock", label: "Sem Estoque" },
    { value: "made_to_order", label: "Sob Encomenda" },
] as const;
