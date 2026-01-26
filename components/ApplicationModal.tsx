'use client';

import { useState } from 'react';
import { applyToProject } from '@/app/actions/applications';
import { countWords } from '@/lib/utils';

interface ApplicationModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationModal({
  projectId,
  onClose,
  onSuccess,
}: ApplicationModalProps) {
  const [prerequisitesMet, setPrerequisitesMet] = useState<boolean>(false);
  const [prerequisitesNotes, setPrerequisitesNotes] = useState<string>('');
  const [consentToShare, setConsentToShare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notesWordCount = countWords(prerequisitesNotes);
  const maxNotesWords = 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Must check prerequisites met checkbox to apply
    if (!prerequisitesMet) {
      setError('Prerequisites not met, cannot apply');
      return;
    }

    // If prerequisites met but notes empty, auto-fill with "N/A"
    const finalNotes = prerequisitesNotes.trim() || 'N/A';

    if (notesWordCount > maxNotesWords) {
      setError(`Related experience must be ${maxNotesWords} words or less`);
      return;
    }

    if (!consentToShare) {
      setError('Consent to share profile is required');
      return;
    }

    setLoading(true);
    const result = await applyToProject(
      projectId,
      prerequisitesMet,
      finalNotes,
      consentToShare
    );

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-secondary rounded-lg p-6 max-w-md w-full mx-4 ai-border ai-glow shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Apply to Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Prerequisites Met
            </label>
            <div className="space-y-3">
              <label className="flex items-center text-text-secondary">
                <input
                  type="checkbox"
                  checked={prerequisitesMet}
                  onChange={(e) => setPrerequisitesMet(e.target.checked)}
                  className="mr-2 accent-purple-primary"
                />
                <span>I have met the prerequisites for this project</span>
              </label>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-1">
                  Mention related experience (N/A if none) (max {maxNotesWords} words)
                  {prerequisitesMet && <span className="text-text-muted text-xs ml-1">(optional, auto-fills N/A if empty)</span>}
                </label>
                <textarea
                  value={prerequisitesNotes}
                  onChange={(e) => setPrerequisitesNotes(e.target.value)}
                  disabled={!prerequisitesMet}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary disabled:opacity-50 disabled:cursor-not-allowed ai-border"
                  placeholder={prerequisitesMet ? "Enter your related experience or leave empty for N/A..." : "Check prerequisites met to enable this field"}
                />
                <p className={`text-sm mt-1 font-bold ${notesWordCount > maxNotesWords ? 'text-status-error' : 'text-text-muted'}`}>
                  {notesWordCount} / {maxNotesWords} words
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center text-text-secondary">
                <input
                type="checkbox"
                checked={consentToShare}
                onChange={(e) => setConsentToShare(e.target.checked)}
                className="mr-2 accent-purple-primary"
              />
              <span className="text-sm">
                I consent to share my profile with the mentor *
              </span>
            </label>
          </div>

          {error && (
            <div className="bg-status-error/20 border border-status-error text-status-error px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-bg-tertiary hover:bg-purple-dark text-text-primary rounded transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !prerequisitesMet || notesWordCount > maxNotesWords || !consentToShare}
              className="px-4 py-2 bg-purple-primary text-text-primary hover:bg-purple-secondary rounded transition disabled:opacity-50 font-medium"
            >
              {loading ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
