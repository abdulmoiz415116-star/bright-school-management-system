import { createClient } from "@/utils/supabase/server";
import { TeachersClient } from "./TeachersClient";

export default async function TeachersPage() {
  const supabase = await createClient();
  
  const { data: teachers } = await supabase
    .from('teachers')
    .select('*')
    .order('created_at', { ascending: false });

  const dummyTeachers = [
    { id: 8801, name: "Prof. Tariq Mahmood", subject: "Mathematics & Physics", designation: "Senior HOD Science", phone_number: "0300-9876543", email: "tariq@brightschool.edu.pk", qualification: "M.Sc Mathematics", salary: "75000", created_at: new Date().toISOString() },
    { id: 8802, name: "Mrs. Ayesha Saddiqa", subject: "English Literature", designation: "Headmistress Montessori", phone_number: "0321-4567890", email: "ayesha@brightschool.edu.pk", qualification: "M.A English, B.Ed", salary: "65000", created_at: new Date().toISOString() },
    { id: 8803, name: "Miss Sana Malik", subject: "Computer Science & Robotics", designation: "IT Coordinator", phone_number: "0301-1122334", email: "sana@brightschool.edu.pk", qualification: "BS Computer Science", salary: "60000", created_at: new Date().toISOString() },
    { id: 8804, name: "Sir Hamza Ali", subject: "General Science & Biology", designation: "Senior Science Teacher", phone_number: "0333-4455667", email: "hamza@brightschool.edu.pk", qualification: "M.Sc Biology", salary: "58000", created_at: new Date().toISOString() },
    { id: 8805, name: "Miss Hira Khan", subject: "Urdu Language & Arts", designation: "Language Instructor", phone_number: "0302-9988776", email: "hira@brightschool.edu.pk", qualification: "M.A Urdu", salary: "52000", created_at: new Date().toISOString() },
    { id: 8806, name: "Sir Bilal Ahmed", subject: "Islamiat & Religious Studies", designation: "Islamic Studies Scholar", phone_number: "0345-1234567", email: "bilal@brightschool.edu.pk", qualification: "M.A Islamic Studies", salary: "50000", created_at: new Date().toISOString() },
    { id: 8807, name: "Miss Zainab Malik", subject: "Social Studies & Geography", designation: "Junior Wing Incharge", phone_number: "0312-3344556", email: "zainab@brightschool.edu.pk", qualification: "M.Sc Geography", salary: "55000", created_at: new Date().toISOString() },
    { id: 8808, name: "Sir Usman Ghani", subject: "Chemistry & Lab Practicals", designation: "Lab Incharge", phone_number: "0323-7788990", email: "usman@brightschool.edu.pk", qualification: "M.Sc Chemistry", salary: "58000", created_at: new Date().toISOString() },
    { id: 8809, name: "Miss Mariam Noor", subject: "Arts, Craft & Montessori", designation: "Montessori Teacher", phone_number: "0306-1122445", email: "mariam@brightschool.edu.pk", qualification: "Diploma Fine Arts", salary: "48000", created_at: new Date().toISOString() },
    { id: 8810, name: "Sir Haroon Rasheed", subject: "Physical Education & Sports", designation: "Sports Instructor", phone_number: "0307-9988112", email: "haroon@brightschool.edu.pk", qualification: "B.P.Ed Physical Ed", salary: "50000", created_at: new Date().toISOString() }
  ];

  const allTeachers = [...dummyTeachers, ...(teachers || [])];

  return <TeachersClient initialTeachers={allTeachers as any} />;
}
