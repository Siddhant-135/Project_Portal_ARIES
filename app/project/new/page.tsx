import { createClientServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewProjectForm from '@/components/NewProjectForm';
import { canCreateProjects } from '@/lib/utils';

export default async function NewProjectPage() {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/project/new');
  }
  const username = user.email?.split('@')[0];
  if (!username) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('username', username)
    .single();

  if (!profile || !canCreateProjects(profile.role)) {
    redirect('/');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <NewProjectForm />
    </div>
  );
}
