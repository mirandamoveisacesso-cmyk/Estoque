import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import {
    processSpreadsheetWithAI,
    type ImportResult,
    type ColumnMapping,
} from "./gemini.service";
import { categoriesService } from "./categories.service";
import { colorsService } from "./colors.service";
import type { Category, Color, Size } from "@/types/database";

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
    colorsCreated: number;
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
    colors: Color[];
    sizes: Size[];
}> {
    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true);

    const { data: colors } = await supabase
        .from("colors")
        .select("*");

    const { data: sizes } = await supabase
        .from("sizes")
        .select("*")
        .eq("is_active", true);

    return {
        categories: (categories as Category[]) || [],
        colors: (colors as Color[]) || [],
        sizes: (sizes as Size[]) || [],
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
    let colorsCreated = 0;

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
        const { categories, colors, sizes } = await getExistingData();

        // 2. Processar com IA
        updateProgress({ status: "processing", message: "Processando com IA..." });
        const result: ImportResult = await processSpreadsheetWithAI(
            rawData,
            categories.map(c => c.name),
            colors.map(c => ({ name: c.name, hex: c.hex_code })),
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

        // 4. Criar novas cores
        updateProgress({ status: "creating", message: "Criando cores novas..." });
        const colorMap = new Map<string, string>(
            colors.map(c => [c.name.toLowerCase(), c.id])
        );

        for (const colorData of result.newColors) {
            try {
                const newColor = await colorsService.create(colorData.name, colorData.hex);
                colorMap.set(colorData.name.toLowerCase(), newColor.id);
                colorsCreated++;
            } catch (err) {
                errors.push(`Erro ao criar cor "${colorData.name}": ${err}`);
            }
        }

        // 5. Criar mapa de tamanhos
        const sizeMap = new Map<string, string>(
            sizes.map(s => [s.code.toLowerCase(), s.id])
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

                // Associa tamanhos
                const sizeIds = product.sizes
                    .map(s => sizeMap.get(s.toLowerCase()))
                    .filter(Boolean) as string[];

                if (sizeIds.length > 0) {
                    await supabase
                        .from("product_sizes")
                        .insert(sizeIds.map(sizeId => ({
                            product_id: productId,
                            size_id: sizeId,
                        })) as never[]);
                }

                // Associa cores
                const colorIds = product.colors
                    .map(c => colorMap.get(c.name.toLowerCase()))
                    .filter(Boolean) as string[];

                if (colorIds.length > 0) {
                    await supabase
                        .from("product_colors")
                        .insert(colorIds.map(colorId => ({
                            product_id: productId,
                            color_id: colorId,
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
        colorsCreated,
        errors,
    };
}
