import { supabase } from "@/lib/supabase";
import type { Dimension } from "@/types/product";

// Service para gerenciar dimensões de móveis

export const dimensionsService = {
    // Listar todas as dimensões
    async getAll(): Promise<Dimension[]> {
        const { data, error } = await supabase
            .from("dimensions")
            .select("*")
            .order("display_order", { ascending: true });

        if (error) {
            console.error("Erro ao buscar dimensões:", error);
            throw error;
        }

        return (data || []).map(d => ({
            id: d.id,
            name: d.name,
            widthCm: d.width_cm ?? undefined,
            heightCm: d.height_cm ?? undefined,
            depthCm: d.depth_cm ?? undefined,
            displayOrder: d.display_order,
            isActive: d.is_active,
        }));
    },

    // Buscar dimensão por ID
    async getById(id: string): Promise<Dimension | null> {
        const { data, error } = await supabase
            .from("dimensions")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Erro ao buscar dimensão:", error);
            return null;
        }

        return data ? {
            id: data.id,
            name: data.name,
            widthCm: data.width_cm ?? undefined,
            heightCm: data.height_cm ?? undefined,
            depthCm: data.depth_cm ?? undefined,
            displayOrder: data.display_order,
            isActive: data.is_active,
        } : null;
    },

    // Criar nova dimensão
    async create(dimension: Omit<Dimension, "id">): Promise<Dimension> {
        const { data, error } = await supabase
            .from("dimensions")
            .insert({
                name: dimension.name,
                width_cm: dimension.widthCm,
                height_cm: dimension.heightCm,
                depth_cm: dimension.depthCm,
                display_order: dimension.displayOrder,
                is_active: dimension.isActive,
            })
            .select()
            .single();

        if (error) {
            console.error("Erro ao criar dimensão:", error);
            throw error;
        }

        return {
            id: data.id,
            name: data.name,
            widthCm: data.width_cm ?? undefined,
            heightCm: data.height_cm ?? undefined,
            depthCm: data.depth_cm ?? undefined,
            displayOrder: data.display_order,
            isActive: data.is_active,
        };
    },

    // Atualizar dimensão
    async update(id: string, dimension: Partial<Dimension>): Promise<Dimension> {
        const updateData: Record<string, unknown> = {};
        if (dimension.name !== undefined) updateData.name = dimension.name;
        if (dimension.widthCm !== undefined) updateData.width_cm = dimension.widthCm;
        if (dimension.heightCm !== undefined) updateData.height_cm = dimension.heightCm;
        if (dimension.depthCm !== undefined) updateData.depth_cm = dimension.depthCm;
        if (dimension.displayOrder !== undefined) updateData.display_order = dimension.displayOrder;
        if (dimension.isActive !== undefined) updateData.is_active = dimension.isActive;

        const { data, error } = await supabase
            .from("dimensions")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Erro ao atualizar dimensão:", error);
            throw error;
        }

        return {
            id: data.id,
            name: data.name,
            widthCm: data.width_cm ?? undefined,
            heightCm: data.height_cm ?? undefined,
            depthCm: data.depth_cm ?? undefined,
            displayOrder: data.display_order,
            isActive: data.is_active,
        };
    },

    // Deletar dimensão
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("dimensions")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Erro ao deletar dimensão:", error);
            throw error;
        }
    },
};
