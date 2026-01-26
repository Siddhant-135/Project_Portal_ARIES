'use client';

import { useState } from 'react';
import { searchUsersByEmail, updateUserRole } from '@/app/actions/admin';
import { formatDate } from '@/lib/utils';
import type { Profile, Review, Project } from '@/lib/supabase/types';

interface AdminPanelProps {
  reviews: (Review & {
    student: Profile;
    mentor: Profile;
    project: Project;
  })[];
}

export default function AdminPanel({ reviews }: AdminPanelProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await searchUsersByEmail(searchEmail);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      setSearchResults([]);
    } else {
      setSearchResults(result.users || []);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: 'Student' | 'ARIES_Member' | 'Admin') => {
    setError(null);
    const result = await updateUserRole(userId, newRole);
    
    if (result.error) {
      setError(result.error);
    } else {
      // Refresh search results
      const result = await searchUsersByEmail(searchEmail);
      if (!result.error) {
        setSearchResults(result.users || []);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* User Search and Role Management */}
      <div className="bg-bg-secondary rounded-lg shadow-lg border border-border-primary p-6">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">User Management</h2>
        
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Search by email..."
              className="flex-1 px-4 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-primary text-text-primary rounded-md hover:bg-purple-secondary transition disabled:opacity-50 font-bold"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 bg-status-error/20 border border-status-error text-status-error px-4 py-3 rounded">
            {error}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-text-primary">Search Results:</h3>
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="border border-border-primary rounded-lg p-4 flex justify-between items-center bg-bg-tertiary"
              >
                <div>
                  <p className="font-bold text-text-primary">{user.full_name}</p>
                  <p className="text-sm text-text-muted">{user.email}</p>
                  <p className="text-sm text-text-muted">
                    Branch: {user.branch || 'N/A'} • Current Role:{' '}
                    <span className="font-bold text-pink-primary">{user.role}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleUpdate(
                        user.id,
                        e.target.value as 'Student' | 'ARIES_Member' | 'Admin'
                      )
                    }
                    className="px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary"
                  >
                    <option value="Student">Student</option>
                    <option value="ARIES_Member">ARIES Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Master Review Feed */}
      <div className="bg-bg-secondary rounded-lg shadow-lg border border-border-primary p-6">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Master Review Feed</h2>
        
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-border-primary rounded-lg p-4 bg-bg-tertiary"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-text-primary">
                      Review for {review.student.full_name}
                    </p>
                    <p className="text-sm text-text-muted">
                      Project: {review.project.title}
                    </p>
                    <p className="text-sm text-text-muted">
                      Mentor: {review.mentor.full_name} •{' '}
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-bg-primary rounded border border-border-secondary">
                  <p className="text-text-secondary whitespace-pre-wrap">
                    {review.review_text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted">No reviews available</p>
        )}
      </div>
    </div>
  );
}
