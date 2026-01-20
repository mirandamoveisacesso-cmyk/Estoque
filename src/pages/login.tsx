import { useState, type FormEvent } from "react";
import { HiEnvelope, HiLockClosed, HiExclamationCircle } from "react-icons/hi2";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoMiranda from "@/assets/logo-miranda.png";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Email ou senha incorretos. Tente novamente.");
      }
    } catch {
      setError("Ocorreu um erro. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-lovely-primary">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-lovely-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-lovely-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Card de Login */}
      <article className="relative w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl shadow-black/20">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={logoMiranda}
              alt="Miranda Móveis - Atacadão de Móveis"
              className="w-64 h-auto drop-shadow-lg"
            />
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="text-white/70 text-sm">
              Acesse o painel administrativo
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<HiEnvelope className="h-5 w-5" />}
              required
              autoComplete="email"
            />

            <Input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<HiLockClosed className="h-5 w-5" />}
              required
              autoComplete="current-password"
            />

            {/* Mensagem de Erro */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                <HiExclamationCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botão de Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-white/50 text-xs mt-8">
            © {new Date().getFullYear()} Miranda Móveis. Todos os direitos reservados.
          </p>
        </div>
      </article>
    </main>
  );
}
