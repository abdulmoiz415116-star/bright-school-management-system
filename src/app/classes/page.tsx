import { createClient } from '@/utils/supabase/server';
import { ClassesClient } from './ClassesClient';

export const revalidate = 0;

export default async function ClassesPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('roll_number', { ascending: true });

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .order('numeric_value', { ascending: true });

  return <ClassesClient initialStudents={students || []} initialClasses={classes || []} />;
}
