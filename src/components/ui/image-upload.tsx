import * as React from "react";
import { HiXMark, HiPhoto, HiArrowPath, HiPlus } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { storageService } from "@/services/storage.service";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 10,
  className
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const handleFilesChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Validar quantidade
    if (value.length + fileArray.length > maxImages) {
      setUploadError(`Máximo de ${maxImages} imagens permitidas.`);
      return;
    }

    // Validar tipos e tamanhos
    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Por favor, selecione apenas arquivos de imagem.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Cada imagem deve ter no máximo 5MB.");
        return;
      }
    }

    // Upload para Supabase Storage
    try {
      setIsUploading(true);
      setUploadError(null);

      const uploadPromises = fileArray.map(file => storageService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.url);

      onChange([...value, ...newUrls]);
    } catch (error) {
      console.error("Erro no upload:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Erro ao fazer upload das imagens"
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

  const handleRemove = async (index: number) => {
    const urlToRemove = value[index];

    // Tentar remover do storage se for URL do Supabase
    const path = storageService.extractPathFromUrl(urlToRemove);
    if (path) {
      try {
        await storageService.deleteImage(path);
      } catch (error) {
        console.warn("Erro ao remover imagem do storage:", error);
      }
    }

    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newUrls = [...value];
    const [movedItem] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, movedItem);
    onChange(newUrls);
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFilesChange(e.target.files)}
        disabled={isUploading}
      />

      {/* Grid de imagens */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square rounded-lg overflow-hidden border border-white/20 bg-white/5"
            >
              <img
                src={url}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="p-1.5 rounded bg-white/20 hover:bg-white/30 text-white text-xs"
                    title="Mover para esquerda"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 rounded bg-destructive/80 hover:bg-destructive text-white"
                  title="Remover"
                >
                  <HiXMark className="h-4 w-4" />
                </button>
                {index < value.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="p-1.5 rounded bg-white/20 hover:bg-white/30 text-white text-xs"
                    title="Mover para direita"
                  >
                    →
                  </button>
                )}
              </div>

              {/* Badge de imagem principal */}
              {index === 0 && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-miranda-primary text-white text-[10px] font-medium rounded">
                  Principal
                </div>
              )}
            </div>
          ))}

          {/* Botão de adicionar mais */}
          {canAddMore && !isUploading && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <HiPlus className="h-6 w-6 text-white/60" />
              <span className="text-[10px] text-white/50">Adicionar</span>
            </button>
          )}
        </div>
      )}

      {/* Estado de Upload em progresso */}
      {isUploading && (
        <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-miranda-accent/10 border border-miranda-accent/30">
          <HiArrowPath className="h-5 w-5 animate-spin text-miranda-accent" />
          <span className="text-sm text-white">Fazendo upload...</span>
        </div>
      )}

      {/* Área de upload inicial (quando não há imagens) */}
      {value.length === 0 && !isUploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer",
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
            <HiPhoto className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              {isDragging ? "Solte as imagens aqui" : "Clique ou arraste imagens"}
            </p>
            <p className="text-xs text-white/50 mt-1">
              PNG, JPG ou WebP até 5MB (máx. {maxImages} imagens)
            </p>
          </div>
        </button>
      )}

      {/* Mensagem de erro */}
      {uploadError && (
        <p className="text-sm text-destructive text-center">
          {uploadError}
        </p>
      )}

      {/* Info */}
      {value.length > 0 && (
        <p className="text-xs text-white/50 text-center">
          {value.length} de {maxImages} imagens • A primeira é a imagem principal
        </p>
      )}
    </div>
  );
}
