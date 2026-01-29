import { createClientServer } from '@/lib/supabase/server';
import ProjectCard from '@/components/ProjectCard';

export default async function FeedPage() {
  const supabase = createClientServer();

  // Fetch all visible projects (Open, Launched, Completed) - exclude Terminated
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, creator:profiles!projects_created_by_fkey(*)')
    .in('status', ['Open', 'Launched', 'Completed'])
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-text-primary font-bold underline decoration-status-error decoration-2 underline-offset-4">
          Unable to load projects right now. Please try again.
        </p>
      </div>
    );
  }

  // Separate projects by status
  const openProjects = projects?.filter((p: any) => p.status === 'Open') || [];
  const ongoingProjects = projects?.filter((p: any) => p.status === 'Launched') || [];
  const completedProjects = projects?.filter((p: any) => p.status === 'Completed') || [];

  const hasAnyProjects = openProjects.length > 0 || ongoingProjects.length > 0 || completedProjects.length > 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-text-primary">Project Feed</h1>
      
      {hasAnyProjects ? (
        <div className="space-y-10">
          {/* Open Projects Section */}
          {openProjects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-text-primary flex items-center gap-2">
                <span className="w-3 h-3 bg-status-success rounded-full"></span>
                Open Projects
                <span className="text-sm font-normal text-text-muted ml-2">({openProjects.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openProjects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}

          {/* Ongoing Projects Section */}
          {ongoingProjects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-text-primary flex items-center gap-2 px-3 py-2 rounded-lg border border-status-info/40 bg-status-info/10">
                <span className="w-3 h-3 bg-status-info rounded-full"></span>
                Ongoing Projects
                <span className="text-sm font-normal text-text-muted ml-2">({ongoingProjects.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingProjects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}

          {/* Completed Projects Section */}
          {completedProjects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-text-muted flex items-center gap-2">
                <span className="w-3 h-3 bg-text-muted rounded-full"></span>
                Completed Projects
                <span className="text-sm font-normal text-text-muted ml-2">({completedProjects.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedProjects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-text-muted">No projects available</p>
        </div>
      )}
    </div>
  );
}
