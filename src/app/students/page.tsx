import { createClient } from '@/utils/supabase/server';
import { StudentsClient } from './StudentsClient';

export const revalidate = 0;

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  const dummyStudents = [
    { id: 9901, name: 'Muhammad Ali Raza', admission_number: 'ADM-1001', roll_number: 'NUR-01', father_name: 'Tariq Mahmood', dob: '2019-05-15', gender: 'Male', blood_group: 'B+', address: 'Gulberg 3, Lahore', mobile_number: '0300-1234567', created_at: new Date().toISOString() },
    { id: 9902, name: 'Syeda Fatima Zahra', admission_number: 'ADM-1002', roll_number: 'KG-05', father_name: 'Syed Hassan Shah', dob: '2018-08-20', gender: 'Female', blood_group: 'O+', address: 'DHA Phase 5, Lahore', mobile_number: '0321-9876543', created_at: new Date().toISOString() },
    { id: 9903, name: 'Zainab Binte Bilal', admission_number: 'ADM-1003', roll_number: 'G1-12', father_name: 'Bilal Ahmad', dob: '2017-12-10', gender: 'Female', blood_group: 'A+', address: 'Johar Town, Lahore', mobile_number: '0301-5554433', created_at: new Date().toISOString() },
    { id: 9904, name: 'Hamza Tariq', admission_number: 'ADM-1004', roll_number: 'G2-08', father_name: 'Tariq Mahmood', dob: '2016-03-25', gender: 'Male', blood_group: 'AB+', address: 'Model Town, Lahore', mobile_number: '0333-1122334', created_at: new Date().toISOString() },
    { id: 9905, name: 'Ayesha Omer', admission_number: 'ADM-1005', roll_number: 'G3-15', father_name: 'Omer Farooq', dob: '2015-11-05', gender: 'Female', blood_group: 'O-', address: 'Faisal Town, Lahore', mobile_number: '0302-9988776', created_at: new Date().toISOString() },
    { id: 9906, name: 'Ibrahim Khalid', admission_number: 'ADM-1006', roll_number: 'G4-02', father_name: 'Khalid Pervez', dob: '2014-07-12', gender: 'Male', blood_group: 'B-', address: 'Cantt, Lahore', mobile_number: '0305-4433221', created_at: new Date().toISOString() },
    { id: 9907, name: 'Maryam Sajid', admission_number: 'ADM-1007', roll_number: 'G5-19', father_name: 'Sajid Ali', dob: '2013-02-18', gender: 'Female', blood_group: 'A-', address: 'Garden Town, Lahore', mobile_number: '0312-7766554', created_at: new Date().toISOString() },
    { id: 9908, name: 'Bilal Usman', admission_number: 'ADM-1008', roll_number: 'G6-11', father_name: 'Muhammad Usman', dob: '2012-09-30', gender: 'Male', blood_group: 'O+', address: 'Askari 10, Lahore', mobile_number: '0345-8899001', created_at: new Date().toISOString() },
    { id: 9909, name: 'Anaya Usman', admission_number: 'ADM-1009', roll_number: 'G7-04', father_name: 'Usman Ghani', dob: '2011-04-14', gender: 'Female', blood_group: 'AB-', address: 'Wapda Town, Lahore', mobile_number: '0323-3344556', created_at: new Date().toISOString() },
    { id: 9910, name: 'Abdullah Haroon', admission_number: 'ADM-1010', roll_number: 'G8-20', father_name: 'Haroon Rasheed', dob: '2010-01-22', gender: 'Male', blood_group: 'A+', address: 'Valencia Town, Lahore', mobile_number: '0306-6677889', created_at: new Date().toISOString() }
  ];

  const allStudents = [...(dummyStudents), ...(students || [])];

  return <StudentsClient initialStudents={allStudents as any} />;
}
