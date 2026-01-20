// Tipos para categorias do catálogo de móveis

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type CategoryFormData = Omit<Category, "id" | "createdAt" | "updatedAt" | "slug">;
