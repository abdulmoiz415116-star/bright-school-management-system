import { createClient } from '@/utils/supabase/server';
import { PortalClient } from './PortalClient';

export const revalidate = 0;

export default async function ParentPortalPage() {
  const supabase = await createClient();

  // For the sake of the portal demo, we will fetch the first student's data.
  // In a real scenario, this would be filtered by the logged-in parent's linked student ID via auth.user().

  const { data: student } = await supabase
    .from('students')
    .select('id, admission_number, class_id, classes(name)')
    .limit(1)
    .single();

  const studentId = student?.id;

  // Fetch Attendance
  const { data: attendance } = await supabase
    .from('student_attendance')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
    .limit(10);

  // Fetch Fees
  const { data: fees } = await supabase
    .from('fee_challans')
    .select('*, fee_challan_details(fee_types(name), amount)')
    .eq('student_id', studentId)
    .order('due_date', { ascending: false });

  // Fetch Exams
  const { data: exams } = await supabase
    .from('exam_marks')
    .select('*, exam_schedules(exam_date, max_marks, exams(name), subjects(name))')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  return (
    <PortalClient 
      studentInfo={student}
      attendance={attendance || []}
      fees={fees || []}
      exams={exams || []}
    />
  );
}
