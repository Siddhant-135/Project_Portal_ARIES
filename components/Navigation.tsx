'use client';

import Link from 'next/link';
import { createClientBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/lib/supabase/types';
import { canCreateProjects } from '@/lib/utils';

interface NavigationProps {
  user: any;
  profile: Profile | null;
}

export default function Navigation({ user, profile }: NavigationProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClientBrowser();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-bg-secondary/90 backdrop-blur shadow-lg border-b border-border-primary sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-text-primary">
              ARIES Project Portal
            </Link>
            {user && (
              <>
                <Link
                  href="/"
                  className="text-text-secondary hover:text-purple-light transition font-medium"
                >
                  Feed
                </Link>
                {profile && (
                  <Link
                    href={`/profile/${profile.username}`}
                    className="text-text-secondary hover:text-purple-light transition font-medium"
                  >
                    My Profile
                  </Link>
                )}
                {canCreateProjects(profile?.role) && (
                  <Link
                    href="/project/new"
                    className="text-text-secondary hover:text-purple-light transition font-medium"
                  >
                    New Project
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-text-secondary">
                  {profile?.full_name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm bg-bg-tertiary hover:bg-purple-dark text-text-primary rounded transition font-medium ai-border"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm bg-purple-primary text-text-primary hover:bg-purple-secondary rounded transition font-medium ai-glow"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
