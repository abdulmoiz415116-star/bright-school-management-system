import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wxhbjpvwevxujzjsncfd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lnPv4eYD4ZyI4YkY2h7Maw_fF0_DQmb';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log("🚀 STARTING SEEDING FOR 5x5 ACCOUNTING SYSTEM...");

  // Check if tables exist
  const { error: checkErr } = await supabase.from('chart_of_accounts').select('id').limit(1);
  if (checkErr && checkErr.code === 'PGRST205') {
    console.error("❌ ERROR: Table 'chart_of_accounts' does not exist in your database schema.");
    console.error("💡 Please run the migration file 'supabase/migrations/013_comprehensive_finance.sql' in the Supabase SQL Editor first.");
    return;
  }

  // Clear existing entries
  console.log("🧹 Clearing old ledger entries...");
  await supabase.from('journal_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('chart_of_accounts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 1. Insert Chart of Accounts
  console.log("📝 Inserting 25 Accounts (5 for each category)...");
  const accountsData = [
    // Assets (1xxx)
    { code: '1001', name: 'Cash in Hand (کیش)', type: 'Asset' },
    { code: '1002', name: 'Meezan Bank Account', type: 'Asset' },
    { code: '1003', name: 'School Building & Land', type: 'Asset' },
    { code: '1004', name: 'Computer Lab & Electronics', type: 'Asset' },
    { code: '1005', name: 'School Transport Vehicles', type: 'Asset' },

    // Liabilities (2xxx)
    { code: '2001', name: 'Accounts Payable (Suppliers)', type: 'Liability' },
    { code: '2002', name: 'Short-term Bank Loan', type: 'Liability' },
    { code: '2003', name: 'Salaries Payable', type: 'Liability' },
    { code: '2004', name: 'Unearned Tuition Fees (Advances)', type: 'Liability' },
    { code: '2005', name: 'Security Deposits Refundable', type: 'Liability' },

    // Equity (3xxx)
    { code: '3001', name: 'Owner Capital Investment', type: 'Equity' },
    { code: '3002', name: 'Retained Earnings', type: 'Equity' },
    { code: '3003', name: 'School Endowment Fund', type: 'Equity' },
    { code: '3004', name: 'Reserves for School Expansion', type: 'Equity' },
    { code: '3005', name: 'Development Grant Reserve', type: 'Equity' },

    // Revenue (4xxx)
    { code: '4001', name: 'Tuition Fees Revenue', type: 'Revenue' },
    { code: '4002', name: 'Admission & Registration Fees', type: 'Revenue' },
    { code: '4003', name: 'Transport Service Revenue', type: 'Revenue' },
    { code: '4004', name: 'Exam & Laboratory Revenue', type: 'Revenue' },
    { code: '4005', name: 'Canteen & Uniform Shop Commission', type: 'Revenue' },

    // Expense (5xxx)
    { code: '5001', name: 'Staff Salaries Expense', type: 'Expense' },
    { code: '5002', name: 'Utilities Expense (Power/Water)', type: 'Expense' },
    { code: '5003', name: 'Rent & Building Lease Expense', type: 'Expense' },
    { code: '5004', name: 'Repair & Maintenance Expense', type: 'Expense' },
    { code: '5005', name: 'Printing & Stationery Expense', type: 'Expense' }
  ];

  const { data: accounts, error: accountsErr } = await supabase
    .from('chart_of_accounts')
    .insert(accountsData)
    .select();

  if (accountsErr) {
    console.error("❌ Error inserting accounts:", accountsErr);
    return;
  }
  console.log(`✅ Successfully seeded ${accounts.length} accounts!`);

  // Map code to ID
  const accountMap = {};
  accounts.forEach(acc => {
    accountMap[acc.code] = acc.id;
  });

  // 2. Insert 5 Journal Entries per Category (total 25)
  console.log("📝 Seeding 25 journal entries (5 for each category)...");
  const today = new Date().toISOString().split('T')[0];
  const dateOffset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const journalData = [
    // Assets
    { account_id: accountMap['1001'], amount: 150000.00, type: 'Debit', description: 'Initial cash float established for Admin block', entry_date: dateOffset(30) },
    { account_id: accountMap['1002'], amount: 450000.00, type: 'Debit', description: 'Meezan Bank opening balance deposit', entry_date: dateOffset(28) },
    { account_id: accountMap['1003'], amount: 12000000.00, type: 'Debit', description: 'Valuation of Main School Campus Building', entry_date: dateOffset(25) },
    { account_id: accountMap['1004'], amount: 350000.00, type: 'Debit', description: 'Purchased 15 Core i7 desktop systems for Computer Lab', entry_date: dateOffset(20) },
    { account_id: accountMap['1005'], amount: 2400000.00, type: 'Debit', description: 'Purchase of new school bus for student transport', entry_date: dateOffset(15) },

    // Liabilities
    { account_id: accountMap['2001'], amount: 45000.00, type: 'Credit', description: 'Stationery invoice received from Allied Publishers', entry_date: dateOffset(24) },
    { account_id: accountMap['2002'], amount: 1500000.00, type: 'Credit', description: 'Received short-term credit facility from bank', entry_date: dateOffset(22) },
    { account_id: accountMap['2003'], amount: 380000.00, type: 'Credit', description: 'Accrued staff salaries for the month of May', entry_date: dateOffset(5) },
    { account_id: accountMap['2004'], amount: 12000.00, type: 'Credit', description: 'Advance fee received for next term from student Ayesha', entry_date: dateOffset(3) },
    { account_id: accountMap['2005'], amount: 50000.00, type: 'Credit', description: 'Refundable security deposit from new admission student (Muhammad Ali Raza)', entry_date: dateOffset(2) },

    // Equity
    { account_id: accountMap['3001'], amount: 5000000.00, type: 'Credit', description: 'Initial capital injected by Founder Directors', entry_date: dateOffset(40) },
    { account_id: accountMap['3002'], amount: 850000.00, type: 'Credit', description: 'Transfer of previous academic year net surplus', entry_date: dateOffset(35) },
    { account_id: accountMap['3003'], amount: 1000000.00, type: 'Credit', description: 'Endowment grant received from Board of Trustees', entry_date: dateOffset(32) },
    { account_id: accountMap['3004'], amount: 500000.00, type: 'Credit', description: 'Allocated funds for Science lab expansion project', entry_date: dateOffset(12) },
    { account_id: accountMap['3005'], amount: 300000.00, type: 'Credit', description: 'Government education subsidy grant received', entry_date: dateOffset(8) },

    // Revenue
    { account_id: accountMap['4001'], amount: 12000.00, type: 'Credit', description: 'Monthly fee received from student: Muhammad Ali Raza', entry_date: dateOffset(1) },
    { account_id: accountMap['4002'], amount: 25000.00, type: 'Credit', description: 'Admission registration fee received from Syeda Fatima Zahra', entry_date: dateOffset(4) },
    { account_id: accountMap['4003'], amount: 15000.00, type: 'Credit', description: 'Monthly school bus subscription fee collected', entry_date: dateOffset(6) },
    { account_id: accountMap['4004'], amount: 8500.00, type: 'Credit', description: 'Board exam registration fee received from Zainab Binte Bilal', entry_date: dateOffset(10) },
    { account_id: accountMap['4005'], amount: 35000.00, type: 'Credit', description: 'Monthly canteen commission received from contractor', entry_date: dateOffset(12) },

    // Expense
    { account_id: accountMap['5001'], amount: 75000.00, type: 'Debit', description: 'Monthly salary paid to Mathematics teacher: Prof. Muhammad Usman', entry_date: dateOffset(2) },
    { account_id: accountMap['5002'], amount: 48000.00, type: 'Debit', description: 'Electricity charges paid to LESCO for admin block', entry_date: dateOffset(3) },
    { account_id: accountMap['5003'], amount: 150000.00, type: 'Debit', description: 'Monthly school building lease rent paid', entry_date: dateOffset(7) },
    { account_id: accountMap['5004'], amount: 18000.00, type: 'Debit', description: 'School building generator repair and diesel refill', entry_date: dateOffset(11) },
    { account_id: accountMap['5005'], amount: 12000.00, type: 'Debit', description: 'Office print papers, whiteboard markers and diaries', entry_date: dateOffset(14) }
  ];

  const { data: journalEntries, error: journalErr } = await supabase
    .from('journal_entries')
    .insert(journalData)
    .select();

  if (journalErr) {
    console.error("❌ Error inserting journal entries:", journalErr);
    return;
  }
  console.log(`✅ Successfully seeded ${journalEntries.length} journal entries!`);
  console.log("🎉 FINISHED SEEDING SUCCESSFULLY!");
}

run();
