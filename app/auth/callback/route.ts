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
        // Extract username (part before @) - this is the unique identifier
        const username = user.email.split('@')[0];
        
        // Check if profile exists by username (the unique identifier)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (!existingProfile) {
          // Profile not found by username - create it
          // Try RPC function first (uses SECURITY DEFINER)
          await supabase.rpc('ensure_user_profile', { user_id: user.id });
          
          // Verify profile was created/updated
          const { data: profileCheck } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();
            
          if (!profileCheck) {
            // Fallback: direct insert
            await supabase.from('profiles').insert({
              id: user.id,
              username: username,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || username,
              role: 'Student',
            });
          }
        } else {
          // Profile exists with this username - update email if it changed
          // This handles the case where same person logs in with different email domain
          if (existingProfile.email !== user.email) {
            await supabase
              .from('profiles')
              .update({ email: user.email })
              .eq('username', username);
          }
        }
      }

      return response;
    } else {
      console.error('OAuth Error:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed. Please try again.`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed. Please try again.`);
}
