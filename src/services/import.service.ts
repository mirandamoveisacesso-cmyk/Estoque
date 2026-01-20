import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import {
    processSpreadsheetWithAI,
    type ImportResult,
    type ColumnMapping,
} from "./gemini.service";
import { categoriesService } from "./categories.service";
import { materialsService } from "./materials.service";
import type { Category, Material, Dimension } from "@/types/database";

// Interface para resultado da importação
export interface ImportProgress {
    total: number;
    current: number;
    status: "idle" | "parsing" | "processing" | "creating" | "done" | "error";
    message: string;
    errors: string[];
}

export interface ImportSummary {
    productsCreated: number;
    categoriesCreated: number;
    materialsCreated: number;
    errors: string[];
}

// Função para gerar slug
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

/**
 * Faz o parse de um arquivo Excel/CSV para JSON
 */
export function parseFile(file: File): Promise<Record<string, unknown>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "array" });

                // Pega a primeira sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Converte para JSON
                const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

                resolve(jsonData);
            } catch (error) {
                reject(new Error("Erro ao ler arquivo. Verifique se é um Excel ou CSV válido."));
            }
        };

        reader.onerror = () => {
            reject(new Error("Erro ao ler o arquivo."));
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * Extrai os headers/colunas do arquivo
 */
export function extractColumns(data: Record<string, unknown>[]): string[] {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
}

/**
 * Busca dados existentes do sistema para contexto da IA
 */
async function getExistingData(): Promise<{
    categories: Category[];
    materials: Material[];
    dimensions: Dimension[];
}> {
    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true);

    const { data: materials } = await supabase
        .from("materials")
        .select("*");

    const { data: dimensions } = await supabase
        .from("dimensions")
        .select("*")
        .eq("is_active", true);

    return {
        categories: (categories as Category[]) || [],
        materials: (materials as Material[]) || [],
        dimensions: (dimensions as Dimension[]) || [],
    };
}

/**
 * Executa a importação completa
 */
export async function executeImport(
    rawData: Record<string, unknown>[],
    columnMapping?: ColumnMapping,
    onProgress?: (progress: ImportProgress) => void
): Promise<ImportSummary> {
    const errors: string[] = [];
    let productsCreated = 0;
    let categoriesCreated = 0;
    let materialsCreated = 0;

    const updateProgress = (progress: Partial<ImportProgress>) => {
        onProgress?.({
            total: rawData.length,
            current: 0,
            status: "idle",
            message: "",
            errors: [],
            ...progress,
        });
    };

    try {
        // 1. Buscar dados existentes
        updateProgress({ status: "parsing", message: "Buscando dados do sistema..." });
        const { categories, materials, dimensions } = await getExistingData();

        // 2. Processar com IA
        updateProgress({ status: "processing", message: "Processando com IA..." });
        const result: ImportResult = await processSpreadsheetWithAI(
            rawData,
            categories.map(c => c.name),
            materials.map(m => ({ name: m.name, hex: m.hex_code || "#888888" })),
            columnMapping
        );

        if (result.errors.length > 0) {
            errors.push(...result.errors);
        }

        // 3. Criar novas categorias
        updateProgress({ status: "creating", message: "Criando categorias novas..." });
        const categoryMap = new Map<string, string>(
            categories.map(c => [c.name.toLowerCase(), c.id])
        );

        for (const categoryName of result.newCategories) {
            try {
                const newCat = await categoriesService.create(categoryName);
                categoryMap.set(categoryName.toLowerCase(), newCat.id);
                categoriesCreated++;
            } catch (err) {
                errors.push(`Erro ao criar categoria "${categoryName}": ${err}`);
            }
        }

        // 4. Criar novos materiais
        updateProgress({ status: "creating", message: "Criando materiais novos..." });
        const materialMap = new Map<string, string>(
            materials.map(m => [m.name.toLowerCase(), m.id])
        );

        for (const materialData of result.newColors) {
            try {
                const newMaterial = await materialsService.create({
                    name: materialData.name,
                    type: "other",
                    hexCode: materialData.hex,
                    isCustom: true,
                    displayOrder: 100,
                });
                materialMap.set(materialData.name.toLowerCase(), newMaterial.id);
                materialsCreated++;
            } catch (err) {
                errors.push(`Erro ao criar material "${materialData.name}": ${err}`);
            }
        }

        // 5. Criar mapa de dimensões
        const dimensionMap = new Map<string, string>(
            dimensions.map(d => [d.name.toLowerCase(), d.id])
        );

        // 6. Criar produtos
        updateProgress({ status: "creating", message: "Criando produtos...", total: result.products.length });

        for (let i = 0; i < result.products.length; i++) {
            const product = result.products[i];

            updateProgress({
                status: "creating",
                message: `Criando produto ${i + 1} de ${result.products.length}...`,
                current: i + 1,
                total: result.products.length,
            });

            try {
                const categoryId = categoryMap.get(product.category.toLowerCase());
                if (!categoryId) {
                    errors.push(`Produto "${product.name}": categoria "${product.category}" não encontrada`);
                    continue;
                }

                // Insere produto
                const { data: newProduct, error: productError } = await supabase
                    .from("products")
                    .insert({
                        name: product.name,
                        slug: generateSlug(product.name),
                        description: product.description,
                        price: product.price || 0,
                        category_id: categoryId,
                    } as never)
                    .select()
                    .single();

                if (productError) {
                    errors.push(`Erro ao criar produto "${product.name}": ${productError.message}`);
                    continue;
                }

                const productId = (newProduct as { id: string }).id;

                // Associa dimensões (usa primeira disponível por padrão)
                const dimensionIds = product.sizes
                    .map(s => dimensionMap.get(s.toLowerCase()))
                    .filter(Boolean) as string[];

                if (dimensionIds.length > 0) {
                    await supabase
                        .from("product_dimensions")
                        .insert(dimensionIds.map(dimensionId => ({
                            product_id: productId,
                            dimension_id: dimensionId,
                        })) as never[]);
                }

                // Associa materiais
                const materialIds = product.colors
                    .map(c => materialMap.get(c.name.toLowerCase()))
                    .filter(Boolean) as string[];

                if (materialIds.length > 0) {
                    await supabase
                        .from("product_materials")
                        .insert(materialIds.map(materialId => ({
                            product_id: productId,
                            material_id: materialId,
                        })) as never[]);
                }

                productsCreated++;
            } catch (err) {
                errors.push(`Erro ao criar produto "${product.name}": ${err}`);
            }
        }

        updateProgress({ status: "done", message: "Importação concluída!", errors });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        errors.push(errorMessage);
        updateProgress({ status: "error", message: errorMessage, errors });
    }

    return {
        productsCreated,
        categoriesCreated,
        materialsCreated,
        errors,
    };
}
