import { createClient } from '@supabase/supabase-js'; 

const SUPABASE_URL = 'https://wxhbjpvwevxujzjsncfd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lnPv4eYD4ZyI4YkY2h7Maw_fF0_DQmb';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 

async function masterSeed() {
  console.log("🚀 SEEDING EXACT COLUMNS ACROSS TEACHERS, PARENTS, STAFF, AND FEES...");

  // 1. TEACHERS (5 Records)
  const teachers = [
    { name: "Prof. Muhammad Usman", employee_id: "TCH-201", subject: "Mathematics", qualification: "M.Sc Mathematics", salary: 75000, phone_number: "0321-9988771", cnic: "35202-9988771-1" },
    { name: "Mrs. Ayesha Saddiqa", employee_id: "TCH-202", subject: "English", qualification: "M.A English", salary: 70000, phone_number: "0321-9988772", cnic: "35202-9988772-2" },
    { name: "Dr. Kamran Akmal", employee_id: "TCH-203", subject: "Physics", qualification: "Ph.D Physics", salary: 90000, phone_number: "0321-9988773", cnic: "35202-9988773-3" },
    { name: "Miss Sadia Noor", employee_id: "TCH-204", subject: "Science", qualification: "BSCS (Hons)", salary: 65000, phone_number: "0321-9988774", cnic: "35202-9988774-4" },
    { name: "Qari Abdul Basit", employee_id: "TCH-205", subject: "Islamiat", qualification: "Shahadat-ul-Aalamia", salary: 60000, phone_number: "0321-9988775", cnic: "35202-9988775-5" }
  ];
  try {
    const { data: tcData, error: tcErr } = await supabase.from('teachers').insert(teachers).select();
    if (tcErr) console.log("Teachers seed note:", tcErr.message);
    else console.log("✅ Added 5 Teachers!");
  } catch (e) { console.log("Teachers error", e); }

  // 2. PARENTS (5 Records)
  const parents = [
    { father_name: "Tariq Mahmood", mother_name: "Sadia Tariq", phone_number: "0300-1112233", cnic: "35202-1234567-1", occupation: "Senior Engineer", address: "Model Town, Lahore", email: "tariq@example.com" },
    { father_name: "Syed Hassan Shah", mother_name: "Zainab Shah", phone_number: "0301-2223344", cnic: "35202-2345678-2", occupation: "Civil Servant", address: "Garden View, Lahore", email: "hassan@example.com" },
    { father_name: "Bilal Ahmad", mother_name: "Maryam Bilal", phone_number: "0302-3334455", cnic: "35202-3456789-3", occupation: "Chartered Accountant", address: "Cavalry Ground, Lahore", email: "bilal@example.com" },
    { father_name: "Zubair Malik", mother_name: "Saima Malik", phone_number: "0303-4445566", cnic: "35202-4567890-4", occupation: "Business Executive", address: "DHA Phase 5, Lahore", email: "zubair@example.com" },
    { father_name: "Khalid Khan", mother_name: "Nida Khalid", phone_number: "0304-5556677", cnic: "35202-5678901-5", occupation: "Architect", address: "Gulberg III, Lahore", email: "khalid@example.com" }
  ];
  try {
    const { data: prData, error: prErr } = await supabase.from('parents').insert(parents).select();
    if (prErr) console.log("Parents seed note:", prErr.message);
    else console.log("✅ Added 5 Parents!");
  } catch (e) { console.log("Parents error", e); }

  // 3. SUPPORT STAFF (5 Records)
  const staff = [
    { name: "Rana Jahangir", role: "Chief Security Officer", department: "Security", phone_number: "0333-1122334", salary: 45000, cnic: "35202-8877661-1", shift: "Morning" },
    { name: "Nadir Ali", role: "Head Lab Attendant", department: "Science Labs", phone_number: "0333-2233445", salary: 38000, cnic: "35202-8877662-2", shift: "Morning" },
    { name: "Mrs. Shamim Akhtar", role: "Senior Maid / Ayah", department: "Montessori Block", phone_number: "0333-3344556", salary: 30000, cnic: "35202-8877663-3", shift: "Morning" },
    { name: "Asif Mahmood", role: "Transport Coordinator", department: "Transport", phone_number: "0333-4455667", salary: 42000, cnic: "35202-8877664-4", shift: "Morning" },
    { name: "Tariq Aziz", role: "Network Administrator", department: "IT Department", phone_number: "0333-5566778", salary: 55000, cnic: "35202-8877665-5", shift: "Full Day" }
  ];
  try {
    const { data: stfData, error: stfErr } = await supabase.from('staff').insert(staff).select();
    if (stfErr) console.log("Staff seed note:", stfErr.message);
    else console.log("✅ Added 5 Support Staff!");
  } catch (e) { console.log("Staff error", e); }

  // 4. FEES / FINANCE (5 Records)
  const fees = [
    { student_name: "Muhammad Ali Raza", amount: 12000, description: "Monthly Fee June 2026" },
    { student_name: "Syeda Fatima Zahra", amount: 14000, description: "Monthly Fee June 2026" },
    { student_name: "Zainab Binte Bilal", amount: 11500, description: "Monthly Fee June 2026" },
    { student_name: "Hamza Ahmed Malik", amount: 13000, description: "Monthly Fee June 2026" },
    { student_name: "Ayaan Khalid Khan", amount: 15000, description: "Monthly Fee June 2026" }
  ];
  try {
    const { data: feeData, error: feeErr } = await supabase.from('fees').insert(fees).select();
    if (feeErr) console.log("Fees seed note:", feeErr.message);
    else console.log("✅ Added 5 Fee Records!");
  } catch (e) { console.log("Fees error", e); }

  console.log("🎉 MASTER SEEDING FINISHED!");
}

masterSeed();
