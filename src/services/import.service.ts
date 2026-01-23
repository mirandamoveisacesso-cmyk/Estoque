import * as XLSX from "xlsx";
import type { ColumnMapping } from "./gemini.service";

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
                reject(new Error("Erro ao ler arquivo. Verifique se é um Excel ou CSV válido." + (error ? "" : "")));
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
 * Executa a importação completa
 */
export async function executeImport(
    rawData: Record<string, unknown>[],
    _columnMapping?: ColumnMapping,
    onProgress?: (progress: ImportProgress) => void
): Promise<ImportSummary> {
    const errors: string[] = [];
    const productsCreated = 0;
    const categoriesCreated = 0;
    const materialsCreated = 0;

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

    updateProgress({ status: "error", message: "Importação temporariamente desativada durante refatoração de arquitetura.", errors: ["Funcionalidade em manutenção"] });
    errors.push("Importação desativada temporariamente.");

    return {
        productsCreated,
        categoriesCreated,
        materialsCreated,
        errors,
    };
}
