import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY não configurada. A importação inteligente não funcionará.");
} else {
    // Debug log para verificar se a chave está chegando corretamente (mascarada)
    console.log(`[Gemini Service] API Key carregada. Length: ${apiKey.length}. Starts with: ${apiKey.substring(0, 4)}...`);
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
        model: "gemini-flash-latest",
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

/**
 * Gera um slug SEO a partir da imagem e descrição
 */
export async function generateSeoSlug(
    description: string,
    imageUrl?: string
): Promise<string> {
    if (!genAI) {
        throw new Error("Gemini API não configurada");
    }

    const model: GenerativeModel = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
    });

    const prompt = `Analise a descrição e a imagem (se houver) deste produto.
Gere APENAS uma string contendo palavras-chave relevantes separadas por hífens (slug) para SEO.
Inclua: tipo de produto, marca (se identificável), cor principal, característica marcante.
Exemplo de saída: "liquidificador-philips-valita-vermelho-potente"
Descrição: ${description}
NÃO retorne JSON, Markdown ou explicações. Apenas a string crua.`;

    const parts: any[] = [prompt];

    if (imageUrl) {
        try {
            const imagePart = await urlToGenerativePart(imageUrl);
            parts.push(imagePart);
        } catch (error) {
            console.warn("Não foi possível processar a imagem (CORS ou erro de rede). Seguindo apenas com texto.", error);
        }
    }

    try {
        const result = await model.generateContent(parts);
        const response = result.response;
        const text = response.text();
        return text.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    } catch (error) {
        console.error("Erro ao gerar SEO slug:", error);
        return "";
    }
}

export interface ExtractedProductDetails {
    name?: string;
    category?: string;
    sector?: string;
    price?: number;
    colors?: string;
    models?: string;
    dimensions?: string;
    seoSlug?: string;
}

/**
 * Extrai detalhes do produto a partir da descrição e imagem
 */
export async function extractProductDetails(
    description: string,
    imageUrl?: string
): Promise<ExtractedProductDetails> {
    if (!genAI) return {};

    const model: GenerativeModel = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const prompt = `Analise a descrição e a imagem (se houver) deste produto de móveis.
Extraia as seguintes informações e retorne um JSON:
- name: Nome sugerido do produto
- category: Categoria (ex: Sofás, Mesas, Cadeiras)
- sector: Setor de uso (ex: Sala de Estar, Cozinha)
- price: Preço encontrado (número, sem R$)
- colors: Cores mencionadas (string separada por vírgulas)
- models: Modelos mencionados (ex: Retrátil, Fixo)
- dimensions: Dimensões/Medidas (ex: 2.10m, 2.30m)
- seoSlug: Slug para SEO (palavras-chave separadas por hífen)

Descrição: ${description}

Retorne apenas o JSON. Se não encontrar uma informação, não inclua o campo no JSON.`;

    const parts: any[] = [prompt];

    if (imageUrl) {
        try {
            const imagePart = await urlToGenerativePart(imageUrl);
            parts.push(imagePart);
        } catch (error) {
            console.warn("Erro ao processar imagem para extração:", error);
        }
    }

    try {
        const result = await model.generateContent(parts);
        const response = result.response;
        return JSON.parse(response.text()) as ExtractedProductDetails;
    } catch (error) {
        console.error("Erro ao extrair detalhes com IA:", error);
        return {};
    }
}

async function urlToGenerativePart(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const blob = await response.blob();
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
    });

    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: blob.type || "image/jpeg",
        },
    };
}
