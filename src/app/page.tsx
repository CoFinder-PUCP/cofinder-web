import { LoginButton } from '@/components/auth/login-button';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">CoFinder</h1>
          <p className="text-muted-foreground text-sm">
            Encuentra tu cofounder en la comunidad PUCP
          </p>
        </div>

        <LoginButton />

        <p className="text-xs text-muted-foreground text-center">
          Solo disponible para cuentas @pucp.edu.pe y @alumni.pucp.edu.pe
        </p>

      </div>
    </main>
  );
}
