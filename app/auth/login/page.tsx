'use client';

import { useState, useEffect } from 'react';
import { createClientBrowser } from '@/lib/supabase/client';
import { mapSupabaseError } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(mapSupabaseError(errorParam));
    }
  }, [searchParams]);

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);
    
    const supabase = createClientBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-primary">
          Sign In
        </h1>

        <div className="mb-6">
          <div className="bg-status-info/20 border border-status-info text-status-info px-4 py-3 rounded mb-6 text-sm">
            Please sign in using your Microsoft account linked to your IIT Delhi organization account.
          </div>

          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50 font-bold ai-border"
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
          <div className="bg-status-error/20 border border-status-error text-status-error px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
