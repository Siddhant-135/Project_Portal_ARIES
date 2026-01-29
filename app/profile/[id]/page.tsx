import { createClientServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClientServer();

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.id)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Get all user's project participations (both as mentor and mentee)
  const { data: allParticipations } = await supabase
    .from('project_participants')
    .select('*, project:projects(*, creator:profiles!projects_created_by_fkey(*))')
    .eq('user_id', profile.id);

  // Filter and organize projects by status
  const validParticipations = allParticipations?.filter((p: any) => p.project) || [];
  
  // Ongoing projects (Launched status) - both mentor and mentee
  const ongoingProjects = validParticipations.filter(
    (p: any) => p.project.status === 'Launched'
  );
  
  // Open projects (waiting for applications or applied) - both mentor and mentee
  const openProjects = validParticipations.filter(
    (p: any) => p.project.status === 'Open'
  );
  
  // Completed projects - both mentor and mentee
  const completedProjects = validParticipations.filter(
    (p: any) => p.project.status === 'Completed'
  );
  
  // Terminated projects (only show for mentors for history)
  const terminatedProjects = validParticipations.filter(
    (p: any) => p.project.status === 'Terminated' && p.role === 'Mentor'
  );

  const statusColors: Record<string, string> = {
    Open: 'bg-status-success text-text-primary font-bold',
    Launched: 'bg-status-info text-text-primary font-bold',
    Completed: 'bg-bg-tertiary text-text-primary font-bold',
    Terminated: 'bg-status-error text-text-primary font-bold',
  };

  const roleColors: Record<string, string> = {
    Mentor: 'bg-pink-primary text-text-primary',
    Mentee: 'bg-purple-primary text-text-primary',
  };

  const renderProjectCard = (participant: any) => {
    const project = participant.project;
    if (!project) return null;

    return (
      <div
        key={participant.id}
        className="border border-border-primary rounded-lg p-4 hover:bg-bg-tertiary bg-bg-primary transition ai-border"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link
              href={`/project/${project.id}`}
              className="text-lg font-bold text-text-primary underline decoration-purple-light/70 underline-offset-4 hover:decoration-purple-secondary"
            >
              {project.title}
            </Link>
            <p className="text-sm text-text-muted mt-1">
              by {project.creator?.full_name || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${roleColors[participant.role]}`}
            >
              {participant.role}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${
                statusColors[project.status] || 'bg-bg-tertiary text-text-primary'
              }`}
            >
              {project.status === 'Launched' ? 'Ongoing' : project.status}
            </span>
          </div>
        </div>
        <p className="text-sm text-text-muted mt-2">
          {participant.status !== 'Active' && (
            <span className="text-text-primary underline decoration-status-warning decoration-2 underline-offset-4">
              ({participant.status}) •{' '}
            </span>
          )}
          Created: {formatDate(project.created_at)}
        </p>
      </div>
    );
  };

  const hasAnyProjects = ongoingProjects.length > 0 || openProjects.length > 0 || 
                          completedProjects.length > 0 || terminatedProjects.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Info */}
      <div className="bg-bg-secondary rounded-lg p-6 mb-6 ai-border ai-glow">
        <h1 className="text-3xl font-bold mb-4 text-text-primary">{profile.full_name}</h1>
        <div className="space-y-2 text-text-secondary">
          <p>
            <span className="font-bold">Email:</span> {profile.email}
          </p>
          {profile.branch && (
            <p>
              <span className="font-bold">Branch:</span> {profile.branch}
            </p>
          )}
          <p>
            <span className="font-bold">Role:</span>{' '}
            <span className="px-2 py-1 bg-purple-primary text-text-primary rounded text-sm font-bold">
              {profile.role}
            </span>
          </p>
        </div>
      </div>

      {/* My Projects Section */}
      {hasAnyProjects ? (
        <div className="bg-bg-secondary rounded-lg p-6 ai-border ai-glow">
          <h2 className="text-2xl font-bold mb-6 text-text-primary border-l-2 border-purple-primary pl-3">
            My Projects
          </h2>
          
          <div className="space-y-8">
            {/* Ongoing Projects */}
            {ongoingProjects.length > 0 && (
              <section>
                <h3 className="text-xl font-bold mb-4 text-text-primary flex items-center gap-2 px-3 py-2 rounded-lg border border-status-info/40 bg-status-info/10">
                  <span className="w-3 h-3 bg-status-info rounded-full"></span>
                  Ongoing Projects
                  <span className="text-sm font-normal text-text-muted ml-2">({ongoingProjects.length})</span>
                </h3>
                <div className="space-y-3">
                  {ongoingProjects.map(renderProjectCard)}
                </div>
              </section>
            )}

            {/* Open Projects */}
            {openProjects.length > 0 && (
              <section>
                <h3 className="text-xl font-bold mb-4 text-text-primary flex items-center gap-2">
                  <span className="w-3 h-3 bg-status-success rounded-full"></span>
                  Open Projects
                  <span className="text-sm font-normal text-text-muted ml-2">({openProjects.length})</span>
                </h3>
                <div className="space-y-3">
                  {openProjects.map(renderProjectCard)}
                </div>
              </section>
            )}

            {/* Completed Projects */}
            {completedProjects.length > 0 && (
              <section>
                <h3 className="text-xl font-bold mb-4 text-text-muted flex items-center gap-2">
                  <span className="w-3 h-3 bg-text-muted rounded-full"></span>
                  Completed Projects
                  <span className="text-sm font-normal text-text-muted ml-2">({completedProjects.length})</span>
                </h3>
                <div className="space-y-3">
                  {completedProjects.map(renderProjectCard)}
                </div>
              </section>
            )}

            {/* Terminated Projects (only for mentors) */}
            {terminatedProjects.length > 0 && (
              <section>
                <h3 className="text-xl font-bold mb-4 text-text-primary flex items-center gap-2">
                  <span className="w-3 h-3 bg-status-error rounded-full"></span>
                  Terminated Projects
                  <span className="text-sm font-normal text-text-muted ml-2">({terminatedProjects.length})</span>
                </h3>
                <div className="space-y-3">
                  {terminatedProjects.map(renderProjectCard)}
                </div>
              </section>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-bg-secondary rounded-lg p-6 text-center ai-border">
          <p className="text-text-muted">No project history</p>
        </div>
      )}
    </div>
  );
}
