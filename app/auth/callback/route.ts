import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (errorParam) {
    console.error('OAuth Callback Error:', errorParam, errorDescription);
    return NextResponse.redirect(`${origin}/auth/login?error=${errorDescription || errorParam}`);
  }

  if (code) {
    const cookieStore = cookies();
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
            // Also set on response for immediate effect if needed, though cookieStore.set handles outgoing
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete(name);
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && user.email) {
        if (!user.email.endsWith('@iitd.ac.in')) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/auth/login?error=Only @iitd.ac.in emails are allowed`);
        }
        
        // Check if profile exists, if not create it
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
           await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name || user.email.split('@')[0],
            role: 'Student', // Default role
          });
        }
      }

      return response;
    } else {
      console.error('OAuth Error:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed: ${error.message}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed: No code provided`);
}
