import { createClient } from "@/utils/supabase/server";
import { ResultsClient } from "./ResultsClient";

export default async function ResultsPage() {
  const supabase = await createClient();
  
  // Fetch classes
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .order('numeric_value', { ascending: true });

  // Fetch exams
  const { data: exams } = await supabase
    .from('exams')
    .select('id, name, term')
    .order('created_at', { ascending: false });

  // Fetch students
  const { data: students } = await supabase
    .from('students')
    .select(`
      id,
      roll_number,
      class_id,
      profiles(full_name)
    `)
    .order('roll_number', { ascending: true });

  // Fetch all marks. In a production app, this would be filtered by query params or loaded on demand.
  const { data: marks } = await supabase
    .from('exam_marks')
    .select(`
      id,
      marks_obtained,
      is_absent,
      student_id,
      exam_schedules (
        exam_id,
        max_marks,
        subjects (name)
      )
    `);

  return (
    <ResultsClient 
      classes={classes || []} 
      exams={exams || []} 
      students={students || []} 
      marksData={marks || []}
    />
  );
}
