import { createClientServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Get user's projects as mentor (including Terminated)
  const { data: mentorProjects } = await supabase
    .from('project_participants')
    .select('*, project:projects(*, creator:profiles!projects_created_by_fkey(*))')
    .eq('user_id', params.id)
    .eq('role', 'Mentor');

  // Get user's projects as mentee (excluding Terminated)
  const { data: menteeProjects } = await supabase
    .from('project_participants')
    .select('*, project:projects!inner(*, creator:profiles!projects_created_by_fkey(*))')
    .eq('user_id', params.id)
    .eq('role', 'Mentee')
    .not('project.status', 'eq', 'Terminated');

  const isOwnProfile = user?.id === params.id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-bg-secondary rounded-lg shadow-lg border border-border-primary p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4 text-purple-primary">{profile.full_name}</h1>
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

      {/* Mentor Projects */}
      {mentorProjects && mentorProjects.length > 0 && (
        <div className="bg-bg-secondary rounded-lg shadow-lg border border-border-primary p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-pink-primary">Projects as Mentor</h2>
          <div className="space-y-4">
            {mentorProjects.map((participant: any) => {
              const project = participant.project;
              if (!project) return null;

              const statusColors: Record<string, string> = {
                Open: 'bg-status-success text-text-primary font-bold',
                Launched: 'bg-status-info text-text-primary font-bold',
                Completed: 'bg-bg-tertiary text-text-primary font-bold',
                Terminated: 'bg-status-error text-text-primary font-bold',
              };

              return (
                <div
                  key={participant.id}
                  className="border border-border-primary rounded-lg p-4 hover:bg-bg-tertiary bg-bg-primary transition"
                >
                  <div className="flex justify-between items-start">
                    <Link
                      href={`/project/${project.id}`}
                      className="text-lg font-bold text-purple-light hover:text-purple-primary hover:underline"
                    >
                      {project.title}
                    </Link>
                    <div className="flex items-center space-x-2">
                      {project.status === 'Terminated' && (
                        <span className="text-xs text-status-error font-bold">
                          Terminated
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          statusColors[project.status] || 'bg-bg-tertiary text-text-primary'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-muted mt-2">
                    Status: {participant.status} • Created:{' '}
                    {formatDate(project.created_at)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mentee Projects */}
      {menteeProjects && menteeProjects.length > 0 && (
        <div className="bg-bg-secondary rounded-lg shadow-lg border border-border-primary p-6">
          <h2 className="text-2xl font-bold mb-4 text-pink-primary">Projects as Mentee</h2>
          <div className="space-y-4">
            {menteeProjects.map((participant: any) => {
              const project = participant.project;
              if (!project) return null;

              const statusColors: Record<string, string> = {
                Open: 'bg-status-success text-text-primary font-bold',
                Launched: 'bg-status-info text-text-primary font-bold',
                Completed: 'bg-bg-tertiary text-text-primary font-bold',
              };

              return (
                <div
                  key={participant.id}
                  className="border border-border-primary rounded-lg p-4 hover:bg-bg-tertiary bg-bg-primary transition"
                >
                  <div className="flex justify-between items-start">
                    <Link
                      href={`/project/${project.id}`}
                      className="text-lg font-bold text-purple-light hover:text-purple-primary hover:underline"
                    >
                      {project.title}
                    </Link>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        statusColors[project.status] || 'bg-bg-tertiary text-text-primary'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted mt-2">
                    Status: {participant.status} • Created:{' '}
                    {formatDate(project.created_at)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(!mentorProjects || mentorProjects.length === 0) &&
        (!menteeProjects || menteeProjects.length === 0) && (
          <div className="bg-bg-secondary rounded-lg shadow-lg border border-border-primary p-6 text-center">
            <p className="text-text-muted">No project history</p>
          </div>
        )}
    </div>
  );
}
