'use server';

import { createClientServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { countWords, mapSupabaseError } from '@/lib/utils';
import type { ParticipantStatus } from '@/lib/supabase/types';

export async function getActiveSlots(userId: string): Promise<number> {
  const supabase = createClientServer();

  const { data: participants, error } = await supabase
    .from('project_participants')
    .select('project_id, projects!inner(status)')
    .eq('user_id', userId)
    .eq('status', 'Active');

  if (error) {
    return 0;
  }

  // Count slots: Active participants in Open or Launched projects
  const activeSlots = participants?.filter(
    (p: any) => p.projects.status === 'Open' || p.projects.status === 'Launched'
  ).length || 0;

  return activeSlots;
}

export async function applyToProject(
  projectId: string,
  prerequisitesMet: boolean,
  prerequisitesNotes: string,
  consentToShare: boolean
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
    .select('id, role')
    .eq('username', username)
    .single();

  if (!profile) {
    return { error: 'Profile not found' };
  }

  // Check if user is the project creator (mentor) - mentors cannot apply to their own project
  const { data: project } = await supabase
    .from('projects')
    .select('created_by, status, max_students')
    .eq('id', projectId)
    .single();

  if (!project) {
    return { error: 'Project not found' };
  }

  if (project.created_by === profile.id) {
    return { error: 'You cannot apply to your own project' };
  }

  if (project.status !== 'Open') {
    return { error: 'Project is not accepting applications' };
  }

  // Must have prerequisites met to apply
  if (!prerequisitesMet) {
    return { error: 'Prerequisites not met, cannot apply' };
  }

  // If prerequisites met but notes empty, auto-fill with "N/A"
  const finalNotes = prerequisitesNotes.trim() || 'N/A';

  // Validate prerequisites_notes (50 words max)
  const maxNotesWords = 50;
  if (countWords(finalNotes) > maxNotesWords) {
    return { error: `Related experience must be ${maxNotesWords} words or less` };
  }

  // Check 3-slot rule
  const activeSlots = await getActiveSlots(profile.id);
  if (activeSlots >= 3) {
    return { error: 'You have reached the maximum of 3 active project slots' };
  }

  // Check if already applied
  const { data: existing } = await supabase
    .from('project_participants')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', profile.id)
    .single();

  if (existing) {
    return { error: 'You have already applied to this project' };
  }

  // Check max students limit
  const { data: currentParticipants } = await supabase
    .from('project_participants')
    .select('id')
    .eq('project_id', projectId)
    .eq('status', 'Active');

  if (currentParticipants && currentParticipants.length >= project.max_students) {
    return { error: 'Project has reached maximum student capacity' };
  }

  // Insert as 'Pending' - mentor must accept to make 'Active'
  const { error } = await supabase.from('project_participants').insert({
    project_id: projectId,
    user_id: profile.id,
    role: 'Mentee',
    status: 'Pending',
    prerequisites_met: prerequisitesMet,
    prerequisites_notes: finalNotes,
    consent_to_share: consentToShare,
  });

  if (error) {
    return { error: mapSupabaseError(error.message) };
  }

  revalidatePath(`/project/${projectId}`);
  revalidatePath('/');
  return { success: true };
}

export async function acceptApplication(participantId: string) {
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

  // Get participant and project info
  const { data: participant } = await supabase
    .from('project_participants')
    .select('project_id, status, projects!inner(created_by, max_students, status)')
    .eq('id', participantId)
    .single();

  if (!participant || (participant as any).projects.created_by !== profile.id) {
    return { error: 'Unauthorized: Only project creator can accept applications' };
  }

  // Check if project is still Open
  if ((participant as any).projects.status !== 'Open') {
    return { error: 'Can only accept applications for Open projects' };
  }

  // Check if application is Pending
  if ((participant as any).status !== 'Pending') {
    return { error: 'Application is not pending' };
  }

  // Check max students limit (count only Active mentees, not Pending)
  const { data: activeMentees } = await supabase
    .from('project_participants')
    .select('id')
    .eq('project_id', (participant as any).project_id)
    .eq('role', 'Mentee')
    .eq('status', 'Active');

  if (
    activeMentees &&
    activeMentees.length >= (participant as any).projects.max_students
  ) {
    return { error: 'Project has reached maximum student capacity' };
  }

  // Update status from Pending to Active
  const { error } = await supabase
    .from('project_participants')
    .update({ status: 'Active' })
    .eq('id', participantId);

  if (error) {
    return { error: mapSupabaseError(error.message) };
  }

  revalidatePath(`/project/${(participant as any).project_id}`);
  return { success: true };
}

export async function rejectApplication(participantId: string) {
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

  const { data: participant } = await supabase
    .from('project_participants')
    .select('project_id, projects!inner(created_by)')
    .eq('id', participantId)
    .single();

  if (!participant || (participant as any).projects.created_by !== profile.id) {
    return { error: 'Unauthorized: Only project creator can reject applications' };
  }

  const { error } = await supabase
    .from('project_participants')
    .delete()
    .eq('id', participantId);

  if (error) {
    return { error: mapSupabaseError(error.message) };
  }

  revalidatePath(`/project/${(participant as any).project_id}`);
  return { success: true };
}

export async function updateParticipantStatus(
  participantId: string,
  status: ParticipantStatus,
  reviewText?: string
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

  const { data: participant } = await supabase
    .from('project_participants')
    .select('project_id, user_id, role, projects!inner(created_by)')
    .eq('id', participantId)
    .single();

  if (!participant || (participant as any).projects.created_by !== profile.id) {
    return { error: 'Unauthorized: Only project creator can update participant status' };
  }

  // If status is Dropped or Discharged, require review
  if ((status === 'Dropped' || status === 'Discharged') && !reviewText) {
    return { error: 'Review is required when dropping or discharging a mentee' };
  }

  if (reviewText) {
    const maxReviewWords = 30;
    if (countWords(reviewText) > maxReviewWords) {
      return { error: `Review must be ${maxReviewWords} words or less` };
    }
  }

  const { error: updateError } = await supabase
    .from('project_participants')
    .update({ status })
    .eq('id', participantId);

  if (updateError) {
    return { error: mapSupabaseError(updateError.message) };
  }

  // Create review if provided
  if (reviewText && (status === 'Dropped' || status === 'Discharged')) {
    const { error: reviewError } = await supabase.from('reviews').insert({
      project_id: (participant as any).project_id,
      student_id: (participant as any).user_id,
      mentor_id: profile.id,
      review_text: reviewText,
    });

    if (reviewError) {
      return { error: mapSupabaseError(reviewError.message) };
    }
  }

  revalidatePath(`/project/${(participant as any).project_id}`);
  const { data: participantProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', (participant as any).user_id)
    .single();
  if (participantProfile?.username) {
    revalidatePath(`/profile/${participantProfile.username}`);
  }
  return { success: true };
}
