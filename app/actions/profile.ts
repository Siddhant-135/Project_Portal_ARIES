'use server';

import { createClientServer } from '@/lib/supabase/server';

export async function ensureProfileExists() {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    return { success: true, exists: true };
  }

  // Profile doesn't exist, create it
  // Use RPC to call the database function which has SECURITY DEFINER
  const { error: rpcError } = await supabase.rpc('ensure_user_profile', {
    user_id: user.id,
  });

  if (rpcError) {
    // Fallback: try direct insert
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email!,
      full_name: user.email?.split('@')[0] || 'User',
      role: 'Student',
    });

    if (insertError) {
      return { error: insertError.message };
    }
  }

  return { success: true, created: true };
}
