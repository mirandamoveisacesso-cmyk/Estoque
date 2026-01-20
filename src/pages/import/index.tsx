import { useState, useCallback } from "react";
import { HiArrowUpTray, HiDocumentText, HiSparkles, HiCheck, HiArrowPath } from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { PageId } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  parseFile, 
  extractColumns, 
  executeImport,
  type ImportProgress,
  type ImportSummary,
} from "@/services/import.service";
import type { ColumnMapping } from "@/services/gemini.service";
import { isGeminiConfigured } from "@/services/gemini.service";

interface ImportPageProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

type ImportStep = "upload" | "mapping" | "processing" | "preview" | "importing" | "done";

// Campos do produto para mapeamento
const PRODUCT_FIELDS = [
  { key: "name", label: "Nome do Produto", required: true },
  { key: "description", label: "Descrição", required: false },
  { key: "price", label: "Preço", required: true },
  { key: "category", label: "Categoria", required: true },
  { key: "sizes", label: "Tamanhos", required: false },
  { key: "colors", label: "Cores", required: false },
];

export function ImportPage({ currentPage, onNavigate }: ImportPageProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [mappingMode, setMappingMode] = useState<"auto" | "manual">("auto");
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handler para upload de arquivo
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    
    try {
      const data = await parseFile(selectedFile);
      if (data.length === 0) {
        setError("O arquivo está vazio.");
        return;
      }
      
      setRawData(data);
      setColumns(extractColumns(data));
      setStep("mapping");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao ler arquivo.");
    }
  }, []);

  // Handlers de drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  // Inicia o processamento
  const handleStartImport = useCallback(async () => {
    if (!isGeminiConfigured()) {
      setError("API do Gemini não configurada. Adicione VITE_GEMINI_API_KEY no arquivo .env");
      return;
    }

    setStep("processing");
    setError(null);

    try {
      const columnMappingToUse = mappingMode === "manual" ? mapping : undefined;
      
      setStep("importing");
      const result = await executeImport(
        rawData,
        columnMappingToUse,
        (p) => setProgress(p)
      );
      
      setSummary(result);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro durante importação.");
      setStep("mapping");
    }
  }, [rawData, mapping, mappingMode]);

  // Reset
  const handleReset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setRawData([]);
    setColumns([]);
    setMapping({});
    setProgress(null);
    setSummary(null);
    setError(null);
  }, []);

  // Renderiza conteúdo baseado no step atual
  const renderContent = () => {
    switch (step) {
      case "upload":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HiArrowUpTray className="h-5 w-5 text-lovely-secondary" />
                  Enviar Arquivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200",
                    isDragging
                      ? "border-lovely-accent bg-lovely-accent/10"
                      : "border-lovely-secondary/30 hover:border-lovely-secondary/50"
                  )}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-lovely-secondary/10">
                      <HiDocumentText className="h-10 w-10 text-lovely-secondary" />
                    </div>
                    <div>
                      <p className="text-lovely-white font-medium mb-1">
                        Arraste um arquivo Excel ou CSV aqui
                      </p>
                      <p className="text-lovely-white/60 text-sm">
                        ou clique para selecionar
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileSelect(f);
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lovely-secondary/20 text-lovely-secondary font-medium cursor-pointer hover:bg-lovely-secondary/30 transition-colors"
                    >
                      Selecionar Arquivo
                    </label>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-destructive text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );

      case "mapping":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* Info do arquivo */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HiDocumentText className="h-6 w-6 text-lovely-secondary" />
                    <div>
                      <p className="font-medium text-lovely-white">{file?.name}</p>
                      <p className="text-sm text-lovely-white/60">
                        {rawData.length} linhas encontradas
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Trocar arquivo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Modo de mapeamento */}
            <Card>
              <CardHeader>
                <CardTitle>Modo de Mapeamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMappingMode("auto")}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                      mappingMode === "auto"
                        ? "border-lovely-accent bg-lovely-accent/10"
                        : "border-lovely-secondary/20 hover:border-lovely-secondary/40"
                    )}
                  >
                    <HiSparkles className="h-6 w-6 text-lovely-accent mb-2" />
                    <p className="font-medium text-lovely-white">Automático (IA)</p>
                    <p className="text-sm text-lovely-white/60">
                      A IA detecta as colunas automaticamente
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setMappingMode("manual")}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                      mappingMode === "manual"
                        ? "border-lovely-accent bg-lovely-accent/10"
                        : "border-lovely-secondary/20 hover:border-lovely-secondary/40"
                    )}
                  >
                    <HiDocumentText className="h-6 w-6 text-lovely-secondary mb-2" />
                    <p className="font-medium text-lovely-white">Manual</p>
                    <p className="text-sm text-lovely-white/60">
                      Você seleciona cada coluna
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Mapeamento manual */}
            <AnimatePresence>
              {mappingMode === "manual" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Mapeamento de Colunas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {PRODUCT_FIELDS.map((field) => (
                          <div key={field.key} className="flex items-center gap-4">
                            <label className="w-40 text-sm font-medium text-lovely-white">
                              {field.label}
                              {field.required && <span className="text-destructive ml-1">*</span>}
                            </label>
                            <select
                              value={mapping[field.key as keyof ColumnMapping] || ""}
                              onChange={(e) => setMapping({
                                ...mapping,
                                [field.key]: e.target.value || undefined,
                              })}
                              className="flex-1 px-3 py-2 rounded-lg bg-lovely-secondary/10 border border-lovely-secondary/20 text-lovely-white focus:outline-none focus:ring-2 focus:ring-lovely-accent"
                            >
                              <option value="">Detectar automaticamente</option>
                              {columns.map((col) => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            {/* Botão de importar */}
            <div className="flex justify-center">
              <Button size="lg" onClick={handleStartImport}>
                <HiSparkles className="h-5 w-5" />
                Processar e Importar
              </Button>
            </div>
          </motion.div>
        );

      case "processing":
      case "importing":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto"
          >
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="p-4 rounded-full bg-lovely-accent/10"
                  >
                    <HiArrowPath className="h-10 w-10 text-lovely-accent" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-lovely-white mb-2">
                      {progress?.message || "Processando..."}
                    </p>
                    {progress && progress.total > 0 && (
                      <div className="space-y-2">
                        <div className="w-64 h-2 bg-lovely-secondary/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-lovely-accent"
                            initial={{ width: 0 }}
                            animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className="text-sm text-lovely-white/60">
                          {progress.current} de {progress.total}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "done":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto"
          >
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-6">
                  <div className="p-4 rounded-full bg-green-500/10">
                    <HiCheck className="h-10 w-10 text-green-500" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-lovely-white mb-4">
                      Importação Concluída!
                    </h2>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-3 rounded-lg bg-lovely-secondary/10">
                        <p className="text-2xl font-bold text-lovely-accent">
                          {summary?.productsCreated || 0}
                        </p>
                        <p className="text-sm text-lovely-white/60">Produtos</p>
                      </div>
                      <div className="p-3 rounded-lg bg-lovely-secondary/10">
                        <p className="text-2xl font-bold text-lovely-secondary">
                          {summary?.categoriesCreated || 0}
                        </p>
                        <p className="text-sm text-lovely-white/60">Categorias</p>
                      </div>
                      <div className="p-3 rounded-lg bg-lovely-secondary/10">
                        <p className="text-2xl font-bold text-lovely-secondary">
                          {summary?.colorsCreated || 0}
                        </p>
                        <p className="text-sm text-lovely-white/60">Cores</p>
                      </div>
                    </div>
                    
                    {summary?.errors && summary.errors.length > 0 && (
                      <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-left">
                        <p className="text-sm font-medium text-destructive mb-2">
                          {summary.errors.length} erro(s) encontrado(s):
                        </p>
                        <ul className="text-xs text-destructive/80 space-y-1 max-h-32 overflow-y-auto">
                          {summary.errors.slice(0, 10).map((err, i) => (
                            <li key={i}>• {err}</li>
                          ))}
                          {summary.errors.length > 10 && (
                            <li>... e mais {summary.errors.length - 10}</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-3 justify-center">
                      <Button variant="secondary" onClick={handleReset}>
                        Nova Importação
                      </Button>
                      <Button onClick={() => onNavigate("products")}>
                        Ver Produtos
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
    }
  };

  return (
    <DashboardLayout
      title="Importar Produtos"
      currentPage={currentPage}
      onNavigate={onNavigate}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
