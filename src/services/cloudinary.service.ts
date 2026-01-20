/**
 * Serviço de upload de imagens para o Cloudinary
 * Utiliza upload não assinado (unsigned) para permitir uploads diretos do frontend
 */

// ============================================================================
// TIPOS
// ============================================================================

export interface CloudinaryUploadResponse {
    asset_id: string;
    public_id: string;
    version: number;
    version_id: string;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    bytes: number;
    type: string;
    url: string;
    secure_url: string;
}

export interface CloudinaryError {
    message: string;
    name: string;
    http_code: number;
}

export interface TransformOptions {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "thumb";
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png";
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Endpoint de upload não assinado
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Converte uma imagem para WebP usando Canvas API
 * @param file - Arquivo de imagem original
 * @param quality - Qualidade da compressão (0-1), padrão: 0.85
 * @param maxWidth - Largura máxima (opcional, para resize)
 * @param maxHeight - Altura máxima (opcional, para resize)
 * @returns Promise com o arquivo convertido em WebP
 */
async function convertToWebP(
    file: File,
    quality: number = 0.85,
    maxWidth?: number,
    maxHeight?: number
): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            reject(new Error("Não foi possível criar contexto de canvas"));
            return;
        }

        img.onload = () => {
            // Calcular dimensões finais (respeitando proporção se maxWidth/maxHeight definidos)
            let width = img.width;
            let height = img.height;

            if (maxWidth && width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (maxHeight && height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            // Desenhar imagem no canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Converter para WebP
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Falha ao converter imagem para WebP"));
                        return;
                    }

                    // Criar novo File com extensão .webp
                    const webpFile = new File(
                        [blob],
                        file.name.replace(/\.[^.]+$/, ".webp"),
                        { type: "image/webp" }
                    );

                    resolve(webpFile);
                },
                "image/webp",
                quality
            );
        };

        img.onerror = () => {
            reject(new Error("Falha ao carregar imagem para conversão"));
        };

        // Carregar imagem a partir do File
        img.src = URL.createObjectURL(file);
    });
}

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Faz upload de uma imagem para o Cloudinary
 * A imagem é automaticamente convertida para WebP antes do upload
 * @param file - Arquivo de imagem a ser enviado
 * @param options - Opções de conversão (quality, maxWidth, maxHeight)
 * @returns Promise com a resposta do Cloudinary contendo a URL segura
 * @throws Error se o upload falhar
 */
async function uploadImage(
    file: File,
    options: { quality?: number; maxWidth?: number; maxHeight?: number } = {}
): Promise<CloudinaryUploadResponse> {
    // Validar configuração
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error(
            "Cloudinary não configurado. Verifique as variáveis VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET no arquivo .env"
        );
    }

    // Converter para WebP antes do upload (reduz tamanho significativamente)
    const { quality = 0.85, maxWidth = 1920, maxHeight = 1920 } = options;
    let optimizedFile: File;

    try {
        optimizedFile = await convertToWebP(file, quality, maxWidth, maxHeight);
        console.log(
            `Imagem convertida: ${file.name} (${(file.size / 1024).toFixed(1)}KB) → ${optimizedFile.name} (${(optimizedFile.size / 1024).toFixed(1)}KB)`
        );
    } catch (conversionError) {
        console.warn("Falha na conversão para WebP, usando arquivo original:", conversionError);
        optimizedFile = file;
    }

    // Preparar FormData para envio
    const formData = new FormData();
    formData.append("file", optimizedFile);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const response = await fetch(UPLOAD_URL, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = (await response.json()) as { error?: CloudinaryError };
            throw new Error(
                errorData.error?.message || `Erro no upload: ${response.status}`
            );
        }

        const data = (await response.json()) as CloudinaryUploadResponse;
        return data;
    } catch (error) {
        // Re-throw com mensagem mais amigável
        if (error instanceof Error) {
            throw new Error(`Falha no upload da imagem: ${error.message}`);
        }
        throw new Error("Falha no upload da imagem: erro desconhecido");
    }
}

/**
 * Gera uma URL otimizada com transformações do Cloudinary
 * @param publicId - ID público da imagem no Cloudinary
 * @param options - Opções de transformação (width, height, crop, quality, format)
 * @returns URL da imagem com transformações aplicadas
 */
function getOptimizedUrl(publicId: string, options: TransformOptions = {}): string {
    if (!CLOUD_NAME) {
        console.warn("CLOUD_NAME não configurado");
        return "";
    }

    const transformations: string[] = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);

    // Se não houver transformações, usar auto-format e auto-quality por padrão
    if (transformations.length === 0) {
        transformations.push("f_auto", "q_auto");
    }

    const transformString = transformations.join(",");

    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}

/**
 * Gera uma URL de thumbnail para preview
 * @param secureUrl - URL segura retornada pelo upload
 * @param size - Tamanho do thumbnail (padrão: 200)
 * @returns URL do thumbnail
 */
function getThumbnailUrl(secureUrl: string, size: number = 200): string {
    // Insere transformações na URL existente
    // Formato: https://res.cloudinary.com/{cloud}/image/upload/{transformations}/{path}
    return secureUrl.replace(
        "/image/upload/",
        `/image/upload/c_fill,w_${size},h_${size},f_auto,q_auto/`
    );
}

/**
 * Extrai o public_id de uma URL do Cloudinary
 * @param url - URL completa da imagem
 * @returns public_id ou null se não for uma URL válida do Cloudinary
 */
function extractPublicId(url: string): string | null {
    if (!url.includes("cloudinary.com")) return null;

    // Regex para extrair o public_id
    // Formato: https://res.cloudinary.com/{cloud}/image/upload/{version?}/{public_id}.{format}
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
    const match = url.match(regex);

    return match ? match[1] : null;
}

// ============================================================================
// EXPORT
// ============================================================================

export const cloudinaryService = {
    uploadImage,
    getOptimizedUrl,
    getThumbnailUrl,
    extractPublicId,
};
