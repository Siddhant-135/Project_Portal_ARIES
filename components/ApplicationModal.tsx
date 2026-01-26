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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consentToShare) {
      setError('Consent to share profile is required');
      return;
    }

    setLoading(true);
    const result = await applyToProject(
      projectId,
      prerequisitesMet,
      prerequisitesNotes,
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-bg-secondary rounded-lg border border-border-primary p-6 max-w-md w-full mx-4 shadow-xl">
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
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={prerequisitesNotes}
                  onChange={(e) => setPrerequisitesNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary"
                  placeholder="Any additional information about prerequisites..."
                />
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
              disabled={loading}
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
