import { createClientServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProjectStudentView from '@/components/ProjectStudentView';
import ProjectMentorView from '@/components/ProjectMentorView';
import { getActiveSlots } from '@/app/actions/applications';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get project with creator
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*, creator:profiles!projects_created_by_fkey(*)')
    .eq('id', params.id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Get participants
  const { data: participants } = await supabase
    .from('project_participants')
    .select('*, user:profiles(*)')
    .eq('project_id', params.id)
    .order('created_at', { ascending: true });

  // Get user's profile
  let profile = null;
  let activeSlots = 0;
  if (user) {
    const username = user.email?.split('@')[0];
    if (username) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      profile = profileData;
    }

    // Get active slots for all users (role hierarchy: Admin ⊃ ARIES_Member ⊃ Student)
    if (profile) {
      activeSlots = await getActiveSlots(profile.id);
    }
  }

  const isMentor = profile?.id === project.created_by;

  return (
    <div className="max-w-4xl mx-auto">
      {isMentor ? (
        <ProjectMentorView
          project={project}
          participants={participants || []}
          user={user}
        />
      ) : (
        <ProjectStudentView
          project={project}
          participants={participants || []}
          user={user}
          profile={profile}
          activeSlots={activeSlots}
        />
      )}
    </div>
  );
}
