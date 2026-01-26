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
    profile = data;
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
