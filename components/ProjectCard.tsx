import Link from 'next/link';
import type { Project, Profile } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project & { creator: Profile };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    Open: 'bg-status-success text-text-primary font-bold',
    Launched: 'bg-status-info text-text-primary font-bold',
    Completed: 'bg-bg-tertiary text-text-primary font-bold',
    Terminated: 'bg-status-error text-text-primary font-bold',
  };

  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-bg-secondary rounded-lg p-6 ai-border hover:ai-glow hover:border-purple-primary transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-text-primary">{project.title}</h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              statusColors[project.status] || 'bg-bg-tertiary text-text-primary'
            }`}
          >
            {project.status}
          </span>
        </div>
        <p className="text-text-secondary mb-4 line-clamp-3">{project.description}</p>
        <div className="flex justify-between items-center text-sm text-text-muted">
          <span>By {project.creator.full_name}</span>
          <span>{formatDate(project.created_at)}</span>
        </div>
        {project.max_students && (
          <div className="mt-2 text-sm text-text-muted">
            Max Students: {project.max_students}
          </div>
        )}
      </div>
    </Link>
  );
}
