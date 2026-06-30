import { createClient } from "@/utils/supabase/server";
import { AttendanceClient } from "./AttendanceClient";

export default async function AttendancePage() {
  const supabase = await createClient();
  
  // Fetch lists for the attendance roster
  const { data: students } = await supabase.from('students').select('id, name, roll_number, class_name').order('name');
  const { data: teachers } = await supabase.from('teachers').select('id, name').order('name');
  const { data: staff } = await supabase.from('staff').select('id, name, role').order('name');

  // Fetch today's attendance records to initially populate
  const today = new Date().toISOString().split('T')[0];
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('record_date', today);

  const dummyStudents = [
    // Grade 1 (10 students)
    { id: 101, name: 'Ali Ahmed', roll_number: '101', class_name: 'Grade 1' },
    { id: 102, name: 'Sara Khan', roll_number: '102', class_name: 'Grade 1' },
    { id: 103, name: 'Hamza Tariq', roll_number: '103', class_name: 'Grade 1' },
    { id: 104, name: 'Ayesha Omer', roll_number: '104', class_name: 'Grade 1' },
    { id: 105, name: 'Zain Raza', roll_number: '105', class_name: 'Grade 1' },
    { id: 106, name: 'Hania Amir', roll_number: '106', class_name: 'Grade 1' },
    { id: 107, name: 'Bilal Ahmed', roll_number: '107', class_name: 'Grade 1' },
    { id: 108, name: 'Maryam Sajid', roll_number: '108', class_name: 'Grade 1' },
    { id: 109, name: 'Usman Ghani', roll_number: '109', class_name: 'Grade 1' },
    { id: 110, name: 'Anaya Fatima', roll_number: '110', class_name: 'Grade 1' },

    // Grade 2 (10 students)
    { id: 201, name: 'Zainab Noor', roll_number: '201', class_name: 'Grade 2' },
    { id: 202, name: 'Usman Raza', roll_number: '202', class_name: 'Grade 2' },
    { id: 203, name: 'Bilal Hassan', roll_number: '203', class_name: 'Grade 2' },
    { id: 204, name: 'Fatima Zahra', roll_number: '204', class_name: 'Grade 2' },
    { id: 205, name: 'Mustafa Ali', roll_number: '205', class_name: 'Grade 2' },
    { id: 206, name: 'Khadija Bibi', roll_number: '206', class_name: 'Grade 2' },
    { id: 207, name: 'Ibrahim Khalid', roll_number: '207', class_name: 'Grade 2' },
    { id: 208, name: 'Omer Farooq', roll_number: '208', class_name: 'Grade 2' },
    { id: 209, name: 'Sana Malik', roll_number: '209', class_name: 'Grade 2' },
    { id: 210, name: 'Haroon Rasheed', roll_number: '210', class_name: 'Grade 2' },

    // Grade 3 (10 students)
    { id: 301, name: 'Syed Hassan Shah', roll_number: '301', class_name: 'Grade 3' },
    { id: 302, name: 'Zainab Binte Bilal', roll_number: '302', class_name: 'Grade 3' },
    { id: 303, name: 'Abdullah Haroon', roll_number: '303', class_name: 'Grade 3' },
    { id: 304, name: 'Anaya Usman', roll_number: '304', class_name: 'Grade 3' },
    { id: 305, name: 'Raza Muhammad', roll_number: '305', class_name: 'Grade 3' },
    { id: 306, name: 'Hira Noor', roll_number: '306', class_name: 'Grade 3' },
    { id: 307, name: 'Tariq Mahmood', roll_number: '307', class_name: 'Grade 3' },
    { id: 308, name: 'Ayesha Saddiqa', roll_number: '308', class_name: 'Grade 3' },
    { id: 309, name: 'Kamran Ali', roll_number: '309', class_name: 'Grade 3' },
    { id: 310, name: 'Noman Riaz', roll_number: '310', class_name: 'Grade 3' },

    // Grade 4 (10 students)
    { id: 401, name: 'Muhammad Rayyan', roll_number: '401', class_name: 'Grade 4' },
    { id: 402, name: 'Syeda Hania', roll_number: '402', class_name: 'Grade 4' },
    { id: 403, name: 'Bashir Ahmed', roll_number: '403', class_name: 'Grade 4' },
    { id: 404, name: 'Javed Iqbal', roll_number: '404', class_name: 'Grade 4' },
    { id: 405, name: 'Shamim Akhtar', roll_number: '405', class_name: 'Grade 4' },
    { id: 406, name: 'Naveed Hussain', roll_number: '406', class_name: 'Grade 4' },
    { id: 407, name: 'Asad Ullah', roll_number: '407', class_name: 'Grade 4' },
    { id: 408, name: 'Bisma Khan', roll_number: '408', class_name: 'Grade 4' },
    { id: 409, name: 'Daniya Syed', roll_number: '409', class_name: 'Grade 4' },
    { id: 410, name: 'Ehsan Ali', roll_number: '410', class_name: 'Grade 4' },

    // Playgroup, KG 1, KG 2 (10 students total)
    { id: 501, name: 'Zohaib Khan', roll_number: 'PG-01', class_name: 'Playgroup' },
    { id: 502, name: 'Ayesha Omer', roll_number: 'PG-02', class_name: 'Playgroup' },
    { id: 503, name: 'Faris Ahmed', roll_number: 'PG-03', class_name: 'Playgroup' },
    { id: 504, name: 'Ghazala Bibi', roll_number: 'PG-04', class_name: 'Playgroup' },
    { id: 505, name: 'Haider Raza', roll_number: 'KG1-01', class_name: 'KG 1' },
    { id: 506, name: 'Inaya Tariq', roll_number: 'KG1-02', class_name: 'KG 1' },
    { id: 507, name: 'Luqman Hakim', roll_number: 'KG1-03', class_name: 'KG 1' },
    { id: 508, name: 'Manha Omer', roll_number: 'KG2-01', class_name: 'KG 2' },
    { id: 509, name: 'Nabeel Ahmed', roll_number: 'KG2-02', class_name: 'KG 2' },
    { id: 510, name: 'Orhan Malik', roll_number: 'KG2-03', class_name: 'KG 2' }
  ];

  const dummyTeachers = [
    { id: 101, name: 'Ahmed Raza' },
    { id: 102, name: 'Ayesha Bibi' },
    { id: 103, name: 'Kamran Ali' },
    { id: 104, name: 'Sana Fatima' },
    { id: 105, name: 'Noman Riaz' }
  ];

  const dummyStaff = [
    { id: 201, name: 'Javed Iqbal', role: 'Security' },
    { id: 202, name: 'Tariq Mehmood', role: 'Janitor' },
    { id: 203, name: 'Bashir Ahmed', role: 'Driver' },
    { id: 204, name: 'Shamim Akhtar', role: 'Peon' },
    { id: 205, name: 'Naveed Hussain', role: 'Clerk' }
  ];

  const dummyAttendance = [
    { id: 1, record_date: today, person_type: 'student', person_id: 1, person_name: 'Ali Ahmed', status: 'present' },
    { id: 2, record_date: today, person_type: 'student', person_id: 2, person_name: 'Sara Khan', status: 'absent' },
    { id: 3, record_date: today, person_type: 'teacher', person_id: 101, person_name: 'Ahmed Raza', status: 'present' },
    { id: 4, record_date: today, person_type: 'staff', person_id: 201, person_name: 'Javed Iqbal', status: 'leave' },
    { id: 5, record_date: today, person_type: 'student', person_id: 3, person_name: 'Zainab Noor', status: 'present' },
    { id: 6, record_date: today, person_type: 'student', person_id: 4, person_name: 'Usman Tariq', status: 'present' },
    { id: 7, record_date: today, person_type: 'student', person_id: 5, person_name: 'Zain Raza', status: 'absent' },
    { id: 8, record_date: today, person_type: 'student', person_id: 6, person_name: 'Hania Amir', status: 'leave' },
    { id: 9, record_date: today, person_type: 'student', person_id: 7, person_name: 'Bilal Ahmed', status: 'present' },
    { id: 10, record_date: today, person_type: 'student', person_id: 8, person_name: 'Maryam Sajid', status: 'present' }
  ];

  return (
    <AttendanceClient 
      students={students?.length ? students : dummyStudents} 
      teachers={teachers?.length ? teachers : dummyTeachers} 
      staff={staff?.length ? staff : dummyStaff} 
      initialRecords={attendance?.length ? attendance : dummyAttendance as any} 
    />
  );
}
