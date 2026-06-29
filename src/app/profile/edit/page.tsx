import { Nav } from '@/components/layout/nav';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';

export default function ProfileEditPage() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Editar perfil</h1>
          <p className="text-muted-foreground text-sm">
            Actualiza tu información para que otros te encuentren.
          </p>
        </div>
        <ProfileEditForm />
      </div>
    </main>
  );
}
