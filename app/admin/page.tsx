import { createClientServer } from '@/lib/supabase/server';
import AdminPanel from '@/components/AdminPanel';

export default async function AdminPage() {
  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-status-error font-bold">Not authenticated</p>
      </div>
    );
  }

  // Get reviews (only admins can see this)
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, student:profiles!reviews_student_id_fkey(*), mentor:profiles!reviews_mentor_id_fkey(*), project:projects(*)')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-text-primary">Admin Panel</h1>
      <AdminPanel reviews={reviews || []} />
    </div>
  );
}
