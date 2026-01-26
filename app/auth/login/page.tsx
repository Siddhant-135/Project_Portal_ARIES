'use client';

import { useState, useEffect } from 'react';
import { createClientBrowser } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams]);

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    const supabase = createClientBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'email profile',
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-bg-secondary rounded-lg shadow-lg border border-border-primary p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-text-primary">Sign In / Sign Up</h1>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 text-sm">
            Please sign in using your official <strong>@iitd.ac.in</strong> email address. Access is restricted to IIT Delhi users only.
          </div>

          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50 font-bold"
          >
            <svg className="w-5 h-5" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Sign in with Microsoft
          </button>
        </div>

        {error && (
          <div className="bg-status-error/20 border border-status-error text-status-error px-4 py-3 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-status-success/20 border border-status-success text-status-success px-4 py-3 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
