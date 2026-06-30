import { createClient } from '@/utils/supabase/server';
import { ResultsClient } from './ResultsClient';

export const revalidate = 0;

export default async function ResultsPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  return <ResultsClient students={students || []} />;
}
