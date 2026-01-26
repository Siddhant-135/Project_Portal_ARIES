'use client';

import { useState } from 'react';
import { acceptApplication, rejectApplication, updateParticipantStatus } from '@/app/actions/applications';
import { updateProjectStatus, deleteProject } from '@/app/actions/projects';
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
  const router = useRouter();

  const activeMentees = participants.filter(
    (p) => p.role === 'Mentee' && p.status === 'Active'
  );
  const applicants = participants.filter(
    (p) => p.role === 'Mentee' && p.status === 'Active'
  );

  const handleAccept = async (participantId: string) => {
    setLoading(participantId);
    await acceptApplication(participantId);
    setLoading(null);
    router.refresh();
  };

  const handleReject = async (participantId: string) => {
    setLoading(participantId);
    await rejectApplication(participantId);
    setLoading(null);
    router.refresh();
  };

  const handleLaunch = async () => {
    setLoading('launch');
    await updateProjectStatus(project.id, 'Launched');
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
      await updateProjectStatus(project.id, 'Completed');
      setLoading(null);
      router.refresh();
    }
  };

  const handleTerminate = async () => {
    setLoading('terminate');
    await updateProjectStatus(project.id, 'Terminated');
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
      <div className="bg-bg-secondary rounded-lg shadow-lg border border-border-primary p-6">
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
            <h2 className="text-xl font-bold mb-2 text-pink-primary">Description</h2>
            <p className="text-text-secondary whitespace-pre-wrap">{project.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2 text-pink-primary">Prerequisites</h2>
            <p className="text-text-secondary whitespace-pre-wrap">{project.prerequisites}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2 text-pink-primary">Learning Objectives</h2>
            <p className="text-text-secondary whitespace-pre-wrap">
              {project.learning_objectives}
            </p>
          </div>

          {project.codebase_link && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-pink-primary">Codebase</h2>
              <a
                href={project.codebase_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-light hover:text-text-primary hover:underline"
              >
                {project.codebase_link}
              </a>
            </div>
          )}

          {project.doc_link && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-pink-primary">Documentation</h2>
              <a
                href={project.doc_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-light hover:text-text-primary hover:underline"
              >
                {project.doc_link}
              </a>
            </div>
          )}

          {/* Applicants/Active Mentees */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-pink-primary">
              Applicants & Active Mentees ({activeMentees.length} / {project.max_students})
            </h2>
            <div className="space-y-3">
              {applicants.map((participant) => (
                <div
                  key={participant.id}
                  className="border border-border-primary rounded-lg p-4 bg-bg-tertiary"
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
                            Notes: {participant.prerequisites_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {project.status === 'Open' && (
                        <>
                          <button
                            onClick={() => handleAccept(participant.id)}
                            disabled={loading === participant.id}
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
                        </>
                      )}
                      {project.status === 'Launched' && (
                        <>
                          <button
                            onClick={() => handleDrop(participant)}
                            className="px-3 py-1 bg-status-warning text-text-primary rounded hover:opacity-80 transition text-sm font-medium"
                          >
                            Drop
                          </button>
                          <button
                            onClick={() => handleDischarge(participant)}
                            className="px-3 py-1 bg-pink-secondary text-text-primary rounded hover:bg-pink-primary transition text-sm font-medium"
                          >
                            Discharge
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {applicants.length === 0 && (
                <p className="text-text-muted">No applicants or active mentees</p>
              )}
            </div>
          </div>

          {/* Project Actions */}
          <div className="border-t border-border-primary pt-6">
            <h2 className="text-xl font-bold mb-4 text-pink-primary">Project Actions</h2>
            <div className="flex flex-wrap gap-3">
              {project.status === 'Open' && (
                <button
                  onClick={handleLaunch}
                  disabled={loading === 'launch'}
                  className="px-4 py-2 bg-purple-primary text-text-primary rounded hover:bg-purple-secondary transition disabled:opacity-50 font-bold"
                >
                  {loading === 'launch' ? 'Processing...' : 'Launch Project'}
                </button>
              )}
              {project.status === 'Launched' && (
                <>
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
