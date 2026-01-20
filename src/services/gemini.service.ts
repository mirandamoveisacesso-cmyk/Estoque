import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY não configurada. A importação inteligente não funcionará.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Interface para o resultado do processamento
export interface ProcessedProduct {
    name: string;
    description: string | null;
    price: number;
    category: string;
    sizes: string[];
    colors: Array<{ name: string; hex: string }>;
}

export interface ImportResult {
    products: ProcessedProduct[];
    newCategories: string[];
    newColors: Array<{ name: string; hex: string }>;
    errors: string[];
}

// Interface para mapeamento de colunas
export interface ColumnMapping {
    name?: string;
    description?: string;
    price?: string;
    category?: string;
    sizes?: string;
    colors?: string;
}

/**
 * Processa dados brutos da planilha usando Gemini AI
 */
export async function processSpreadsheetWithAI(
    rawData: Record<string, unknown>[],
    existingCategories: string[],
    existingColors: Array<{ name: string; hex: string }>,
    columnMapping?: ColumnMapping
): Promise<ImportResult> {
    if (!genAI) {
        throw new Error("Gemini API não configurada. Adicione VITE_GEMINI_API_KEY no .env");
    }

    const model: GenerativeModel = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1, // Baixa temperatura para respostas mais consistentes
        }
    });

    // Prepara o contexto com mapeamento de colunas se fornecido
    let mappingContext = "";
    if (columnMapping) {
        mappingContext = `
O usuário mapeou as seguintes colunas manualmente:
- Nome do produto: coluna "${columnMapping.name || 'detectar automaticamente'}"
- Descrição: coluna "${columnMapping.description || 'detectar automaticamente'}"
- Preço: coluna "${columnMapping.price || 'detectar automaticamente'}"
- Categoria: coluna "${columnMapping.category || 'detectar automaticamente'}"
- Tamanhos: coluna "${columnMapping.sizes || 'detectar automaticamente'}"
- Cores: coluna "${columnMapping.colors || 'detectar automaticamente'}"

Use essas informações para extrair os dados corretamente.
`;
    }

    const prompt = `Você é um assistente de importação de produtos para um catálogo de moda feminina.
Analise os dados da planilha e retorne um JSON válido seguindo exatamente este schema:

{
  "products": [
    {
      "name": "string (nome do produto)",
      "description": "string ou null",
      "price": number (valor numérico, sem R$),
      "category": "string (nome da categoria)",
      "sizes": ["PP", "P", "M", "G", "GG", "XG"] (apenas códigos válidos encontrados),
      "colors": [{ "name": "string", "hex": "#RRGGBB" }]
    }
  ],
  "newCategories": ["string"],
  "newColors": [{ "name": "string", "hex": "#RRGGBB" }],
  "errors": ["string"] 
}

Regras importantes:
1. Tamanhos válidos: PP, P, M, G, GG, XG (normalize variações como "Pequeno" → "P")
2. Se uma cor não tiver hex, tente inferir (ex: "Rosa" → "#ea9fc2", "Preto" → "#1a1a1a")
3. Preços devem ser números (remova "R$", vírgulas, etc)
4. Se o produto não tiver preço válido, use 0
5. Categorias e cores novas (não existentes) devem ir em newCategories/newColors
6. Erros de parsing devem ser reportados em "errors" com a linha afetada

${mappingContext}

Categorias existentes no sistema: ${JSON.stringify(existingCategories)}
Cores existentes no sistema: ${JSON.stringify(existingColors.map(c => c.name))}

Dados da planilha (JSON):
${JSON.stringify(rawData.slice(0, 50), null, 2)}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse do JSON retornado
        const parsed = JSON.parse(text) as ImportResult;

        return {
            products: parsed.products || [],
            newCategories: parsed.newCategories || [],
            newColors: parsed.newColors || [],
            errors: parsed.errors || [],
        };
    } catch (error) {
        console.error("Erro ao processar com Gemini:", error);
        throw new Error("Falha ao processar dados com IA. Verifique o formato do arquivo.");
    }
}

/**
 * Verifica se a API do Gemini está configurada
 */
export function isGeminiConfigured(): boolean {
    return !!genAI;
}
