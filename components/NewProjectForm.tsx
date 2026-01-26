'use client';

import { useState } from 'react';
import { createProject } from '@/app/actions/projects';
import { countWords } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function NewProjectForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prerequisites: '',
    learning_objectives: '',
    max_students: '1',
    codebase_link: '',
    doc_link: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const descWords = countWords(formData.description);
  const prereqWords = countWords(formData.prerequisites);
  const objWords = countWords(formData.learning_objectives);
  const maxWords = 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (descWords > maxWords) {
      setError(`Description must be ${maxWords} words or less`);
      return;
    }
    if (prereqWords > maxWords) {
      setError(`Prerequisites must be ${maxWords} words or less`);
      return;
    }
    if (objWords > maxWords) {
      setError(`Learning objectives must be ${maxWords} words or less`);
      return;
    }

    setLoading(true);
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });

    const result = await createProject(formDataObj);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push(`/project/${result.project?.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-bg-secondary rounded-lg p-6 space-y-6 ai-border ai-glow">
      <div>
        <label className="block text-sm font-bold text-text-primary mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary ai-border"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-text-primary mb-2">
          Description (max {maxWords} words) *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={6}
          className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary ai-border"
        />
        <p className={`text-sm mt-1 font-bold ${descWords > maxWords ? 'text-status-error' : 'text-text-muted'}`}>
          {descWords} / {maxWords} words
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-text-primary mb-2">
          Prerequisites (max {maxWords} words) *
        </label>
        <textarea
          value={formData.prerequisites}
          onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
          required
          rows={6}
          className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary ai-border"
        />
        <p className={`text-sm mt-1 font-bold ${prereqWords > maxWords ? 'text-status-error' : 'text-text-muted'}`}>
          {prereqWords} / {maxWords} words
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-text-primary mb-2">
          Learning Objectives (max {maxWords} words) *
        </label>
        <textarea
          value={formData.learning_objectives}
          onChange={(e) =>
            setFormData({ ...formData, learning_objectives: e.target.value })
          }
          required
          rows={6}
          className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary ai-border"
        />
        <p className={`text-sm mt-1 font-bold ${objWords > maxWords ? 'text-status-error' : 'text-text-muted'}`}>
          {objWords} / {maxWords} words
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-text-primary mb-2">
          Max Students *
        </label>
        <input
          type="number"
          value={formData.max_students}
          onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
          required
          min="1"
          className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary ai-border"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-text-primary mb-2">
          Codebase Link (optional)
        </label>
        <input
          type="url"
          value={formData.codebase_link}
          onChange={(e) => setFormData({ ...formData, codebase_link: e.target.value })}
          className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary ai-border"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-text-primary mb-2">
          Documentation Link (optional)
        </label>
        <input
          type="url"
          value={formData.doc_link}
          onChange={(e) => setFormData({ ...formData, doc_link: e.target.value })}
          className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-primary"
        />
      </div>

      {error && (
        <div className="bg-status-error/20 border border-status-error text-status-error px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-bg-tertiary hover:bg-purple-dark text-text-primary rounded transition font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-purple-primary text-text-primary hover:bg-purple-secondary rounded transition disabled:opacity-50 font-bold"
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
