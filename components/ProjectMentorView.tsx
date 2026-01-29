'use client';

import { useState } from 'react';
import { acceptApplication, rejectApplication, updateParticipantStatus } from '@/app/actions/applications';
import { updateProjectStatus, reopenProject } from '@/app/actions/projects';
import { createExitReview } from '@/app/actions/reviews';
import ReviewModal from './ReviewModal';
import { formatDate } from '@/lib/utils';
import type { Project, Profile, ProjectParticipant } from '@/lib/supabase/types';
import { useRouter } from 'next/navigation';

interface ProjectMentorViewProps {
  project: Project & { creator: Profile };
  participants: (ProjectParticipant & { user: Profile })[];
  user: any;
}

export default function ProjectMentorView({
  project,
  participants,
  user,
}: ProjectMentorViewProps) {
  const [showReviewModal, setShowReviewModal] = useState<{
    studentId: string;
    studentName: string;
    action: 'drop' | 'discharge' | 'complete';
  } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Separate pending applicants from active mentees
  const pendingApplicants = participants.filter(
    (p) => p.role === 'Mentee' && p.status === 'Pending'
  );
  const activeMentees = participants.filter(
    (p) => p.role === 'Mentee' && p.status === 'Active'
  );

  const handleAccept = async (participantId: string) => {
    setLoading(participantId);
    setError(null);
    const result = await acceptApplication(participantId);
    if (result.error) {
      setError(result.error);
    }
    setLoading(null);
    router.refresh();
  };

  const handleReject = async (participantId: string) => {
    setLoading(participantId);
    setError(null);
    const result = await rejectApplication(participantId);
    if (result.error) {
      setError(result.error);
    }
    setLoading(null);
    router.refresh();
  };

  const handleLaunch = async () => {
    setLoading('launch');
    setError(null);
    const result = await updateProjectStatus(project.id, 'Launched');
    if (result.error) {
      setError(result.error);
    }
    setLoading(null);
    router.refresh();
  };

  const handleReopen = async () => {
    setLoading('reopen');
    setError(null);
    const result = await reopenProject(project.id);
    if (result.error) {
      setError(result.error);
    }
    setLoading(null);
    router.refresh();
  };

  const handleComplete = async () => {
    if (activeMentees.length > 0) {
      // Need reviews for all active mentees
      setShowReviewModal({
        studentId: activeMentees[0].user_id,
        studentName: activeMentees[0].user.full_name,
        action: 'complete',
      });
    } else {
      setLoading('complete');
      setError(null);
      const result = await updateProjectStatus(project.id, 'Completed');
      if (result.error) {
        setError(result.error);
      }
      setLoading(null);
      router.refresh();
    }
  };

  const handleTerminate = async () => {
    setLoading('terminate');
    setError(null);
    const result = await updateProjectStatus(project.id, 'Terminated');
    if (result.error) {
      setError(result.error);
    }
    setLoading(null);
    router.refresh();
  };

  const handleDrop = (participant: ProjectParticipant & { user: Profile }) => {
    setShowReviewModal({
      studentId: participant.user_id,
      studentName: participant.user.full_name,
      action: 'drop',
    });
  };

  const handleDischarge = (participant: ProjectParticipant & { user: Profile }) => {
    setShowReviewModal({
      studentId: participant.user_id,
      studentName: participant.user.full_name,
      action: 'discharge',
    });
  };

  const handleReviewSubmit = async (reviewText: string) => {
    if (!showReviewModal) return;

    if (showReviewModal.action === 'complete') {
      // Create review and complete project
      await createExitReview(project.id, showReviewModal.studentId, reviewText);
      
      // If there are more mentees, show modal for next one
      const remainingMentees = activeMentees.filter(
        (m) => m.user_id !== showReviewModal.studentId
      );
      
      if (remainingMentees.length > 0) {
        setShowReviewModal({
          studentId: remainingMentees[0].user_id,
          studentName: remainingMentees[0].user.full_name,
          action: 'complete',
        });
      } else {
        await updateProjectStatus(project.id, 'Completed');
        setShowReviewModal(null);
        router.refresh();
      }
    } else {
      const status = showReviewModal.action === 'drop' ? 'Dropped' : 'Discharged';
      await updateParticipantStatus(
        participants.find((p) => p.user_id === showReviewModal.studentId)!.id,
        status,
        reviewText
      );
      setShowReviewModal(null);
      router.refresh();
    }
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

        {error && (
          <div className="mb-4 p-3 bg-status-error/20 border border-status-error text-text-primary rounded">
            {error}
          </div>
        )}

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

          {/* Pending Applicants - Only shown when project is Open */}
          {project.status === 'Open' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-text-primary border-l-2 border-status-warning pl-3">
                Pending Applicants ({pendingApplicants.length})
              </h2>
              {pendingApplicants.length > 0 ? (
                <div className="space-y-3">
                  {pendingApplicants.map((participant) => (
                    <div
                      key={participant.id}
                      className="border border-status-warning/50 rounded-lg p-4 bg-status-warning/10"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-text-primary">{participant.user.full_name}</p>
                          <p className="text-sm text-text-muted">{participant.user.email}</p>
                          <div className="text-sm text-text-muted mt-1">
                            <p>
                              Prerequisites Met: {participant.prerequisites_met ? 'Yes' : 'No'}
                            </p>
                            {participant.prerequisites_notes && (
                              <p className="mt-1 italic">
                                Experience: {participant.prerequisites_notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAccept(participant.id)}
                            disabled={loading === participant.id || activeMentees.length >= project.max_students}
                            className="px-3 py-1 bg-status-success text-text-primary rounded hover:opacity-80 transition disabled:opacity-50 text-sm font-medium"
                          >
                            {loading === participant.id ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleReject(participant.id)}
                            disabled={loading === participant.id}
                            className="px-3 py-1 bg-status-error text-text-primary rounded hover:opacity-80 transition disabled:opacity-50 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted">No pending applicants</p>
              )}
              {pendingApplicants.length > 0 && (
                <p className="text-sm text-text-muted mt-2">
                  Note: Pending applicants will be automatically rejected when you launch the project.
                </p>
              )}
            </div>
          )}

          {/* Active Mentees */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-text-primary border-l-2 border-purple-primary pl-3">
              Active Mentees ({activeMentees.length} / {project.max_students})
            </h2>
            {activeMentees.length > 0 ? (
              <div className="space-y-3">
                {activeMentees.map((participant) => (
                  <div
                    key={participant.id}
                    className="border border-border-primary rounded-lg p-4 bg-bg-tertiary"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-text-primary">{participant.user.full_name}</p>
                        <p className="text-sm text-text-muted">{participant.user.email}</p>
                      </div>
                      {project.status === 'Launched' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDrop(participant)}
                            className="px-3 py-1 bg-status-error text-text-primary rounded hover:opacity-80 transition text-sm font-medium"
                          >
                            Drop
                          </button>
                          <button
                            onClick={() => handleDischarge(participant)}
                            className="px-3 py-1 bg-status-success text-text-primary rounded hover:opacity-80 transition text-sm font-medium"
                          >
                            Discharge
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted">No active mentees yet</p>
            )}
          </div>

          {/* Project Actions */}
          <div className="border-t border-border-primary pt-6">
            <h2 className="text-xl font-bold mb-4 text-text-primary border-l-2 border-purple-primary pl-3">
              Project Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.status === 'Open' && (
                <button
                  onClick={handleLaunch}
                  disabled={loading === 'launch' || activeMentees.length === 0}
                  className="px-4 py-2 bg-purple-primary text-text-primary rounded hover:bg-purple-secondary transition disabled:opacity-50 font-bold"
                  title={activeMentees.length === 0 ? 'Accept at least one mentee before launching' : ''}
                >
                  {loading === 'launch' ? 'Processing...' : 'Launch Project'}
                </button>
              )}
              {project.status === 'Launched' && (
                <>
                  <button
                    onClick={handleReopen}
                    disabled={loading === 'reopen'}
                    className="px-4 py-2 bg-status-info text-text-primary rounded hover:opacity-80 transition disabled:opacity-50 font-bold"
                  >
                    {loading === 'reopen' ? 'Processing...' : 'Reopen Applications'}
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={loading === 'complete'}
                    className="px-4 py-2 bg-status-success text-text-primary rounded hover:opacity-80 transition disabled:opacity-50 font-bold"
                  >
                    {loading === 'complete' ? 'Processing...' : 'Complete Project'}
                  </button>
                  <button
                    onClick={handleTerminate}
                    disabled={loading === 'terminate'}
                    className="px-4 py-2 bg-status-error text-text-primary rounded hover:opacity-80 transition disabled:opacity-50 font-bold"
                  >
                    {loading === 'terminate' ? 'Processing...' : 'Terminate Project'}
                  </button>
                </>
              )}
              {project.status === 'Open' && activeMentees.length === 0 && (
                <p className="text-text-muted text-sm self-center">
                  Accept at least one mentee before launching
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          studentName={showReviewModal.studentName}
          onSubmit={handleReviewSubmit}
          onClose={() => setShowReviewModal(null)}
        />
      )}
    </>
  );
}
