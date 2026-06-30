import { createClient } from "@/utils/supabase/server";
import { MarksClient } from "./MarksClient";

export default async function MarksPage() {
  const supabase = await createClient();
  
  // Fetch exam schedules with related details
  const { data: schedules } = await supabase
    .from('exam_schedules')
    .select(`
      id,
      exam_date,
      max_marks,
      exams(name),
      classes(id, name),
      subjects(name)
    `)
    .order('exam_date', { ascending: false });

  // Pre-fetch all students (in a real app, this might be filtered client-side or paginated)
  const { data: students } = await supabase
    .from('students')
    .select(`
      id,
      roll_number,
      class_id,
      profiles(full_name)
    `)
    .order('roll_number', { ascending: true });

  return (
    <MarksClient 
      schedules={schedules || []} 
      allStudents={students || []} 
    />
  );
}
