/**
 * Serviço de upload de imagens para o Supabase Storage
 * Bucket: products (deve ser criado no Supabase Dashboard)
 */

import { supabase } from "@/lib/supabase";

// ============================================================================
// TIPOS
// ============================================================================

export interface UploadResponse {
    url: string;
    path: string;
    size: number;
    type: string;
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const BUCKET_NAME = "products";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Gera um nome único para o arquivo
 */
function generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split(".").pop()?.toLowerCase() || "webp";
    return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Converte uma imagem para WebP usando Canvas API
 */
async function convertToWebP(
    file: File,
    quality: number = 0.85,
    maxWidth: number = 1920,
    maxHeight: number = 1920
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
            let width = img.width;
            let height = img.height;

            // Resize se necessário
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Falha ao converter imagem para WebP"));
                        return;
                    }

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

        img.src = URL.createObjectURL(file);
    });
}

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Faz upload de uma imagem para o Supabase Storage
 * A imagem é automaticamente convertida para WebP antes do upload
 */
async function uploadImage(
    file: File,
    options: { quality?: number; maxWidth?: number; maxHeight?: number } = {}
): Promise<UploadResponse> {
    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`A imagem deve ter no máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Converter para WebP
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

    // Gerar nome único
    const fileName = generateFileName(optimizedFile.name);
    const filePath = `uploads/${fileName}`;

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, optimizedFile, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        throw new Error(`Erro no upload: ${error.message}`);
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return {
        url: urlData.publicUrl,
        path: data.path,
        size: optimizedFile.size,
        type: optimizedFile.type,
    };
}

/**
 * Faz upload de um vídeo para o Supabase Storage
 */
async function uploadVideo(file: File): Promise<UploadResponse> {
    // Validar tamanho
    if (file.size > MAX_VIDEO_SIZE) {
        throw new Error(`O vídeo deve ter no máximo ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
    }

    // Validar tipo (opcional, mas recomendado)
    if (!file.type.startsWith("video/")) {
        throw new Error("O arquivo deve ser um vídeo");
    }

    // Gerar nome único
    const fileName = generateFileName(file.name);
    const filePath = `uploads/videos/${fileName}`;

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        throw new Error(`Erro no upload: ${error.message}`);
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return {
        url: urlData.publicUrl,
        path: data.path,
        size: file.size,
        type: file.type,
    };
}

/**
 * Remove um arquivo (imagem ou vídeo) do Supabase Storage
 */
async function deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

    if (error) {
        throw new Error(`Erro ao remover arquivo: ${error.message}`);
    }
}

/**
 * Extrai o path de uma URL do Supabase Storage
 */
function extractPathFromUrl(url: string): string | null {
    if (!url.includes("supabase")) return null;

    // Formato: https://xxx.supabase.co/storage/v1/object/public/products/uploads/filename.webp
    // ou uploads/videos/filename.mp4
    const regex = /\/storage\/v1\/object\/public\/products\/(.+)$/;
    const match = url.match(regex);

    return match ? match[1] : null;
}

/**
 * Gera uma URL de thumbnail (usando transformações do Supabase)
 */
function getThumbnailUrl(url: string, width: number = 200, height: number = 200): string {
    // Supabase Storage suporta transformações via query params
    // Formato: ?width=200&height=200
    const urlObj = new URL(url);
    urlObj.searchParams.set("width", width.toString());
    urlObj.searchParams.set("height", height.toString());
    return urlObj.toString();
}

// ============================================================================
// EXPORT
// ============================================================================

export const storageService = {
    uploadImage,
    uploadVideo,
    deleteImage: deleteFile, // Alias para manter compatibilidade
    deleteFile,
    extractPathFromUrl,
    getThumbnailUrl,
};
