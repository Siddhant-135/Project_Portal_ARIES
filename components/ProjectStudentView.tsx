'use client';

import { useState } from 'react';
import ApplicationModal from './ApplicationModal';
import { formatDate } from '@/lib/utils';
import type { Project, Profile, ProjectParticipant } from '@/lib/supabase/types';
import { useRouter } from 'next/navigation';

interface ProjectStudentViewProps {
  project: Project & { creator: Profile };
  participants: (ProjectParticipant & { user: Profile })[];
  user: any;
  profile: Profile | null;
  activeSlots: number;
}

export default function ProjectStudentView({
  project,
  participants,
  user,
  profile,
  activeSlots,
}: ProjectStudentViewProps) {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const router = useRouter();

  // Check if user has already applied (as mentee) using profile.id for proper comparison
  const hasApplied = participants.some(
    (p) => p.user_id === profile?.id && p.role === 'Mentee'
  );

  // Anyone can apply except the project creator (mentor) - role hierarchy: Admin ⊃ ARIES_Member ⊃ Student
  const canApply =
    user &&
    profile &&
    project.status === 'Open' &&
    !hasApplied &&
    activeSlots < 3;

  const handleApplicationSuccess = () => {
    router.refresh();
  };

  const statusColors: Record<string, string> = {
    Open: 'bg-status-success text-text-primary font-bold',
    Launched: 'bg-status-info text-text-primary font-bold',
    Completed: 'bg-bg-tertiary text-text-primary font-bold',
    Terminated: 'bg-status-error text-text-primary font-bold',
  };

  return (
    <>
      <div className="bg-bg-secondary rounded-lg p-6 ai-border ai-glow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-text-primary">{project.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-text-muted">
              <span>By {project.creator.full_name}</span>
              <span>•</span>
              <span>{formatDate(project.created_at)}</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              statusColors[project.status] || 'bg-bg-tertiary text-text-primary'
            }`}
          >
            {project.status}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2 text-text-primary border-l-2 border-purple-primary pl-3">
              Description
            </h2>
            <p className="text-text-secondary whitespace-pre-wrap">{project.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2 text-text-primary border-l-2 border-purple-primary pl-3">
              Prerequisites
            </h2>
            <p className="text-text-secondary whitespace-pre-wrap">{project.prerequisites}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2 text-text-primary border-l-2 border-purple-primary pl-3">
              Learning Objectives
            </h2>
            <p className="text-text-secondary whitespace-pre-wrap">
              {project.learning_objectives}
            </p>
          </div>

          {project.codebase_link && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-text-primary border-l-2 border-purple-primary pl-3">
                Codebase
              </h2>
              <a
                href={project.codebase_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary underline decoration-purple-light/70 underline-offset-4 hover:decoration-purple-secondary"
              >
                {project.codebase_link}
              </a>
            </div>
          )}

          {project.doc_link && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-text-primary border-l-2 border-purple-primary pl-3">
                Documentation
              </h2>
              <a
                href={project.doc_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary underline decoration-purple-light/70 underline-offset-4 hover:decoration-purple-secondary"
              >
                {project.doc_link}
              </a>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold mb-2 text-text-primary border-l-2 border-purple-primary pl-3">
              Participants
            </h2>
            <div className="space-y-2">
              {participants
                .filter((p) => p.status === 'Active')
                .map((participant) => (
                  <div
                    key={participant.id}
                    className="flex justify-between items-center p-3 bg-bg-tertiary rounded border border-border-primary"
                  >
                    <span className="text-text-primary">
                      {participant.user.full_name} ({participant.role})
                    </span>
                  </div>
                ))}
              {participants.filter((p) => p.status === 'Active').length === 0 && (
                <p className="text-text-muted">No active participants</p>
              )}
            </div>
          </div>

          {canApply && (
            <div className="pt-4">
              <button
                onClick={() => setShowApplicationModal(true)}
                className="px-6 py-3 bg-purple-primary text-text-primary rounded-lg hover:bg-purple-secondary transition font-bold"
              >
                Apply to Project
              </button>
              <p className="text-sm text-text-muted mt-2">
                Active slots: {activeSlots} / 3
              </p>
            </div>
          )}

          {hasApplied && (
            <div className="pt-4">
              <p className="text-text-primary font-bold underline decoration-purple-light/70 underline-offset-4">
                You have applied to this project
              </p>
            </div>
          )}

          {!user && (
            <div className="pt-4">
              <p className="text-text-secondary">
                Please sign in to apply to this project
              </p>
            </div>
          )}

          {user && profile && activeSlots >= 3 && !hasApplied && (
            <div className="pt-4">
              <p className="text-text-primary font-bold underline decoration-status-error decoration-2 underline-offset-4">
                You have reached the maximum of 3 active project slots
              </p>
            </div>
          )}
        </div>
      </div>

      {showApplicationModal && (
        <ApplicationModal
          projectId={project.id}
          onClose={() => setShowApplicationModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </>
  );
}
