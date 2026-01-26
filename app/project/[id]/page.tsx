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
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = profileData;

    if (profile?.role === 'Student') {
      activeSlots = await getActiveSlots(user.id);
    }
  }

  const isMentor = user?.id === project.created_by;
  const isStudent = profile?.role === 'Student' && !isMentor;

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
