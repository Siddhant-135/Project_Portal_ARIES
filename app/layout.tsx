import type { Metadata } from 'next';
import './globals.css';
import { createClientServer } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'ARIES Project Portal',
  description: 'Project management portal for ARIES',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // If user exists but profile doesn't, create it
    if (!data) {
      // Try to create profile using RPC function
      await supabase.rpc('ensure_user_profile', { user_id: user.id });
      
      // Try direct insert as fallback
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: 'Student',
      });
      
      // Fetch again
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = newProfile;
    } else {
      profile = data;
    }
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-primary">
        <Navigation user={user} profile={profile} />
        <main className="container mx-auto px-4 py-8 max-w-7xl">{children}</main>
      </body>
    </html>
  );
}
