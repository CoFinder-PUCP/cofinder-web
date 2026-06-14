import { ProfileView } from '@/components/profile/profile-view';

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-lg mx-auto">
        <ProfileView />
      </div>
    </main>
  );
}
