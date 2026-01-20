import { supabase } from "@/lib/supabase";
import type { Material, MaterialType } from "@/types/product";

// Service para gerenciar materiais de móveis

export const materialsService = {
    // Listar todos os materiais
    async getAll(): Promise<Material[]> {
        const { data, error } = await supabase
            .from("materials")
            .select("*")
            .order("display_order", { ascending: true });

        if (error) {
            console.error("Erro ao buscar materiais:", error);
            throw error;
        }

        return (data || []).map(m => ({
            id: m.id,
            name: m.name,
            type: m.type as MaterialType,
            hexCode: m.hex_code ?? undefined,
            description: m.description ?? undefined,
            isCustom: m.is_custom,
            displayOrder: m.display_order,
        }));
    },

    // Listar materiais por tipo
    async getByType(type: MaterialType): Promise<Material[]> {
        const { data, error } = await supabase
            .from("materials")
            .select("*")
            .eq("type", type)
            .order("display_order", { ascending: true });

        if (error) {
            console.error("Erro ao buscar materiais por tipo:", error);
            throw error;
        }

        return (data || []).map(m => ({
            id: m.id,
            name: m.name,
            type: m.type as MaterialType,
            hexCode: m.hex_code ?? undefined,
            description: m.description ?? undefined,
            isCustom: m.is_custom,
            displayOrder: m.display_order,
        }));
    },

    // Buscar material por ID
    async getById(id: string): Promise<Material | null> {
        const { data, error } = await supabase
            .from("materials")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Erro ao buscar material:", error);
            return null;
        }

        return data ? {
            id: data.id,
            name: data.name,
            type: data.type as MaterialType,
            hexCode: data.hex_code ?? undefined,
            description: data.description ?? undefined,
            isCustom: data.is_custom,
            displayOrder: data.display_order,
        } : null;
    },

    // Criar novo material
    async create(material: Omit<Material, "id">): Promise<Material> {
        // Buscar maior display_order para materiais customizados
        const { data: maxOrderData } = await supabase
            .from("materials")
            .select("display_order")
            .order("display_order", { ascending: false })
            .limit(1);

        const nextOrder = (maxOrderData?.[0]?.display_order ?? 0) + 1;

        const { data, error } = await supabase
            .from("materials")
            .insert({
                name: material.name,
                type: material.type,
                hex_code: material.hexCode,
                description: material.description,
                is_custom: material.isCustom ?? true,
                display_order: material.displayOrder ?? nextOrder,
            })
            .select()
            .single();

        if (error) {
            console.error("Erro ao criar material:", error);
            throw error;
        }

        return {
            id: data.id,
            name: data.name,
            type: data.type as MaterialType,
            hexCode: data.hex_code ?? undefined,
            description: data.description ?? undefined,
            isCustom: data.is_custom,
            displayOrder: data.display_order,
        };
    },

    // Atualizar material
    async update(id: string, material: Partial<Material>): Promise<Material> {
        const updateData: Record<string, unknown> = {};
        if (material.name !== undefined) updateData.name = material.name;
        if (material.type !== undefined) updateData.type = material.type;
        if (material.hexCode !== undefined) updateData.hex_code = material.hexCode;
        if (material.description !== undefined) updateData.description = material.description;
        if (material.isCustom !== undefined) updateData.is_custom = material.isCustom;
        if (material.displayOrder !== undefined) updateData.display_order = material.displayOrder;

        const { data, error } = await supabase
            .from("materials")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Erro ao atualizar material:", error);
            throw error;
        }

        return {
            id: data.id,
            name: data.name,
            type: data.type as MaterialType,
            hexCode: data.hex_code ?? undefined,
            description: data.description ?? undefined,
            isCustom: data.is_custom,
            displayOrder: data.display_order,
        };
    },

    // Deletar material
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("materials")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Erro ao deletar material:", error);
            throw error;
        }
    },
};
