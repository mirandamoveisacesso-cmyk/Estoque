import { HiCheck } from "react-icons/hi2";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { PageId } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme, type ColorTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

interface SettingsPageProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

function ThemeCard({
  theme,
  isSelected,
  onSelect,
}: {
  theme: ColorTheme;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg",
        isSelected
          ? "border-lovely-accent shadow-lg shadow-lovely-accent/20"
          : "border-lovely-secondary/20 hover:border-lovely-secondary/40"
      )}
      style={{ backgroundColor: `${theme.colors.primary}20` }}
    >
      {/* Indicador de selecionado */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-lovely-accent flex items-center justify-center">
          <HiCheck className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Preview das cores */}
      <div className="flex gap-1">
        <div
          className="w-12 h-12 rounded-lg shadow-inner"
          style={{ backgroundColor: theme.colors.primary }}
          title="Primary"
        />
        <div
          className="w-12 h-12 rounded-lg shadow-inner"
          style={{ backgroundColor: theme.colors.secondary }}
          title="Secondary"
        />
        <div
          className="w-12 h-12 rounded-lg shadow-inner"
          style={{ backgroundColor: theme.colors.accent }}
          title="Accent"
        />
      </div>

      {/* Nome do tema */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{theme.emoji}</span>
        <span className="text-sm font-medium text-lovely-white">
          {theme.name}
        </span>
      </div>
    </button>
  );
}

export function SettingsPage({ currentPage, onNavigate }: SettingsPageProps) {
  const { currentTheme, setTheme, themes } = useTheme();

  return (
    <DashboardLayout
      title="Configurações"
      currentPage={currentPage}
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {/* Seção de Aparência */}
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-lovely-white mb-1">
                  Padrão de Cores
                </h3>
                <p className="text-sm text-lovely-white/60 mb-4">
                  Escolha o tema de cores que mais combina com você. A alteração é aplicada instantaneamente.
                </p>
              </div>

              {/* Grid de temas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isSelected={currentTheme.id === theme.id}
                    onSelect={() => setTheme(theme.id)}
                  />
                ))}
              </div>

              {/* Tema atual */}
              <div className="pt-4 border-t border-lovely-secondary/20">
                <p className="text-sm text-lovely-white/60">
                  Tema atual:{" "}
                  <span className="font-medium text-lovely-white">
                    {currentTheme.emoji} {currentTheme.name}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
