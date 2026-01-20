import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { PageId } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsPageProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export function SettingsPage({ currentPage, onNavigate }: SettingsPageProps) {
  return (
    <DashboardLayout
      title="Configurações"
      currentPage={currentPage}
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {/* Seção de Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre o Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-sm text-white/60">Versão</span>
                <span className="text-sm font-medium text-white">1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-sm text-white/60">Sistema</span>
                <span className="text-sm font-medium text-white">Miranda Móveis - Catálogo</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-white/60">Suporte</span>
                <a
                  href="mailto:suporte@mirandamoveis.com.br"
                  className="text-sm font-medium text-miranda-primary hover:underline"
                >
                  suporte@mirandamoveis.com.br
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
