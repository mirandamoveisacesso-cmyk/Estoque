import { supabase } from "@/lib/supabase";
import type {
    Product,
    ProductInsert,
    ProductUpdate,
} from "@/types/database";

// Função para gerar slug a partir do nome
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

// Interface para criação de produto
export interface CreateProductDTO {
    name: string;
    description?: string;
    price: number;
    discountPrice?: number;
    imageUrls?: string[]; // Renamed from imageUrl
    videoUrl?: string;

    // Novos campos
    category: string;
    sector: string;
    stockQuantity: number;
    colors: string;
    models: string;
    dimensions: string;
    isKit: boolean;
    seoSlug: string;
}

// Interface para atualização de produto
export interface UpdateProductDTO {
    name?: string;
    description?: string;
    price?: number;
    discountPrice?: number;
    imageUrls?: string[]; // Renamed from imageUrl
    videoUrl?: string;

    // Novos campos
    category?: string;
    sector?: string;
    stockQuantity?: number;
    colors?: string;
    models?: string;
    dimensions?: string;
    isKit?: boolean;
    seoSlug?: string;
}

export const productsService = {
    /**
     * Busca todos os produtos ativos
     */
    async getAll(): Promise<Product[]> {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao buscar produtos:", error);
            throw error;
        }

        return data || [];
    },

    /**
     * Busca um produto por ID
     */
    async getById(id: string): Promise<Product | null> {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            console.error("Erro ao buscar produto:", error);
            throw error;
        }

        return data;
    },

    /**
     * Cria um novo produto
     */
    async create(dto: CreateProductDTO): Promise<Product> {
        const productData: ProductInsert = {
            name: dto.name,
            slug: generateSlug(dto.name),
            description: dto.description || null,
            price: dto.price,
            discount_price: dto.discountPrice || null,
            // Mantendo compatibilidade por enquanto (primeira imagem)
            image_url: dto.imageUrls?.[0] || null,
            image_urls: dto.imageUrls || [],
            video_url: dto.videoUrl || null,

            category: dto.category,
            sector: dto.sector,
            stock_quantity: dto.stockQuantity,
            colors: dto.colors,
            models: dto.models,
            dimensions: dto.dimensions,
            is_kit: dto.isKit,
            seo_slug: dto.seoSlug || null
        };

        const { data, error } = await supabase
            .from("products")
            .insert(productData)
            .select()
            .single();

        if (error) {
            console.error("Erro ao criar produto:", error);
            throw error;
        }

        return data;
    },

    /**
     * Atualiza um produto existente
     */
    async update(id: string, dto: UpdateProductDTO): Promise<Product> {
        const updateData: ProductUpdate = {};

        if (dto.name !== undefined) {
            updateData.name = dto.name;
            updateData.slug = generateSlug(dto.name);
        }
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.price !== undefined) updateData.price = dto.price;
        if (dto.discountPrice !== undefined) updateData.discount_price = dto.discountPrice;

        if (dto.imageUrls !== undefined) {
            updateData.image_urls = dto.imageUrls;
            updateData.image_url = dto.imageUrls[0] || null; // Compatibilidade
        }
        if (dto.videoUrl !== undefined) updateData.video_url = dto.videoUrl;

        if (dto.category !== undefined) updateData.category = dto.category;
        if (dto.sector !== undefined) updateData.sector = dto.sector;
        if (dto.stockQuantity !== undefined) updateData.stock_quantity = dto.stockQuantity;
        if (dto.colors !== undefined) updateData.colors = dto.colors;
        if (dto.models !== undefined) updateData.models = dto.models;
        if (dto.dimensions !== undefined) updateData.dimensions = dto.dimensions;
        if (dto.isKit !== undefined) updateData.is_kit = dto.isKit;
        if (dto.seoSlug !== undefined) updateData.seo_slug = dto.seoSlug;

        const { data, error } = await supabase
            .from("products")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Erro ao atualizar produto:", error);
            throw error;
        }

        return data;
    },

    /**
     * Remove um produto (soft delete)
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("products")
            .update({ is_active: false })
            .eq("id", id);

        if (error) {
            console.error("Erro ao deletar produto:", error);
            throw error;
        }
    },
};
