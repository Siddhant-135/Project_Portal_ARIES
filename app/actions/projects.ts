'use server';

import { createClientServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { countWords } from '@/lib/utils';
import type { ProjectStatus } from '@/lib/supabase/types';

export async function createProject(formData: FormData) {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }
  const username = user.email?.split('@')[0];
  if (!username) {
    return { error: 'Invalid user email' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('username', username)
    .single();

  if (!profile || !['ARIES_Member', 'Admin'].includes(profile.role)) {
    return { error: 'Unauthorized: Only ARIES Members and Admins can create projects' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const prerequisites = formData.get('prerequisites') as string;
  const learning_objectives = formData.get('learning_objectives') as string;
  const max_students = parseInt(formData.get('max_students') as string);
  const codebase_link = formData.get('codebase_link') as string | null;
  const doc_link = formData.get('doc_link') as string | null;

  // Word count validation
  const maxWords = 50;
  if (countWords(description) > maxWords) {
    return { error: `Description must be ${maxWords} words or less` };
  }
  if (countWords(prerequisites) > maxWords) {
    return { error: `Prerequisites must be ${maxWords} words or less` };
  }
  if (countWords(learning_objectives) > maxWords) {
    return { error: `Learning objectives must be ${maxWords} words or less` };
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title,
      description,
      prerequisites,
      learning_objectives,
      max_students,
      codebase_link,
      doc_link,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Add creator as mentor
  await supabase.from('project_participants').insert({
    project_id: project.id,
    user_id: profile.id,
    role: 'Mentor',
    status: 'Active',
    consent_to_share: true,
  });

  revalidatePath('/');
  return { success: true, project };
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  endingRemarks?: string
) {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }
  const username = user.email?.split('@')[0];
  if (!username) {
    return { error: 'Invalid user email' };
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();
  if (!profile) {
    return { error: 'Profile not found' };
  }

  const { data: project } = await supabase
    .from('projects')
    .select('created_by')
    .eq('id', projectId)
    .single();

  if (!project || project.created_by !== profile.id) {
    return { error: 'Unauthorized: Only project creator can update status' };
  }

  const updateData: any = { status };
  if (endingRemarks) {
    updateData.ending_remarks = endingRemarks;
  }

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/project/${projectId}`);
  revalidatePath('/');
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }
  const username = user.email?.split('@')[0];
  if (!username) {
    return { error: 'Invalid user email' };
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();
  if (!profile) {
    return { error: 'Profile not found' };
  }

  const { data: project } = await supabase
    .from('projects')
    .select('created_by, status')
    .eq('id', projectId)
    .single();

  if (!project || project.created_by !== profile.id) {
    return { error: 'Unauthorized: Only project creator can delete project' };
  }

  // Check if there are active participants
  const { data: participants } = await supabase
    .from('project_participants')
    .select('id')
    .eq('project_id', projectId)
    .eq('status', 'Active')
    .neq('user_id', profile.id); // Exclude the creator

  if (participants && participants.length > 0) {
    // Set status to Terminated instead of deleting
    const { error } = await supabase
      .from('projects')
      .update({ status: 'Terminated' })
      .eq('id', projectId);

    if (error) {
      return { error: error.message };
    }
  } else {
    // No active participants, safe to delete
    const { error } = await supabase.from('projects').delete().eq('id', projectId);

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath('/');
  revalidatePath(`/project/${projectId}`);
  return { success: true };
}
