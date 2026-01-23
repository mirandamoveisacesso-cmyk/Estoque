import * as React from "react";
import { HiXMark, HiVideoCamera, HiArrowPath } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { storageService } from "@/services/storage.service";

interface VideoUploadProps {
    value: string | null;
    onChange: (url: string | null) => void;
    className?: string;
}

export function VideoUpload({
    value,
    onChange,
    className
}: VideoUploadProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    const handleFilesChange = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validar tipo
        if (!file.type.startsWith("video/")) {
            setUploadError("Por favor, selecione apenas arquivos de vídeo.");
            return;
        }

        // Validar tamanho (100MB conforme definido no service, mas podemos checar aqui tb pra dar feedback rápido)
        if (file.size > 100 * 1024 * 1024) {
            setUploadError("O vídeo deve ter no máximo 100MB.");
            return;
        }

        // Upload para Supabase Storage
        try {
            setIsUploading(true);
            setUploadError(null);

            // Se já existir um vídeo, remover o anterior?
            // Melhor não remover automaticamente para não perder dados se o upload falhar,
            // mas podemos remover o anterior se o upload for bem sucedido.
            // Estando num form, talvez o usuario queira cancelar.
            // Vamos apenas fazer o upload do novo. O antigo ficará "orfão" a menos que limpemos explicitamente.
            // No handleRemove nós limpamos.

            const result = await storageService.uploadVideo(file);

            // Se tinha um valor anterior e é diferente (tecnicamente sempre será diferente URL),
            // poderiamos tentar deletar o anterior. Mas vou deixar simples por enquanto.

            onChange(result.url);
        } catch (error) {
            console.error("Erro no upload de vídeo:", error);
            setUploadError(
                error instanceof Error
                    ? error.message
                    : "Erro ao fazer upload do vídeo"
            );
        } finally {
            setIsUploading(false);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFilesChange(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleRemove = async () => {
        if (!value) return;

        const urlToRemove = value;

        // Tentar remover do storage se for URL do Supabase
        const path = storageService.extractPathFromUrl(urlToRemove);
        if (path) {
            try {
                await storageService.deleteFile(path);
            } catch (error) {
                console.warn("Erro ao remover vídeo do storage:", error);
            }
        }

        onChange(null);
    };

    return (
        <div className={cn("space-y-4", className)}>
            <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFilesChange(e.target.files)}
                disabled={isUploading}
            />

            {/* Preview do Vídeo */}
            {value ? (
                <div className="relative group rounded-lg overflow-hidden border border-white/20 bg-white/5 aspect-video w-full max-w-md">
                    <video
                        src={value}
                        controls
                        className="w-full h-full object-contain"
                    />

                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1.5 rounded bg-destructive/80 hover:bg-destructive text-white shadow-sm transition-colors"
                        title="Remover vídeo"
                    >
                        <HiXMark className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                /* Área de upload */
                !isUploading && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={cn(
                            "w-full max-w-md h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer",
                            isDragging
                                ? "border-miranda-accent bg-miranda-accent/10"
                                : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                        )}
                    >
                        <div
                            className={cn(
                                "p-3 rounded-full transition-colors",
                                isDragging
                                    ? "bg-miranda-accent/20 text-miranda-accent"
                                    : "bg-miranda-primary/20 text-miranda-primary"
                            )}
                        >
                            <HiVideoCamera className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-white">
                                {isDragging ? "Solte o vídeo aqui" : "Adicionar Vídeo"}
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                                MP4, WebM até 100MB
                            </p>
                        </div>
                    </button>
                )
            )}

            {/* Estado de Upload em progresso */}
            {isUploading && (
                <div className="w-full max-w-md flex items-center justify-center gap-3 py-8 rounded-xl bg-miranda-accent/10 border border-miranda-accent/30">
                    <HiArrowPath className="h-5 w-5 animate-spin text-miranda-accent" />
                    <span className="text-sm text-white">Enviando vídeo...</span>
                </div>
            )}

            {/* Mensagem de erro */}
            {uploadError && (
                <p className="text-sm text-destructive mt-2">
                    {uploadError}
                </p>
            )}
        </div>
    );
}
