import { createClient } from "@/utils/supabase/server";
import { ExamsClient } from "./ExamsClient";

export default async function ExamsPage() {
  const supabase = await createClient();
  
  // Fetch exams with academic year title
  const { data: exams } = await supabase
    .from('exams')
    .select('*, academic_years(title)')
    .order('created_at', { ascending: false });

  // Fetch academic years for the dropdown
  const { data: academicYears } = await supabase
    .from('academic_years')
    .select('id, title, is_active')
    .order('start_date', { ascending: false });

  const dummyAcademicYears = [
    { id: 'y1', title: '2025-2026', is_active: true },
    { id: 'y2', title: '2024-2025', is_active: false }
  ];

  const dummyExams = [
    { id: '1', name: 'First Term Exams 2025', term: 'first_term', start_date: '2025-05-10', end_date: '2025-05-20', academic_year_id: 'y1', academic_years: { title: '2025-2026' } },
    { id: '2', name: 'Mid Term Exams 2025', term: 'mid_term', start_date: '2025-10-15', end_date: '2025-10-25', academic_year_id: 'y1', academic_years: { title: '2025-2026' } },
    { id: '3', name: 'Annual Exams 2026', term: 'final_term', start_date: '2026-03-01', end_date: '2026-03-15', academic_year_id: 'y1', academic_years: { title: '2025-2026' } },
    { id: '4', name: 'First Term Exams 2024', term: 'first_term', start_date: '2024-05-10', end_date: '2024-05-20', academic_year_id: 'y2', academic_years: { title: '2024-2025' } },
    { id: '5', name: 'Annual Exams 2025', term: 'final_term', start_date: '2025-03-01', end_date: '2025-03-15', academic_year_id: 'y2', academic_years: { title: '2024-2025' } }
  ] as any;

  return <ExamsClient initialExams={exams?.length ? exams : dummyExams} academicYears={academicYears?.length ? academicYears : dummyAcademicYears} />;
}
