import * as React from "react";
import { HiArrowUpTray, HiXMark, HiPhoto, HiArrowPath } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { cloudinaryService } from "@/services/cloudinary.service";

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

    // Upload para Cloudinary
    try {
      setIsUploading(true);
      setUploadError(null);
      const result = await cloudinaryService.uploadImage(file);
      onChange(result.secure_url);
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

  const handleRemove = () => {
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
        <div className="w-full h-48 rounded-xl border-2 border-dashed border-lovely-accent bg-lovely-accent/10 flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-lovely-accent/20 text-lovely-accent">
            <HiArrowPath className="h-6 w-6 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-lovely-white">
              Fazendo upload...
            </p>
            <p className="text-xs text-lovely-white/50 mt-1">
              Aguarde um momento
            </p>
          </div>
        </div>
      ) : value ? (
        // Preview da imagem
        <div className="relative group rounded-xl overflow-hidden border border-lovely-secondary/30">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-lovely-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 rounded-lg bg-lovely-secondary/20 hover:bg-lovely-secondary/30 text-lovely-white transition-colors"
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
              ? "border-lovely-accent bg-lovely-accent/10"
              : "border-lovely-secondary/30 bg-lovely-secondary/5 hover:border-lovely-secondary/50 hover:bg-lovely-secondary/10"
          )}
        >
          <div
            className={cn(
              "p-3 rounded-full transition-colors",
              isDragging
                ? "bg-lovely-accent/20 text-lovely-accent"
                : "bg-lovely-secondary/10 text-lovely-secondary"
            )}
          >
            <HiPhoto className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-lovely-white">
              {isDragging ? "Solte a imagem aqui" : "Clique ou arraste uma imagem"}
            </p>
            <p className="text-xs text-lovely-white/50 mt-1">
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
