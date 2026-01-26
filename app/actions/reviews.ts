'use server';

import { createClientServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { countWords } from '@/lib/utils';

export async function createReview(
  projectId: string,
  studentId: string,
  reviewText: string
) {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Word count validation
  if (countWords(reviewText) > 100) {
    return { error: 'Review must be 100 words or less' };
  }

  // Verify user is mentor of this project
  const { data: participant } = await supabase
    .from('project_participants')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .eq('role', 'Mentor')
    .single();

  if (!participant) {
    return { error: 'Unauthorized: Only mentors can create reviews' };
  }

  const { error } = await supabase.from('reviews').insert({
    project_id: projectId,
    student_id: studentId,
    mentor_id: user.id,
    review_text: reviewText,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/project/${projectId}`);
  revalidatePath('/admin');
  return { success: true };
}

export async function createExitReview(
  projectId: string,
  studentId: string,
  reviewText: string
) {
  // This is called when a project is completed
  return createReview(projectId, studentId, reviewText);
}
