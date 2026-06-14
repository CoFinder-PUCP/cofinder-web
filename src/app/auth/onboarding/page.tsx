import { OnboardingForm } from '@/components/onboarding/onboarding-form';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Completa tu perfil</h1>
          <p className="text-muted-foreground text-sm">
            Cuéntale a la comunidad PUCP quién eres y qué buscas.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  );
}
