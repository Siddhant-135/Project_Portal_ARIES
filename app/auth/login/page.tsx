'use client';

import { useState, useEffect } from 'react';
import { createClientBrowser } from '@/lib/supabase/client';
import { mapSupabaseError } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const nextParam = searchParams.get('next') ?? '/';

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(mapSupabaseError(errorParam));
    }
  }, [searchParams]);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const supabase = createClientBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace(nextParam);
        router.refresh();
      }
    };

    checkSessionAndRedirect();
  }, [nextParam, router]);

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);
    
    const supabase = createClientBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextParam)}`,
        scopes: 'email profile',
      },
    });

    if (error) {
      setError(mapSupabaseError(error.message));
      setLoading(false);
    }
    // If successful, user will be redirected to Microsoft, then to /auth/callback
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-bg-secondary rounded-lg p-6 ai-border ai-glow">
        <h1 className="text-2xl font-bold mb-6 text-center text-text-primary">
          Sign In
        </h1>

        <div className="mb-6">
          <div className="bg-status-info/20 border border-status-info text-text-primary px-4 py-3 rounded mb-6 text-sm">
            Please sign in using your Microsoft account linked to your IIT Delhi organization account.
          </div>

          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-bg-tertiary hover:bg-purple-dark text-text-primary border border-border-primary rounded transition disabled:opacity-50 font-bold ai-border focus:outline-none focus:ring-2 focus:ring-purple-primary"
          >
            <svg className="w-5 h-5" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            {loading ? 'Redirecting...' : 'Sign in with Microsoft'}
          </button>
        </div>

        {error && (
          <div className="bg-status-error/20 border border-status-error text-text-primary px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
