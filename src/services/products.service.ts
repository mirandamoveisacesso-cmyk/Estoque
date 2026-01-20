import { supabase } from "@/lib/supabase";
import type {
    Product,
    ProductInsert,
    ProductUpdate,
    ProductWithRelations,
    Category,
    Material,
    Dimension,
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

// Interface para criação de produto com relacionamentos
export interface CreateProductDTO {
    name: string;
    categoryId: string;
    description?: string;
    price: number;
    discountPrice?: number;
    imageUrl?: string;
    weightKg?: number;
    warrantyMonths?: number;
    assemblyRequired?: boolean;
    dimensionIds: string[];
    materialIds: string[];
}

// Interface para atualização de produto
export interface UpdateProductDTO {
    name?: string;
    categoryId?: string;
    description?: string;
    price?: number;
    discountPrice?: number;
    imageUrl?: string;
    weightKg?: number;
    warrantyMonths?: number;
    assemblyRequired?: boolean;
    dimensionIds?: string[];
    materialIds?: string[];
}

export const productsService = {
    /**
     * Busca todos os produtos ativos com relacionamentos
     */
    async getAll(): Promise<ProductWithRelations[]> {
        // Busca produtos
        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (productsError) {
            console.error("Erro ao buscar produtos:", productsError);
            throw productsError;
        }

        if (!products || products.length === 0) {
            return [];
        }

        const typedProducts = products as Product[];

        // Busca relacionamentos para todos os produtos
        const productIds = typedProducts.map((p) => p.id);

        // Busca categorias
        const categoryIds = [...new Set(typedProducts.map((p) => p.category_id))];
        const { data: categories } = await supabase
            .from("categories")
            .select("*")
            .in("id", categoryIds);

        // Busca relações de dimensões
        const { data: productDimensions } = await supabase
            .from("product_dimensions")
            .select("product_id, dimension_id")
            .in("product_id", productIds);

        // Busca relações de materiais
        const { data: productMaterials } = await supabase
            .from("product_materials")
            .select("product_id, material_id")
            .in("product_id", productIds);

        // Busca todos os dimensões e materiais necessários
        const dimensionIds = [...new Set(((productDimensions as { product_id: string; dimension_id: string }[]) || []).map((pd) => pd.dimension_id))];
        const materialIds = [...new Set(((productMaterials as { product_id: string; material_id: string }[]) || []).map((pm) => pm.material_id))];

        let dimensions: Dimension[] = [];
        let materials: Material[] = [];

        if (dimensionIds.length > 0) {
            const { data } = await supabase.from("dimensions").select("*").in("id", dimensionIds);
            dimensions = (data as Dimension[]) || [];
        }

        if (materialIds.length > 0) {
            const { data } = await supabase.from("materials").select("*").in("id", materialIds);
            materials = (data as Material[]) || [];
        }

        // Monta os produtos com relacionamentos
        const categoriesMap = new Map(((categories as Category[]) || []).map((c) => [c.id, c]));
        const dimensionsMap = new Map(dimensions.map((d) => [d.id, d]));
        const materialsMap = new Map(materials.map((m) => [m.id, m]));

        return typedProducts.map((product) => {
            const productDimensionIds = ((productDimensions as { product_id: string; dimension_id: string }[]) || [])
                .filter((pd) => pd.product_id === product.id)
                .map((pd) => pd.dimension_id);

            const productMaterialIds = ((productMaterials as { product_id: string; material_id: string }[]) || [])
                .filter((pm) => pm.product_id === product.id)
                .map((pm) => pm.material_id);

            return {
                ...product,
                category: categoriesMap.get(product.category_id),
                dimensions: productDimensionIds
                    .map((id) => dimensionsMap.get(id))
                    .filter(Boolean) as Dimension[],
                materials: productMaterialIds
                    .map((id) => materialsMap.get(id))
                    .filter(Boolean) as Material[],
            };
        });
    },

    /**
     * Busca um produto por ID com relacionamentos
     */
    async getById(id: string): Promise<ProductWithRelations | null> {
        const { data: product, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            console.error("Erro ao buscar produto:", error);
            throw error;
        }

        const typedProduct = product as Product;

        // Busca categoria
        const { data: category } = await supabase
            .from("categories")
            .select("*")
            .eq("id", typedProduct.category_id)
            .single();

        // Busca dimensões
        const { data: productDimensions } = await supabase
            .from("product_dimensions")
            .select("dimension_id")
            .eq("product_id", id);

        const dimensionIds = ((productDimensions as { dimension_id: string }[]) || []).map((pd) => pd.dimension_id);
        let dimensions: Dimension[] = [];
        if (dimensionIds.length > 0) {
            const { data } = await supabase.from("dimensions").select("*").in("id", dimensionIds);
            dimensions = (data as Dimension[]) || [];
        }

        // Busca materiais
        const { data: productMaterials } = await supabase
            .from("product_materials")
            .select("material_id")
            .eq("product_id", id);

        const materialIds = ((productMaterials as { material_id: string }[]) || []).map((pm) => pm.material_id);
        let materials: Material[] = [];
        if (materialIds.length > 0) {
            const { data } = await supabase.from("materials").select("*").in("id", materialIds);
            materials = (data as Material[]) || [];
        }

        return {
            ...typedProduct,
            category: (category as Category) || undefined,
            dimensions,
            materials,
        };
    },

    /**
     * Cria um novo produto com relacionamentos
     */
    async create(dto: CreateProductDTO): Promise<ProductWithRelations> {
        const productData: ProductInsert = {
            name: dto.name,
            slug: generateSlug(dto.name),
            description: dto.description || null,
            price: dto.price,
            discount_price: dto.discountPrice || null,
            category_id: dto.categoryId,
            image_url: dto.imageUrl || null,
            weight_kg: dto.weightKg || null,
            warranty_months: dto.warrantyMonths || 12,
            assembly_required: dto.assemblyRequired ?? true,
        };

        // Cria o produto
        const { data: product, error } = await supabase
            .from("products")
            .insert(productData as never)
            .select()
            .single();

        if (error) {
            console.error("Erro ao criar produto:", error);
            throw error;
        }

        const typedProduct = product as Product;

        // Adiciona dimensões
        if (dto.dimensionIds.length > 0) {
            const dimensionRelations = dto.dimensionIds.map((dimensionId) => ({
                product_id: typedProduct.id,
                dimension_id: dimensionId,
            }));

            const { error: dimensionsError } = await supabase
                .from("product_dimensions")
                .insert(dimensionRelations as never[]);

            if (dimensionsError) {
                console.error("Erro ao adicionar dimensões:", dimensionsError);
            }
        }

        // Adiciona materiais
        if (dto.materialIds.length > 0) {
            const materialRelations = dto.materialIds.map((materialId) => ({
                product_id: typedProduct.id,
                material_id: materialId,
            }));

            const { error: materialsError } = await supabase
                .from("product_materials")
                .insert(materialRelations as never[]);

            if (materialsError) {
                console.error("Erro ao adicionar materiais:", materialsError);
            }
        }

        // Retorna o produto com relacionamentos
        return (await this.getById(typedProduct.id)) as ProductWithRelations;
    },

    /**
     * Atualiza um produto existente
     */
    async update(id: string, dto: UpdateProductDTO): Promise<ProductWithRelations> {
        const updateData: ProductUpdate = {};

        if (dto.name !== undefined) {
            updateData.name = dto.name;
            updateData.slug = generateSlug(dto.name);
        }
        if (dto.categoryId !== undefined) updateData.category_id = dto.categoryId;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.price !== undefined) updateData.price = dto.price;
        if (dto.discountPrice !== undefined) updateData.discount_price = dto.discountPrice;
        if (dto.imageUrl !== undefined) updateData.image_url = dto.imageUrl;
        if (dto.weightKg !== undefined) updateData.weight_kg = dto.weightKg;
        if (dto.warrantyMonths !== undefined) updateData.warranty_months = dto.warrantyMonths;
        if (dto.assemblyRequired !== undefined) updateData.assembly_required = dto.assemblyRequired;

        // Atualiza dados do produto
        if (Object.keys(updateData).length > 0) {
            const { error } = await supabase
                .from("products")
                .update(updateData as never)
                .eq("id", id);

            if (error) {
                console.error("Erro ao atualizar produto:", error);
                throw error;
            }
        }

        // Atualiza dimensões se fornecidas
        if (dto.dimensionIds !== undefined) {
            // Remove relações atuais
            await supabase.from("product_dimensions").delete().eq("product_id", id);

            // Adiciona novas relações
            if (dto.dimensionIds.length > 0) {
                const dimensionRelations = dto.dimensionIds.map((dimensionId) => ({
                    product_id: id,
                    dimension_id: dimensionId,
                }));

                await supabase.from("product_dimensions").insert(dimensionRelations as never[]);
            }
        }

        // Atualiza materiais se fornecidos
        if (dto.materialIds !== undefined) {
            // Remove relações atuais
            await supabase.from("product_materials").delete().eq("product_id", id);

            // Adiciona novas relações
            if (dto.materialIds.length > 0) {
                const materialRelations = dto.materialIds.map((materialId) => ({
                    product_id: id,
                    material_id: materialId,
                }));

                await supabase.from("product_materials").insert(materialRelations as never[]);
            }
        }

        return (await this.getById(id)) as ProductWithRelations;
    },

    /**
     * Remove um produto (soft delete)
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("products")
            .update({ is_active: false } as never)
            .eq("id", id);

        if (error) {
            console.error("Erro ao deletar produto:", error);
            throw error;
        }
    },
};
