import { createClient } from "@/utils/supabase/server";
import { StaffClient } from "./StaffClient";

export default async function StaffPage() {
  const supabase = await createClient();
  
  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false });

  const dummyStaff = [
    { id: 7701, name: "Tariq Jamil (طارق جمیل)", role: "Security Officer", department: "Administration & Security", phone_number: "0300-9876543", cnic: "35202-1234567-1", salary: "45000", shift: "Morning", joining_date: "2024-01-15", advance_taken: 5000, pending_dues: 0, last_paid_amount: 45000, payment_status: "Paid" },
    { id: 7702, name: "Muhammad Usman", role: "Accountant", department: "Finance Department", phone_number: "0321-4567890", cnic: "35202-7654321-3", salary: "55000", shift: "Morning", joining_date: "2023-08-10", advance_taken: 0, pending_dues: 0, last_paid_amount: 55000, payment_status: "Paid" },
    { id: 7703, name: "Rashid Minhas", role: "Transport Driver", department: "Transport Department", phone_number: "0301-1122334", cnic: "35202-9988776-5", salary: "32000", shift: "Morning", joining_date: "2024-03-01", advance_taken: 2000, pending_dues: 32000, payment_status: "Pending" },
    { id: 7704, name: "Ghulam Fatima", role: "Office Assistant", department: "Administration", phone_number: "0333-5566778", cnic: "35202-4433221-7", salary: "38000", shift: "Morning", joining_date: "2024-02-01", advance_taken: 0, pending_dues: 0, last_paid_amount: 38000, payment_status: "Paid" },
    { id: 7705, name: "Allah Ditta", role: "Security Guard", department: "Security", phone_number: "0302-1122334", cnic: "35202-8877665-9", salary: "30000", shift: "Night", joining_date: "2023-11-15", advance_taken: 1500, pending_dues: 0, last_paid_amount: 30000, payment_status: "Paid" },
    { id: 7706, name: "Shazia Parveen", role: "Female Attendant", department: "Montessori Wing", phone_number: "0345-6677889", cnic: "35202-3322114-2", salary: "28000", shift: "Morning", joining_date: "2024-04-10", advance_taken: 0, pending_dues: 0, last_paid_amount: 28000, payment_status: "Paid" },
    { id: 7707, name: "Muhammad Akram", role: "Maintenance Electrician", department: "Estate Management", phone_number: "0312-9900112", cnic: "35202-5566778-4", salary: "35000", shift: "Morning", joining_date: "2023-09-01", advance_taken: 3000, pending_dues: 0, last_paid_amount: 35000, payment_status: "Paid" },
    { id: 7708, name: "Riaz Masih", role: "Sanitary Worker", department: "Janitorial Staff", phone_number: "0306-4455667", cnic: "35202-1122334-6", salary: "26000", shift: "Morning", joining_date: "2024-01-01", advance_taken: 1000, pending_dues: 0, last_paid_amount: 26000, payment_status: "Paid" },
    { id: 7709, name: "Nasreen Bibi", role: "Lab Assistant", department: "Science Labs", phone_number: "0307-8899001", cnic: "35202-7788990-8", salary: "32000", shift: "Morning", joining_date: "2024-02-15", advance_taken: 0, pending_dues: 0, last_paid_amount: 32000, payment_status: "Paid" },
    { id: 7710, name: "Kamran Shah", role: "IT Lab Assistant", department: "Computer Dept", phone_number: "0323-1122334", cnic: "35202-9900112-0", salary: "36000", shift: "Morning", joining_date: "2023-10-01", advance_taken: 0, pending_dues: 0, last_paid_amount: 36000, payment_status: "Paid" }
  ];

  const allStaff = [...dummyStaff, ...(staff || [])];

  return <StaffClient initialStaff={allStaff as any} />;
}
