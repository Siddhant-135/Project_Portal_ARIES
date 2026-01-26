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
  if (user && user.email) {
    const username = user.email.split('@')[0];
    
    // Username is the unique identifier - find profile by username first
    let { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    
    if (!data) {
      // Profile not found by username - create it
      await supabase.rpc('ensure_user_profile', { user_id: user.id });
      
      // Fetch the profile by username (it may have been created or updated)
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (!newProfile) {
        // Fallback: direct insert
        await supabase.from('profiles').insert({
          id: user.id,
          username: username,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || username,
          role: 'Student',
        });
        
        const { data: fallbackProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
        profile = fallbackProfile;
      } else {
        profile = newProfile;
      }
    } else {
      profile = data;
      
      // Update email if it changed (handles different email domains for same username)
      if (data.email !== user.email) {
        await supabase
          .from('profiles')
          .update({ email: user.email })
          .eq('username', username);
        profile = { ...data, email: user.email };
      }
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
