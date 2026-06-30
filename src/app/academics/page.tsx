import { createClient } from "@/utils/supabase/server";
import { AcademicsClient } from "./AcademicsClient";

export default async function AcademicsPage() {
  const supabase = await createClient();
  
  const { data: academicYears } = await supabase
    .from('academic_years')
    .select('*')
    .order('start_date', { ascending: false });

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .order('numeric_value', { ascending: true });

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('name', { ascending: true });

  const dummyYears = [
    { id: '1', title: '2021-2022', start_date: '2021-04-01', end_date: '2022-03-31', is_active: false },
    { id: '2', title: '2022-2023', start_date: '2022-04-01', end_date: '2023-03-31', is_active: false },
    { id: '3', title: '2023-2024', start_date: '2023-04-01', end_date: '2024-03-31', is_active: false },
    { id: '4', title: '2024-2025', start_date: '2024-04-01', end_date: '2025-03-31', is_active: false },
    { id: '5', title: '2025-2026', start_date: '2025-04-01', end_date: '2026-03-31', is_active: true }
  ];

  const dummyClasses = [
    { id: '1', name: 'Playgroup', numeric_value: -2 },
    { id: '2', name: 'Junior', numeric_value: -1 },
    { id: '3', name: 'Senior', numeric_value: 0 },
    { id: '4', name: 'Class 1', numeric_value: 1 },
    { id: '5', name: 'Class 2', numeric_value: 2 },
    { id: '6', name: 'Class 3', numeric_value: 3 },
    { id: '7', name: 'Class 4', numeric_value: 4 },
    { id: '8', name: 'Class 5', numeric_value: 5 },
    { id: '9', name: 'Class 6', numeric_value: 6 },
    { id: '10', name: 'Class 7', numeric_value: 7 },
    { id: '11', name: 'Class 8', numeric_value: 8 },
    { id: '12', name: 'Class 9', numeric_value: 9 },
    { id: '13', name: 'Class 10', numeric_value: 10 }
  ];

  const dummySubjects = [
    { id: '1', code: 'URD101', name: 'Urdu', type: 'theory' },
    { id: '2', code: 'ENG101', name: 'English', type: 'theory' },
    { id: '3', code: 'MAT101', name: 'Math', type: 'theory' },
    { id: '4', code: 'SCI101', name: 'Science', type: 'theory' },
    { id: '5', code: 'PHY101', name: 'Physics', type: 'theory' },
    { id: '6', code: 'CHM101', name: 'Chemistry', type: 'theory' },
    { id: '7', code: 'BIO101', name: 'Biology', type: 'theory' },
    { id: '8', code: 'ISL101', name: 'Islamiat', type: 'theory' },
    { id: '9', code: 'NZR101', name: 'Nazra', type: 'theory' }
  ];

  return <AcademicsClient 
    initialYears={academicYears?.length ? academicYears : dummyYears} 
    initialClasses={classes?.length ? classes : dummyClasses}
    initialSubjects={subjects?.length ? subjects : dummySubjects}
  />;
}
