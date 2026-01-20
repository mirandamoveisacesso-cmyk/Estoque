import { supabase } from "@/lib/supabase";
import type { Category, CategoryInsert, CategoryUpdate } from "@/types/database";

// Função para gerar slug a partir do nome
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export const categoriesService = {
    /**
     * Busca todas as categorias ativas ordenadas por display_order
     */
    async getAll(): Promise<Category[]> {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (error) {
            console.error("Erro ao buscar categorias:", error);
            throw error;
        }

        return (data as Category[]) || [];
    },

    /**
     * Busca uma categoria por ID
     */
    async getById(id: string): Promise<Category | null> {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null; // Not found
            console.error("Erro ao buscar categoria:", error);
            throw error;
        }

        return data as Category;
    },

    /**
     * Cria uma nova categoria
     */
    async create(name: string, description?: string): Promise<Category> {
        const insertData: CategoryInsert = {
            name,
            slug: generateSlug(name),
            description: description || null,
            display_order: 0,
        };

        const { data, error } = await supabase
            .from("categories")
            .insert(insertData as never)
            .select()
            .single();

        if (error) {
            console.error("Erro ao criar categoria:", error);
            throw error;
        }

        return data as Category;
    },

    /**
     * Atualiza uma categoria existente
     */
    async update(id: string, name: string, description?: string): Promise<Category> {
        const updateData: CategoryUpdate = {
            name,
            slug: generateSlug(name),
            description: description || null,
        };

        const { data, error } = await supabase
            .from("categories")
            .update(updateData as never)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Erro ao atualizar categoria:", error);
            throw error;
        }

        return data as Category;
    },

    /**
     * Remove uma categoria (soft delete)
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("categories")
            .update({ is_active: false } as never)
            .eq("id", id);

        if (error) {
            console.error("Erro ao deletar categoria:", error);
            throw error;
        }
    },
};
