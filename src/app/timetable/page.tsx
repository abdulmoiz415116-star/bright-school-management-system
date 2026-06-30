import { createClient } from "@/utils/supabase/server";
import { TimetableClient } from "./TimetableClient";

export default async function TimetablePage() {
  const supabase = await createClient();
  
  // Fetch classes and sections
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .order('numeric_value', { ascending: true });

  const { data: sections } = await supabase
    .from('sections')
    .select('id, name, class_id')
    .order('name', { ascending: true });

  // Fetch subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name', { ascending: true });

  // Fetch teachers
  const { data: teachers } = await supabase
    .from('employees')
    .select('id, profiles(full_name)')
    .order('joining_date', { ascending: true });

  // Fetch all timetable periods (simplified for this UI)
  const { data: periods } = await supabase
    .from('timetable_periods')
    .select(`
      id,
      day,
      start_time,
      end_time,
      room_number,
      timetables(section_id),
      subjects(name),
      employees(profiles(full_name))
    `);

  const classNames = [
    'Playgroup', 'Junior', 'Senior', 
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ];
  
  const dummyClasses = classNames.map((name, i) => ({ id: `c${i}`, name }));
  
  const dummySections: any[] = [];
  dummyClasses.forEach(c => {
    dummySections.push({ id: `s_${c.id}_A`, name: 'A', class_id: c.id });
    if (c.name === 'Class 10') {
      dummySections.push({ id: `s_${c.id}_B`, name: 'B', class_id: c.id });
    }
  });

  const dummySubjects = [
    { id: 'sub1', name: 'Mathematics' }, { id: 'sub2', name: 'Physics' }, 
    { id: 'sub3', name: 'Chemistry' }, { id: 'sub4', name: 'English' }, 
    { id: 'sub5', name: 'Urdu' }, { id: 'sub6', name: 'Biology' }, 
    { id: 'sub7', name: 'Islamiat' }
  ];

  const dummyTeachers = [
    { id: 't1', profiles: { full_name: 'Ali Raza' } },
    { id: 't2', profiles: { full_name: 'Ayesha Khan' } },
    { id: 't3', profiles: { full_name: 'Usman Tariq' } },
    { id: 't4', profiles: { full_name: 'Fatima Noor' } }
  ];
  
  const dummyPeriods: any[] = [];
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const TIME_SLOTS = [
    { start: "08:00:00", end: "08:45:00" }, { start: "08:45:00", end: "09:30:00" },
    { start: "09:30:00", end: "10:15:00" }, { start: "11:15:00", end: "12:00:00" },
    { start: "12:00:00", end: "12:45:00" }
  ];

  let pId = 1;
  dummySections.forEach((section, sIdx) => {
    DAYS.forEach((day, dIdx) => {
      TIME_SLOTS.forEach((slot, tIdx) => {
        // Pseudo-random distribution for subjects and teachers based on indices
        const subject = dummySubjects[(sIdx + dIdx + tIdx) % dummySubjects.length];
        const teacher = dummyTeachers[(sIdx + dIdx + tIdx) % dummyTeachers.length];
        
        dummyPeriods.push({
          id: `p${pId++}`,
          day: day,
          start_time: slot.start,
          end_time: slot.end,
          room_number: `Room ${101 + (sIdx % 10)}`,
          timetables: { section_id: section.id },
          subjects: { name: subject.name },
          employees: { profiles: { full_name: teacher.profiles.full_name } }
        });
      });
    });
  });

  return (
    <TimetableClient 
      classes={classes?.length ? classes : dummyClasses} 
      sections={sections?.length ? sections : dummySections} 
      subjects={subjects?.length ? subjects : dummySubjects} 
      teachers={teachers?.length ? teachers : dummyTeachers}
      initialPeriods={periods?.length ? periods : dummyPeriods}
    />
  );
}
