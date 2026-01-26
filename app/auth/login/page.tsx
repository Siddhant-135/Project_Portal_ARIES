'use client';

import { useState, useEffect } from 'react';
import { createClientBrowser } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClientBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validate email domain
    if (!email.endsWith('@iitd.ac.in')) {
      setError('Email must be from @iitd.ac.in domain');
      return;
    }

    // Validate full name
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    setLoading(true);

    const supabase = createClientBrowser();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Check if profile already exists (created by database trigger)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // Only create profile if it doesn't exist (trigger might have failed)
      if (!existingProfile) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName.trim() || data.user.user_metadata?.full_name || email.split('@')[0],
          role: 'Student',
        });

        if (profileError) {
          setError('Failed to create profile: ' + profileError.message);
          setLoading(false);
          return;
        }
      }

      setMessage('Account created! Please check your email to verify your account.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-bg-secondary rounded-lg shadow-lg border border-border-primary p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-primary">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h1>

        <div className="mb-6">
          <div className="bg-status-info/20 border border-status-info text-status-info px-4 py-3 rounded mb-4 text-sm">
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

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-primary"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg-secondary text-text-muted">Or</span>
            </div>
          </div>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Email (@iitd.ac.in)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary"
              placeholder="your.email@iitd.ac.in"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isSignUp}
                className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary"
            />
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

          <div className="flex flex-col space-y-3">
            {isSignUp ? (
              <button
                type="submit"
                disabled={loading || !fullName.trim()}
                className="w-full px-4 py-2 bg-pink-primary text-text-primary rounded hover:bg-pink-secondary transition disabled:opacity-50 font-bold"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-primary text-text-primary rounded hover:bg-purple-secondary transition disabled:opacity-50 font-bold"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="w-full px-4 py-2 bg-bg-tertiary text-text-primary rounded hover:bg-purple-dark transition font-medium text-sm"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
