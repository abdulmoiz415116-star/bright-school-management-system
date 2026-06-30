import { createClient } from "@/utils/supabase/server";
import { PromotionClient } from "./PromotionClient";

export const revalidate = 0;

export default async function StudentPromotionPage() {
  const supabase = await createClient();

  const { data: academicYears } = await supabase
    .from('academic_years')
    .select('*')
    .order('start_date', { ascending: false });

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .order('numeric_value', { ascending: true });

  const { data: sections } = await supabase
    .from('sections')
    .select('*');

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('admission_number', { ascending: true });

  const dummyStudents = [
    { id: '9901', admission_number: 'ADM-1001', roll_number: 'NUR-01', class_id: classes?.[0]?.id || '1', section_id: sections?.[0]?.id || '1' },
    { id: '9902', admission_number: 'ADM-1002', roll_number: 'KG-05', class_id: classes?.[0]?.id || '1', section_id: sections?.[0]?.id || '1' },
    { id: '9903', admission_number: 'ADM-1003', roll_number: 'G1-12', class_id: classes?.[1]?.id || '2', section_id: sections?.[0]?.id || '1' },
    { id: '9904', admission_number: 'ADM-1004', roll_number: 'G2-08', class_id: classes?.[1]?.id || '2', section_id: sections?.[0]?.id || '1' },
  ];

  const allStudents = students && students.length > 0 ? students : dummyStudents;

  return (
    <PromotionClient
      initialYears={academicYears || []}
      initialClasses={classes || []}
      initialSections={sections || []}
      initialStudents={allStudents as any}
    />
  );
}
