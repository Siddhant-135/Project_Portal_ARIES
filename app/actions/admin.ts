'use server';

import { createClientServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/lib/supabase/types';

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'Admin') {
    return { error: 'Unauthorized: Only Admins can update user roles' };
  }

  // Prevent demoting Admin
  if (role !== 'Admin' && userId === user.id) {
    return { error: 'Cannot demote yourself from Admin' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function searchUsersByEmail(email: string) {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated', users: [] };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'Admin') {
    return { error: 'Unauthorized: Only Admins can search users', users: [] };
  }

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', `%${email}%`)
    .limit(20);

  if (error) {
    return { error: error.message, users: [] };
  }

  return { success: true, users: users || [] };
}
