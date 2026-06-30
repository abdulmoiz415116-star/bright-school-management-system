import { createClient } from "@/utils/supabase/server";
import { FinanceClient } from "./FinanceClient";

export default async function FinancePage() {
  const supabase = await createClient();
  
  // Fetch fees
  const { data: fees } = await supabase.from('fees').select('*').order('created_at', { ascending: false });

  // Fetch students for the dropdown
  const { data: students } = await supabase.from('students').select('id, name').order('name', { ascending: true });

  // Fetch chart of accounts
  const { data: accounts } = await supabase.from('chart_of_accounts').select('*').order('code', { ascending: true });

  // Fetch journal entries
  const { data: journalEntries } = await supabase.from('journal_entries').select('*, chart_of_accounts(name, code)').order('entry_date', { ascending: false });

  // Fetch payroll
  const { data: payroll } = await supabase.from('payroll').select('*, employees(employee_code, profiles(full_name))').order('month_year', { ascending: false });

  // Fetch employees for dropdown
  const { data: employees } = await supabase.from('employees').select('id, employee_code, basic_salary, profiles(full_name)');

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

  const dummyJournal = [
    { id: "9901", account_id: "1", amount: 12000, type: "Debit", description: "Office Stationery & Printing", entry_date: new Date().toISOString(), chart_of_accounts: { name: "Office Expenses", code: "EXP-01" } },
    { id: "9902", account_id: "2", amount: 45000, type: "Credit", description: "Admission Fees Revenue", entry_date: new Date().toISOString(), chart_of_accounts: { name: "Service Revenue", code: "REV-01" } },
    { id: "9903", account_id: "3", amount: 18000, type: "Debit", description: "Electricity & Utility Bill", entry_date: new Date().toISOString(), chart_of_accounts: { name: "Utility Expenses", code: "EXP-02" } },
    { id: "9904", account_id: "4", amount: 15000, type: "Debit", description: "Generator Diesel & Maintenance", entry_date: new Date().toISOString(), chart_of_accounts: { name: "Maintenance", code: "EXP-03" } },
    { id: "9905", account_id: "5", amount: 35000, type: "Credit", description: "Canteen & Prospectus Sales", entry_date: new Date().toISOString(), chart_of_accounts: { name: "Other Income", code: "INC-02" } },
    { id: "9906", account_id: "1", amount: 8000, type: "Debit", description: "Staff Tea & Hospitality", entry_date: new Date().toISOString(), chart_of_accounts: { name: "Office Expenses", code: "EXP-01" } },
    { id: "9907", account_id: "3", amount: 6500, type: "Debit", description: "High-Speed Internet Fiber Bill", entry_date: new Date().toISOString(), chart_of_accounts: { name: "Utility Expenses", code: "EXP-02" } },
    { id: "9908", account_id: "2", amount: 68000, type: "Credit", description: "Monthly Tuition Fee Deposit", entry_date: new Date().toISOString(), chart_of_accounts: { name: "Service Revenue", code: "REV-01" } },
    { id: "9909", account_id: "4", amount: 12500, type: "Debit", description: "Air Conditioning Servicing", entry_date: new Date().toISOString(), chart_of_accounts: { name: "Maintenance", code: "EXP-03" } },
    { id: "9910", account_id: "5", amount: 20000, type: "Credit", description: "Hall Rental & Sports Event Income", entry_date: new Date().toISOString(), chart_of_accounts: { name: "Other Income", code: "INC-02" } }
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

  const dummyAccounts = [
    { id: "1", code: "EXP-01", name: "Office Expenses", type: "Expense" },
    { id: "2", code: "REV-01", name: "Service Revenue", type: "Revenue" },
    { id: "3", code: "EXP-02", name: "Utility Expenses", type: "Expense" },
    { id: "4", code: "EXP-03", name: "Maintenance", type: "Expense" },
    { id: "5", code: "INC-02", name: "Other Income", type: "Revenue" },
  ];

  return <FinanceClient 
    initialFees={(fees && fees.length > 0 ? fees : dummyFees) as any} 
    studentsList={students || []} 
    initialAccounts={(accounts && accounts.length > 0 ? accounts : dummyAccounts) as any}
    initialJournal={(journalEntries && journalEntries.length > 0 ? journalEntries : dummyJournal) as any}
    initialPayroll={(payroll && payroll.length > 0 ? payroll : dummyPayroll) as any}
    employeesList={employees || []}
  />;
}
