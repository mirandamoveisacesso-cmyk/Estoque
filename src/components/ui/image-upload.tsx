import * as React from "react";
import { HiArrowUpTray, HiXMark, HiPhoto, HiArrowPath } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { storageService } from "@/services/storage.service";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("A imagem deve ter no máximo 5MB.");
      return;
    }

    // Upload para Supabase Storage
    try {
      setIsUploading(true);
      setUploadError(null);
      const result = await storageService.uploadImage(file);
      onChange(result.url);
    } catch (error) {
      console.error("Erro no upload:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Erro ao fazer upload da imagem"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = async () => {
    // Tentar remover do storage se for uma URL do Supabase
    if (value) {
      const path = storageService.extractPathFromUrl(value);
      if (path) {
        try {
          await storageService.deleteImage(path);
        } catch (error) {
          console.warn("Erro ao remover imagem do storage:", error);
        }
      }
    }

    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        disabled={isUploading}
      />

      {/* Estado de Upload em progresso */}
      {isUploading ? (
        <div className="w-full h-48 rounded-xl border-2 border-dashed border-miranda-accent bg-miranda-accent/10 flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-miranda-accent/20 text-miranda-accent">
            <HiArrowPath className="h-6 w-6 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              Fazendo upload...
            </p>
            <p className="text-xs text-white/50 mt-1">
              Aguarde um momento
            </p>
          </div>
        </div>
      ) : value ? (
        // Preview da imagem
        <div className="relative group rounded-xl overflow-hidden border border-white/20">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Trocar imagem"
            >
              <HiArrowUpTray className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 text-destructive transition-colors"
              aria-label="Remover imagem"
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        // Área de upload
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer",
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
              {isDragging ? "Solte a imagem aqui" : "Clique ou arraste uma imagem"}
            </p>
            <p className="text-xs text-white/50 mt-1">
              PNG, JPG ou WebP até 5MB
            </p>
          </div>
        </button>
      )}

      {/* Mensagem de erro */}
      {uploadError && (
        <p className="mt-2 text-sm text-destructive text-center">
          {uploadError}
        </p>
      )}
    </div>
  );
}
