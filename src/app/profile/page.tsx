import { Nav } from '@/components/layout/nav';
import { ProfileView } from '@/components/profile/profile-view';

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-lg mx-auto px-4 py-8">
        <ProfileView />
      </div>
    </main>
  );
}
