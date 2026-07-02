import { createClient } from "@/utils/supabase/server";
import { FinanceClient } from "./FinanceClient";

export default async function FinancePage() {
  const supabase = await createClient();
  
  // Fetch fees
  const { data: fees } = await supabase.from('fees').select('*').order('id', { ascending: false });

  // Fetch students for the dropdown
  const { data: students } = await supabase.from('students').select('id, name').order('name', { ascending: true });

  // Fetch chart of accounts
  const { data: accounts } = await supabase.from('chart_of_accounts').select('*').order('code', { ascending: true });

  // Fetch journal entries
  const { data: journalEntries } = await supabase.from('journal_entries').select('*, chart_of_accounts(name, code, type)').order('entry_date', { ascending: false }).order('created_at', { ascending: false });

  // Fetch payroll
  const { data: payroll } = await supabase.from('payroll').select('*').order('id', { ascending: false });

  // Fetch teachers for payroll dropdown
  const { data: dbTeachers } = await supabase.from('teachers').select('id, name, salary, employee_id');

  // Fetch staff for payroll dropdown
  const { data: dbStaff } = await supabase.from('staff').select('id, name, salary, cnic, role');

  // Fetch inventory logs for Cash Book
  const { data: inventoryLogs } = await supabase
    .from('inventory_logs')
    .select('*')
    .order('date', { ascending: false });

  const dummyTeachers = [
    { id: 8801, name: "Prof. Tariq Mahmood", salary: 75000, employee_id: "TCH-101" },
    { id: 8802, name: "Mrs. Ayesha Saddiqa", salary: 65000, employee_id: "TCH-102" },
    { id: 8803, name: "Miss Sana Malik", salary: 60000, employee_id: "TCH-103" },
    { id: 8804, name: "Sir Hamza Ali", salary: 58000, employee_id: "TCH-104" },
    { id: 8805, name: "Miss Hira Khan", salary: 52000, employee_id: "TCH-105" },
    { id: 8806, name: "Sir Bilal Ahmed", salary: 50000, employee_id: "TCH-106" },
    { id: 8807, name: "Miss Zainab Malik", salary: 55000, employee_id: "TCH-107" },
    { id: 8808, name: "Sir Usman Ghani", salary: 58000, employee_id: "TCH-108" },
    { id: 8809, name: "Miss Mariam Noor", salary: 48000, employee_id: "TCH-109" },
    { id: 8810, name: "Sir Haroon Rasheed", salary: 50000, employee_id: "TCH-110" }
  ];

  const dummyStaff = [
    { id: 7701, name: "Tariq Jamil (طارق جمیل)", salary: 45000, role: "Security Officer" },
    { id: 7702, name: "Muhammad Usman", salary: 55000, role: "Accountant" },
    { id: 7703, name: "Rashid Minhas", salary: 32000, role: "Transport Driver" },
    { id: 7704, name: "Ghulam Fatima", salary: 38000, role: "Office Assistant" },
    { id: 7705, name: "Allah Ditta", salary: 30000, role: "Security Guard" },
    { id: 7706, name: "Shazia Parveen", salary: 28000, role: "Female Attendant" },
    { id: 7707, name: "Muhammad Akram", salary: 35000, role: "Maintenance Electrician" },
    { id: 7708, name: "Riaz Masih", salary: 26000, role: "Sanitary Worker" },
    { id: 7709, name: "Nasreen Bibi", salary: 32000, role: "Lab Assistant" },
    { id: 7710, name: "Kamran Shah", salary: 36000, role: "IT Lab Assistant" }
  ];

  // Map database teachers
  const dbTeachersMapped = (dbTeachers || []).map((t: any) => ({
    id: `teacher_${t.id}`,
    name: t.name,
    salary: Number(t.salary || 0),
    employee_code: t.employee_id || `TCH-${t.id}`
  }));

  // Map database staff
  const dbStaffMapped = (dbStaff || []).map((s: any) => ({
    id: `staff_${s.id}`,
    name: s.name,
    salary: Number(s.salary || 0),
    employee_code: `STF-${s.id}`
  }));

  // Map dummy teachers
  const dummyTeachersMapped = dummyTeachers.map((t: any) => ({
    id: `teacher_${t.id}`,
    name: t.name,
    salary: Number(t.salary || 0),
    employee_code: t.employee_id
  }));

  // Map dummy staff
  const dummyStaffMapped = dummyStaff.map((s: any) => ({
    id: `staff_${s.id}`,
    name: s.name,
    salary: Number(s.salary || 0),
    employee_code: `STF-${s.id}`
  }));

  // Combine lists
  const combinedEmployees = [
    ...dbTeachersMapped,
    ...dbStaffMapped,
    ...dummyTeachersMapped,
    ...dummyStaffMapped
  ];

  const dummyFees = [
    { id: 9901, amount: 5000, description: "Tuition Fee - June 2026", student_name: "Muhammad Ali Raza", created_at: new Date().toISOString() },
    { id: 9902, amount: 6500, description: "Tuition & Lab Fee - June 2026", student_name: "Syeda Fatima Zahra", created_at: new Date().toISOString() },
    { id: 9903, amount: 5500, description: "Tuition Fee - June 2026", student_name: "Zainab Binte Bilal", created_at: new Date().toISOString() },
    { id: 9904, amount: 2000, description: "Transport Fee - June 2026", student_name: "Hamza Tariq", created_at: new Date().toISOString() },
    { id: 9905, amount: 5000, description: "Tuition Fee - June 2026", student_name: "Ayesha Omer", created_at: new Date().toISOString() },
    { id: 9906, amount: 3000, description: "Annual Sports Charges", student_name: "Ibrahim Khalid", created_at: new Date().toISOString() },
    { id: 9907, amount: 5200, description: "Tuition Fee - June 2026", student_name: "Maryam Sajid", created_at: new Date().toISOString() },
    { id: 9908, amount: 6000, description: "Computer Lab Fee", student_name: "Bilal Usman", created_at: new Date().toISOString() },
    { id: 9909, amount: 4800, description: "Tuition Fee - June 2026", student_name: "Anaya Usman", created_at: new Date().toISOString() },
    { id: 9910, amount: 5500, description: "Matric Board Exam Charges", student_name: "Abdullah Haroon", created_at: new Date().toISOString() }
  ];

  const dummyAccounts = [
    // Assets (1xxx)
    { id: "acc_1001", code: "1001", name: "Cash in Hand (کیش)", type: "Asset" },
    { id: "acc_1002", code: "1002", name: "Meezan Bank Account", type: "Asset" },
    { id: "acc_1003", code: "1003", name: "School Building & Land", type: "Asset" },
    { id: "acc_1004", code: "1004", name: "Computer Lab & Electronics", type: "Asset" },
    { id: "acc_1005", code: "1005", name: "School Transport Vehicles", type: "Asset" },

    // Liabilities (2xxx)
    { id: "acc_2001", code: "2001", name: "Accounts Payable (Suppliers)", type: "Liability" },
    { id: "acc_2002", code: "2002", name: "Short-term Bank Loan", type: "Liability" },
    { id: "acc_2003", code: "2003", name: "Salaries Payable", type: "Liability" },
    { id: "acc_2004", code: "2004", name: "Unearned Tuition Fees (Advances)", type: "Liability" },
    { id: "acc_2005", code: "2005", name: "Security Deposits Refundable", type: "Liability" },

    // Equity (3xxx)
    { id: "acc_3001", code: "3001", name: "Owner Capital Investment", type: "Equity" },
    { id: "acc_3002", code: "3002", name: "Retained Earnings", type: "Equity" },
    { id: "acc_3003", code: "3003", name: "School Endowment Fund", type: "Equity" },
    { id: "acc_3004", code: "3004", name: "Reserves for School Expansion", type: "Equity" },
    { id: "acc_3005", code: "3005", name: "Development Grant Reserve", type: "Equity" },

    // Revenue (4xxx)
    { id: "acc_4001", code: "4001", name: "Tuition Fees Revenue", type: "Revenue" },
    { id: "acc_4002", code: "4002", name: "Admission & Registration Fees", type: "Revenue" },
    { id: "acc_4003", code: "4003", name: "Transport Service Revenue", type: "Revenue" },
    { id: "acc_4004", code: "4004", name: "Exam & Laboratory Revenue", type: "Revenue" },
    { id: "acc_4005", code: "4005", name: "Canteen & Uniform Shop Commission", type: "Revenue" },

    // Expense (5xxx)
    { id: "acc_5001", code: "5001", name: "Staff Salaries Expense", type: "Expense" },
    { id: "acc_5002", code: "5002", name: "Utilities Expense (Power/Water)", type: "Expense" },
    { id: "acc_5003", code: "5003", name: "Rent & Building Lease Expense", type: "Expense" },
    { id: "acc_5004", code: "5004", name: "Repair & Maintenance Expense", type: "Expense" },
    { id: "acc_5005", code: "5005", name: "Printing & Stationery Expense", type: "Expense" }
  ];

  const dateOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const dummyJournal = [
    // Assets (5 records)
    { id: "j_101", account_id: "acc_1001", amount: 150000, type: "Debit", description: "Initial cash float established for Admin block", entry_date: dateOffset(30), chart_of_accounts: { name: "Cash in Hand (کیش)", code: "1001", type: "Asset" } },
    { id: "j_102", account_id: "acc_1002", amount: 450000, type: "Debit", description: "Meezan Bank opening balance deposit", entry_date: dateOffset(28), chart_of_accounts: { name: "Meezan Bank Account", code: "1002", type: "Asset" } },
    { id: "j_103", account_id: "acc_1003", amount: 12000000, type: "Debit", description: "Valuation of Main School Campus Building", entry_date: dateOffset(25), chart_of_accounts: { name: "School Building & Land", code: "1003", type: "Asset" } },
    { id: "j_104", account_id: "acc_1004", amount: 350000, type: "Debit", description: "Purchased 15 Core i7 desktop systems for Computer Lab", entry_date: dateOffset(20), chart_of_accounts: { name: "Computer Lab & Electronics", code: "1004", type: "Asset" } },
    { id: "j_105", account_id: "acc_1005", amount: 2400000, type: "Debit", description: "Purchase of new school bus for student transport", entry_date: dateOffset(15), chart_of_accounts: { name: "School Transport Vehicles", code: "1005", type: "Asset" } },

    // Liabilities (5 records)
    { id: "j_201", account_id: "acc_2001", amount: 45000, type: "Credit", description: "Stationery invoice received from Allied Publishers", entry_date: dateOffset(24), chart_of_accounts: { name: "Accounts Payable (Suppliers)", code: "2001", type: "Liability" } },
    { id: "j_202", account_id: "acc_2002", amount: 1500000, type: "Credit", description: "Received short-term credit facility from bank", entry_date: dateOffset(22), chart_of_accounts: { name: "Short-term Bank Loan", code: "2002", type: "Liability" } },
    { id: "j_203", account_id: "acc_2003", amount: 380000, type: "Credit", description: "Accrued staff salaries for the month of May", entry_date: dateOffset(5), chart_of_accounts: { name: "Salaries Payable", code: "2003", type: "Liability" } },
    { id: "j_204", account_id: "acc_2004", amount: 12000, type: "Credit", description: "Advance fee received for next term from student Ayesha", entry_date: dateOffset(3), chart_of_accounts: { name: "Unearned Tuition Fees (Advances)", code: "2004", type: "Liability" } },
    { id: "j_205", account_id: "acc_2005", amount: 50000, type: "Credit", description: "Refundable security deposit from new admission student (Muhammad Ali Raza)", entry_date: dateOffset(2), chart_of_accounts: { name: "Security Deposits Refundable", code: "2005", type: "Liability" } },

    // Equity (5 records)
    { id: "j_301", account_id: "acc_3001", amount: 5000000, type: "Credit", description: "Initial capital injected by Founder Directors", entry_date: dateOffset(40), chart_of_accounts: { name: "Owner Capital Investment", code: "3001", type: "Equity" } },
    { id: "j_302", account_id: "acc_3002", amount: 850000, type: "Credit", description: "Transfer of previous academic year net surplus", entry_date: dateOffset(35), chart_of_accounts: { name: "Retained Earnings", code: "3002", type: "Equity" } },
    { id: "j_303", account_id: "acc_3003", amount: 1000000, type: "Credit", description: "Endowment grant received from Board of Trustees", entry_date: dateOffset(32), chart_of_accounts: { name: "School Endowment Fund", code: "3003", type: "Equity" } },
    { id: "j_304", account_id: "acc_3004", amount: 500000, type: "Credit", description: "Allocated funds for Science lab expansion project", entry_date: dateOffset(12), chart_of_accounts: { name: "Reserves for School Expansion", code: "3004", type: "Equity" } },
    { id: "j_305", account_id: "acc_3005", amount: 300000, type: "Credit", description: "Government education subsidy grant received", entry_date: dateOffset(8), chart_of_accounts: { name: "Development Grant Reserve", code: "3005", type: "Equity" } },

    // Revenue (5 records)
    { id: "j_401", account_id: "acc_4001", amount: 12000, type: "Credit", description: "Monthly fee received from student: Muhammad Ali Raza", entry_date: dateOffset(1), chart_of_accounts: { name: "Tuition Fees Revenue", code: "4001", type: "Revenue" } },
    { id: "j_402", account_id: "acc_4002", amount: 25000, type: "Credit", description: "Admission registration fee received from Syeda Fatima Zahra", entry_date: dateOffset(4), chart_of_accounts: { name: "Admission & Registration Fees", code: "4002", type: "Revenue" } },
    { id: "j_403", account_id: "acc_4003", amount: 15000, type: "Credit", description: "Monthly school bus subscription fee collected", entry_date: dateOffset(6), chart_of_accounts: { name: "Transport Service Revenue", code: "4003", type: "Revenue" } },
    { id: "j_404", account_id: "acc_4004", amount: 8500, type: "Credit", description: "Board exam registration fee received from Zainab Binte Bilal", entry_date: dateOffset(10), chart_of_accounts: { name: "Exam & Laboratory Revenue", code: "4004", type: "Revenue" } },
    { id: "j_405", account_id: "acc_4005", amount: 35000, type: "Credit", description: "Monthly canteen commission received from contractor", entry_date: dateOffset(12), chart_of_accounts: { name: "Canteen & Uniform Shop Commission", code: "4005", type: "Revenue" } },

    // Expense (5 records)
    { id: "j_501", account_id: "acc_5001", amount: 75000, type: "Debit", description: "Monthly salary paid to Mathematics teacher: Prof. Muhammad Usman", entry_date: dateOffset(2), chart_of_accounts: { name: "Staff Salaries Expense", code: "5001", type: "Expense" } },
    { id: "j_502", account_id: "acc_5002", amount: 48000, type: "Debit", description: "Electricity charges paid to LESCO for admin block", entry_date: dateOffset(3), chart_of_accounts: { name: "Utilities Expense (Power/Water)", code: "5002", type: "Expense" } },
    { id: "j_503", account_id: "acc_5003", amount: 150000, type: "Debit", description: "Monthly school building lease rent paid", entry_date: dateOffset(7), chart_of_accounts: { name: "Rent & Building Lease Expense", code: "5003", type: "Expense" } },
    { id: "j_504", account_id: "acc_5004", amount: 18000, type: "Debit", description: "School building generator repair and diesel refill", entry_date: dateOffset(11), chart_of_accounts: { name: "Repair & Maintenance Expense", code: "5004", type: "Expense" } },
    { id: "j_505", account_id: "acc_5005", amount: 12000, type: "Debit", description: "Office print papers, whiteboard markers and diaries", entry_date: dateOffset(14), chart_of_accounts: { name: "Printing & Stationery Expense", code: "5005", type: "Expense" } }
  ];

  const dummyPayroll = [
    { id: "9901", employee_id: "1", month_year: "06-2026", basic_salary: 45000, allowances: 5000, deductions: 5000, net_salary: 45000, status: "paid", payment_date: new Date().toISOString(), employees: { employee_code: "STF-201", profiles: { full_name: "Tariq Jamil (طارق جمیل)" } } },
    { id: "9902", employee_id: "2", month_year: "06-2026", basic_salary: 75000, allowances: 8000, deductions: 2000, net_salary: 81000, status: "paid", payment_date: new Date().toISOString(), employees: { employee_code: "TCH-101", profiles: { full_name: "Prof. Tariq Mahmood" } } },
    { id: "9903", employee_id: "3", month_year: "06-2026", basic_salary: 65000, allowances: 6000, deductions: 1500, net_salary: 69500, status: "paid", payment_date: new Date().toISOString(), employees: { employee_code: "TCH-102", profiles: { full_name: "Mrs. Ayesha Saddiqa" } } },
    { id: "9904", employee_id: "4", month_year: "06-2026", basic_salary: 60000, allowances: 5000, deductions: 1000, net_salary: 64000, status: "paid", payment_date: new Date().toISOString(), employees: { employee_code: "TCH-103", profiles: { full_name: "Miss Sana Malik" } } },
    { id: "9905", employee_id: "5", month_year: "06-2026", basic_salary: 58000, allowances: 5000, deductions: 1000, net_salary: 62000, status: "paid", payment_date: new Date().toISOString(), employees: { employee_code: "TCH-104", profiles: { full_name: "Sir Hamza Ali" } } },
    { id: "9906", employee_id: "6", month_year: "06-2026", basic_salary: 55000, allowances: 4000, deductions: 0, net_salary: 59000, status: "paid", payment_date: new Date().toISOString(), employees: { employee_code: "STF-202", profiles: { full_name: "Muhammad Usman" } } },
    { id: "9907", employee_id: "7", month_year: "06-2026", basic_salary: 52000, allowances: 4000, deductions: 1000, net_salary: 55000, status: "paid", payment_date: new Date().toISOString(), employees: { employee_code: "TCH-105", profiles: { full_name: "Miss Hira Khan" } } },
    { id: "9908", employee_id: "8", month_year: "06-2026", basic_salary: 32000, allowances: 3000, deductions: 2000, net_salary: 33000, status: "paid", payment_date: new Date().toISOString(), employees: { employee_code: "STF-203", profiles: { full_name: "Rashid Minhas" } } },
    { id: "9909", employee_id: "9", month_year: "06-2026", basic_salary: 38000, allowances: 3000, deductions: 0, net_salary: 41000, status: "paid", payment_date: new Date().toISOString(), employees: { employee_code: "STF-204", profiles: { full_name: "Ghulam Fatima" } } },
    { id: "9910", employee_id: "10", month_year: "06-2026", basic_salary: 50000, allowances: 4000, deductions: 1000, net_salary: 53000, status: "paid", payment_date: new Date().toISOString(), employees: { employee_code: "TCH-106", profiles: { full_name: "Sir Bilal Ahmed" } } }
  ];


  return <FinanceClient 
    initialFees={(fees && fees.length > 0 ? fees : dummyFees) as any} 
    studentsList={students || []} 
    initialAccounts={(accounts && accounts.length > 0 ? accounts : dummyAccounts) as any}
    initialJournal={(journalEntries && journalEntries.length > 0 ? journalEntries : dummyJournal) as any}
    initialPayroll={(payroll && payroll.length > 0 ? payroll : dummyPayroll) as any}
    employeesList={combinedEmployees}
    inventoryLogs={inventoryLogs || []}
  />;
}
