'use client';

import { useState } from 'react';
import { countWords } from '@/lib/utils';

interface ReviewModalProps {
  studentName: string;
  onSubmit: (reviewText: string) => Promise<void>;
  onClose: () => void;
}

export default function ReviewModal({
  studentName,
  onSubmit,
  onClose,
}: ReviewModalProps) {
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wordCount = countWords(reviewText);
  const maxWords = 30;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (wordCount === 0) {
      setError('Review text is required');
      return;
    }

    if (wordCount > maxWords) {
      setError(`Review must be ${maxWords} words or less`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(reviewText);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-bg-secondary rounded-lg border border-border-primary p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          Exit Review for {studentName}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Review Text (max {maxWords} words) *
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary"
              placeholder="Write your review here..."
            />
            <div className="mt-2 flex justify-between text-sm">
              <span className={wordCount > maxWords ? 'text-status-error font-bold' : 'text-text-muted'}>
                {wordCount} / {maxWords} words
              </span>
            </div>
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
              disabled={loading || wordCount === 0 || wordCount > maxWords}
              className="px-4 py-2 bg-purple-primary text-text-primary hover:bg-purple-secondary rounded transition disabled:opacity-50 font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
