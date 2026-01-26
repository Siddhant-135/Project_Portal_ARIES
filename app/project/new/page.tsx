import { createClientServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewProjectForm from '@/components/NewProjectForm';

export default async function NewProjectPage() {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ARIES_Member', 'Admin'].includes(profile.role)) {
    redirect('/');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <NewProjectForm />
    </div>
  );
}
