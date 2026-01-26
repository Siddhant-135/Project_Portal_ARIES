import { createClientServer } from '@/lib/supabase/server';
import ProjectCard from '@/components/ProjectCard';

export default async function FeedPage() {
  const supabase = createClientServer();

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, creator:profiles!projects_created_by_fkey(*)')
    .in('status', ['Open', 'Completed'])
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-status-error font-bold">Error loading projects: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-purple-primary">Project Feed</h1>
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-text-muted">No projects available</p>
        </div>
      )}
    </div>
  );
}
