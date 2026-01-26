'use client';

import { useState } from 'react';
import { createClientBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

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

    setLoading(true);

    const supabase = createClientBrowser();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
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
          full_name: email.split('@')[0], // Use email prefix as default name
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
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-primary">Sign In / Sign Up</h1>

        <form className="space-y-4">
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

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-primary text-text-primary rounded hover:bg-purple-secondary transition disabled:opacity-50 font-bold"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-pink-primary text-text-primary rounded hover:bg-pink-secondary transition disabled:opacity-50 font-bold"
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
