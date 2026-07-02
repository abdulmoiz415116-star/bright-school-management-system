"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Loader2, Trash2, Receipt, WalletCards, Activity, Printer, X, Pencil, MessageSquare, Stamp, CheckCircle2, Landmark, CreditCard } from "lucide-react";
import { useLocale } from "next-intl";

// Types
type Fee = { id: number; amount: number; description: string; student_id?: number; student_name?: string; created_at: string; };
type Account = { id: string; code: string; name: string; type: string; };
type Journal = { id: string; account_id: string; amount: number; type: string; description: string; entry_date: string; chart_of_accounts: { name: string; code: string; type?: string; } };
type Payroll = { id: string; employee_id: string; month_year: string; basic_salary: number; allowances: number; deductions: number; net_salary: number; status: string; payment_date: string; employees?: { employee_code?: string; profiles?: { full_name?: string; } } };

const supabase = createClient();

export function FinanceClient({ 
  initialFees, studentsList, initialAccounts, initialJournal, initialPayroll, employeesList, inventoryLogs 
}: { 
  initialFees: Fee[], studentsList: any[], initialAccounts: Account[], initialJournal: Journal[], initialPayroll: Payroll[], employeesList: any[], inventoryLogs: any[] 
}) {
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const [activeTab, setActiveTab] = useState<'fees' | 'payroll' | 'ledger' | 'cashbook' | 'trial_balance' | 'statements'>('fees');
  const [ledgerFilter, setLedgerFilter] = useState<'ALL' | 'CASH' | 'CREDIT' | 'INTERNAL'>('ALL');
  
  const [cashInHand, setCashInHand] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bs_inventory_cash_in_hand_v5");
      if (saved) return parseFloat(saved) || 45000;
    }
    return 45000;
  });

  const [bankBalance, setBankBalance] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bs_inventory_bank_balance_v5");
      if (saved) return parseFloat(saved) || 150000;
    }
    return 150000;
  });

  const [logs, setLogs] = useState<any[]>(inventoryLogs);
  
  useEffect(() => {
    setLogs(inventoryLogs);
  }, [inventoryLogs]);

  // Calculations for displayLogs
  const DEFAULT_LOGS = [
    { id: 1, date: new Date(Date.now() - 3600000 * 24).toISOString().split('T')[0], item_name: "Premium Student Diaries", transaction_type: "IN", quantity: 150, unit_price: 250, total_amount: 37500, payment_mode: "Cash Purchase", cash_source: "Cash in Hand", remarks: "Imported diaries for Nursery wing" },
    { id: 2, date: new Date(Date.now() - 3600000 * 12).toISOString().split('T')[0], item_name: "School Uniform Crest Badges", transaction_type: "IN", quantity: 500, unit_price: 30, total_amount: 15000, payment_mode: "Bank Transfer", cash_source: "Bank", remarks: "Supplier bulk badge order" },
    { id: 3, date: new Date(Date.now() - 3600000 * 8).toISOString().split('T')[0], item_name: "Montessori School Bags", transaction_type: "OUT", quantity: 20, unit_price: 1500, total_amount: 30000, payment_mode: "Cash Sale", cash_source: "Cash in Hand", remarks: "Sold to Nursery class parents" },
    { id: 4, date: new Date(Date.now() - 3600000 * 4).toISOString().split('T')[0], item_name: "General Stationery Pack", transaction_type: "OUT", quantity: 5, unit_price: 0, total_amount: 0, payment_mode: "Internal Issue", cash_source: "Free", remarks: "Issued to Staff room coordinators" }
  ];
  
  const displayLogs = logs && logs.length > 0 ? logs : DEFAULT_LOGS;

  const totalSalesRevenue = displayLogs
    .filter((l: any) => l.transaction_type === 'OUT' && (l.payment_mode === 'Cash Sale' || l.payment_mode === 'Credit Sale' || l.payment_mode === 'Cash Sale (کیش سیل)'))
    .reduce((sum: number, log: any) => sum + (log.total_amount || 0), 0);

  const totalCostOfGoodsSold = displayLogs
    .filter((l: any) => l.transaction_type === 'OUT' && (l.payment_mode === 'Cash Sale' || l.payment_mode === 'Credit Sale' || l.payment_mode === 'Cash Sale (کیش سیل)'))
    .reduce((sum: number, log: any) => {
      return sum + (log.quantity * (log.unit_price * 0.6));
    }, 0);

  const totalProfitLoss = totalSalesRevenue - totalCostOfGoodsSold;

  const filteredLogs = displayLogs.filter((l: any) => {
    if (ledgerFilter === 'ALL') return true;
    if (ledgerFilter === 'CASH') return (l.payment_mode || '').toLowerCase().includes('cash') || (l.payment_mode || '') === 'Supplier Payment' || (l.payment_mode || '') === 'Bank Transfer';
    if (ledgerFilter === 'CREDIT') return (l.payment_mode || '').toLowerCase().includes('credit');
    if (ledgerFilter === 'INTERNAL') return (l.payment_mode || '').toLowerCase().includes('internal') || (l.payment_mode || '').toLowerCase().includes('free');
    return true;
  });
  
  const [fees, setFees] = useState<Fee[]>(initialFees);
  const [payroll, setPayroll] = useState<Payroll[]>(initialPayroll);
  const [loading, setLoading] = useState(false);

  // Deduplication rate-limiting trackers
  const [lastSubmittedFee, setLastSubmittedFee] = useState<{ studentId: string, amount: string, desc: string, timestamp: number } | null>(null);
  const [lastSubmittedJournal, setLastSubmittedJournal] = useState<{ accountId: string, amount: string, desc: string, type: string, timestamp: number } | null>(null);
  const [lastSubmittedPayroll, setLastSubmittedPayroll] = useState<{ employeeId: string, month: string, timestamp: number } | null>(null);

  const [accounts, setAccounts] = useState<Account[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bs_chart_of_accounts_v1");
      if (saved) return JSON.parse(saved);
    }
    return initialAccounts;
  });

  const [journal, setJournal] = useState<Journal[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bs_journal_entries_v1");
      if (saved) return JSON.parse(saved);
    }
    return initialJournal;
  });

  // Ledger Category Subtab
  const [subTab, setSubTab] = useState<'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'>('Asset');

  // Form states for creating new accounts
  const [newAccountCode, setNewAccountCode] = useState("");
  const [newAccountName, setNewAccountName] = useState("");

  // Active Modals state
  const [challanFee, setChallanFee] = useState<Fee | null>(null);
  const [salarySlip, setSalarySlip] = useState<Payroll | null>(null);

  // Edit states
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);

  // Fee Form
  const [feeAmount, setFeeAmount] = useState("");
  const [feeDesc, setFeeDesc] = useState("");
  const [studentId, setStudentId] = useState("");

  // Ledger Form
  const [accountId, setAccountId] = useState("");
  const [journalAmount, setJournalAmount] = useState("");
  const [journalType, setJournalType] = useState("Debit");
  const [journalDesc, setJournalDesc] = useState("");

  // Payroll Form
  const [payEmployeeId, setPayEmployeeId] = useState("");
  const [payMonth, setPayMonth] = useState("");
  const [allowances, setAllowances] = useState("0");
  const [deductions, setDeductions] = useState("0");

  // New Adv Finance states
  const [selectedCashbookAccount, setSelectedCashbookAccount] = useState("all");
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  // Journal Voucher Modal form state
  const [jeDate, setJeDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [jeDescription, setJeDescription] = useState("");
  const [jeLines, setJeLines] = useState<Array<{ accountId: string; debit: string; credit: string; memo: string; }>>([
    { accountId: "", debit: "", credit: "", memo: "" },
    { accountId: "", debit: "", credit: "", memo: "" }
  ]);

  // Payment Voucher Modal form state
  const [payFromAccount, setPayFromAccount] = useState("");
  const [payToAccount, setPayToAccount] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payDesc, setPayDesc] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Add Bank Account Form state
  const [bankAccCode, setBankAccCode] = useState("");
  const [bankAccName, setBankAccName] = useState("");

  const [viewingVoucher, setViewingVoucher] = useState<JournalGroup | null>(null);

  // Sync initial props
  useEffect(() => {
    setFees(initialFees);
    setPayroll(initialPayroll);
    if (typeof window !== "undefined" && !localStorage.getItem("bs_chart_of_accounts_v1")) {
      setAccounts(initialAccounts);
    }
    if (typeof window !== "undefined" && !localStorage.getItem("bs_journal_entries_v1")) {
      setJournal(initialJournal);
    }
  }, [initialFees, initialPayroll, initialAccounts, initialJournal]);

  // Sync data from database on mount if tables exist
  useEffect(() => {
    async function syncData() {
      // 1. Sync Accounts
      const { data: dbAccounts, error: accError } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('code', { ascending: true });
      if (!accError && dbAccounts && dbAccounts.length > 0) {
        setAccounts(dbAccounts);
        localStorage.setItem("bs_chart_of_accounts_v1", JSON.stringify(dbAccounts));
      }

      // 2. Sync Journal
      const { data: dbJournal, error: jError } = await supabase
        .from('journal_entries')
        .select('*, chart_of_accounts(name, code, type)')
        .order('entry_date', { ascending: false });
      if (!jError && dbJournal && dbJournal.length > 0) {
        setJournal(dbJournal as unknown as Journal[]);
        localStorage.setItem("bs_journal_entries_v1", JSON.stringify(dbJournal));
      }
    }
    syncData();
  }, [supabase]);

  // Broadcast Channel Cross-Tab Sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    const bc = new BroadcastChannel("finance_local_sync");
    bc.onmessage = (event) => {
      if (event.data.type === "SYNC_ACCOUNTS") {
        setAccounts(event.data.data);
      } else if (event.data.type === "SYNC_JOURNAL") {
        setJournal(event.data.data);
      }
    };
    return () => { bc.close(); };
  }, []);

  useEffect(() => {
    // Realtime subscriptions
    const channel = supabase.channel('finance_sync_v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fees' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setFees((prev) => {
            // Find duplicate by ID or same content created within 5 seconds to replace local temp row
            const isDuplicate = prev.find(f => 
              f.id === payload.new.id || 
              (f.amount === payload.new.amount && 
               f.description === payload.new.description && 
               f.student_id === payload.new.student_id &&
               Math.abs(Date.now() - new Date(f.created_at).getTime()) < 5000)
            );
            if (isDuplicate) {
              return prev.map(f => f.id === isDuplicate.id ? (payload.new as Fee) : f);
            }
            return [payload.new as Fee, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setFees((prev) => prev.map(f => f.id === payload.new.id ? payload.new as Fee : f));
        } else if (payload.eventType === 'DELETE') {
          setFees((prev) => prev.filter(f => f.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chart_of_accounts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAccounts((prev) => {
            const updated = prev.find(a => a.id === payload.new.id) ? prev : [...prev, payload.new as Account];
            localStorage.setItem("bs_chart_of_accounts_v1", JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'UPDATE') {
          setAccounts((prev) => {
            const updated = prev.map(a => a.id === payload.new.id ? payload.new as Account : a);
            localStorage.setItem("bs_chart_of_accounts_v1", JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'DELETE') {
          setAccounts((prev) => {
            const updated = prev.filter(a => a.id !== payload.old.id);
            localStorage.setItem("bs_chart_of_accounts_v1", JSON.stringify(updated));
            return updated;
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entries' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setJournal((prev) => {
            const isDuplicate = prev.find(j => 
              j.id === payload.new.id || 
              (Number(j.amount) === Number(payload.new.amount) && 
               j.description === payload.new.description && 
               j.account_id === payload.new.account_id &&
               Math.abs(Date.now() - new Date(j.entry_date).getTime()) < 5000)
            );
            if (isDuplicate) {
              return prev.map(j => j.id === isDuplicate.id ? { ...payload.new, chart_of_accounts: j.chart_of_accounts } as unknown as Journal : j);
            }
            // Look up account details locally if not populated on join
            const acc = accounts.find(a => a.id === payload.new.account_id);
            const mapped = {
              ...payload.new,
              chart_of_accounts: acc ? { name: acc.name, code: acc.code, type: acc.type } : null
            } as unknown as Journal;
            const updated = [mapped, ...prev];
            localStorage.setItem("bs_journal_entries_v1", JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'UPDATE') {
          setJournal((prev) => {
            const updated = prev.map(j => j.id === payload.new.id ? payload.new as unknown as Journal : j);
            localStorage.setItem("bs_journal_entries_v1", JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'DELETE') {
          setJournal((prev) => {
            const updated = prev.filter(j => j.id !== payload.old.id);
            localStorage.setItem("bs_journal_entries_v1", JSON.stringify(updated));
            return updated;
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payroll' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPayroll((prev) => {
            const isDuplicate = prev.find(p => 
              p.id === payload.new.id || 
              (p.employee_id === payload.new.employee_id && 
               p.month_year === payload.new.month_year &&
               Math.abs(Date.now() - new Date(p.payment_date).getTime()) < 5000)
            );
            if (isDuplicate) {
              return prev.map(p => p.id === isDuplicate.id ? { ...payload.new, employees: p.employees } as unknown as Payroll : p);
            }
            const emp = employeesList.find(e => e.id === payload.new.employee_id);
            const mapped = {
              ...payload.new,
              employees: emp ? { employee_code: emp.employee_code, profiles: { full_name: emp.name || emp.profiles?.full_name || "" } } : null
            } as unknown as Payroll;
            return [mapped, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setPayroll((prev) => prev.map(p => p.id === payload.new.id ? payload.new as unknown as Payroll : p));
        } else if (payload.eventType === 'DELETE') {
          setPayroll((prev) => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [accounts, employeesList]);

  // Handlers
  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Deduplication check: limit same fee submission within 3 seconds
    const now = Date.now();
    if (lastSubmittedFee && 
        lastSubmittedFee.studentId === studentId && 
        lastSubmittedFee.amount === feeAmount && 
        lastSubmittedFee.desc === feeDesc && 
        now - lastSubmittedFee.timestamp < 3000) {
      return;
    }
    setLastSubmittedFee({ studentId, amount: feeAmount, desc: feeDesc, timestamp: now });
    setLoading(true);

    let sName: string | null = null, sId: number | null = null;
    if (studentId) { sId = parseInt(studentId, 10); sName = studentsList.find(s => s.id === sId)?.name; }
    
    const payload = { id: Date.now(), amount: parseInt(feeAmount), description: feeDesc, student_id: sId, student_name: sName || 'General Income', created_at: new Date().toISOString() };
    setFees(prev => [payload as Fee, ...prev]);
    
    await supabase.from('fees').insert([{ amount: parseInt(feeAmount), description: feeDesc, student_id: sId, student_name: sName || 'General Income' }]);
    setFeeAmount(""); setFeeDesc(""); setLoading(false);
  };

  const handleSaveEditFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee) return;
    setFees(prev => prev.map(f => f.id === editingFee.id ? editingFee : f));
    await supabase.from('fees').update({ amount: editingFee.amount, description: editingFee.description, student_name: editingFee.student_name }).eq('id', editingFee.id);
    setEditingFee(null);
  };

  const handleDeleteFee = async (id: number) => {
    if (!confirm(isUrdu ? "کیا آپ واقعی اس فیس ریکارڈ کو حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this fee record?")) return;
    setFees(fees.filter(f => f.id !== id));
    await supabase.from('fees').delete().eq('id', id);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountCode || !newAccountName) return;
    setLoading(true);

    const newAcc: Account = {
      id: "acc_local_" + Date.now(),
      code: newAccountCode,
      name: newAccountName,
      type: subTab
    };

    setAccounts(prev => {
      const updated = [...prev, newAcc];
      localStorage.setItem("bs_chart_of_accounts_v1", JSON.stringify(updated));
      return updated;
    });

    await supabase.from('chart_of_accounts').insert([{
      code: newAccountCode,
      name: newAccountName,
      type: subTab
    }]);

    if (typeof window !== "undefined") {
      const bc = new BroadcastChannel("finance_local_sync");
      bc.postMessage({ type: "SYNC_ACCOUNTS", data: [...accounts, newAcc] });
      bc.close();
    }

    setNewAccountCode("");
    setNewAccountName("");
    setLoading(false);
  };

  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Deduplication check: limit same journal entry within 3 seconds
    const now = Date.now();
    if (lastSubmittedJournal && 
        lastSubmittedJournal.accountId === accountId && 
        lastSubmittedJournal.amount === journalAmount && 
        lastSubmittedJournal.desc === journalDesc && 
        lastSubmittedJournal.type === journalType && 
        now - lastSubmittedJournal.timestamp < 3000) {
      return;
    }
    setLastSubmittedJournal({ accountId, amount: journalAmount, desc: journalDesc, type: journalType, timestamp: now });
    setLoading(true);

    const acc = accounts.find(a => a.id === accountId);
    if (!acc) { setLoading(false); return; }

    const entryId = "j_local_" + Date.now();
    const entryDate = new Date().toISOString();
    const payload: Journal = {
      id: entryId,
      account_id: accountId,
      amount: parseInt(journalAmount),
      type: journalType,
      description: journalDesc,
      entry_date: entryDate,
      chart_of_accounts: { name: acc.name, code: acc.code, type: acc.type }
    };

    setJournal(prev => {
      const updated = [payload, ...prev];
      localStorage.setItem("bs_journal_entries_v1", JSON.stringify(updated));
      return updated;
    });

    const dbPayload: any = { amount: parseInt(journalAmount), type: journalType, description: journalDesc, entry_date: entryDate.split('T')[0] };
    
    if (accountId.includes('-') || accountId.length > 15) {
      dbPayload.account_id = accountId;
    } else {
      const { data: dbAcc } = await supabase.from('chart_of_accounts').select('id').eq('code', acc.code).single();
      if (dbAcc) {
        dbPayload.account_id = dbAcc.id;
      } else {
        const { data: newDbAcc } = await supabase.from('chart_of_accounts').insert([{ code: acc.code, name: acc.name, type: acc.type }]).select('id').single();
        if (newDbAcc) {
          dbPayload.account_id = newDbAcc.id;
        }
      }
    }

    if (dbPayload.account_id) {
      await supabase.from('journal_entries').insert([dbPayload]);
    }

    if (typeof window !== "undefined") {
      const bc = new BroadcastChannel("finance_local_sync");
      bc.postMessage({ type: "SYNC_JOURNAL", data: [payload, ...journal] });
      bc.close();
    }

    setJournalAmount("");
    setJournalDesc("");
    setLoading(false);
  };

  // ── Advanced Finance Handlers ────────────────────────────────
  const handlePostMultiLineJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    let totalDebit = 0;
    let totalCredit = 0;
    const linesToPost = jeLines.filter(l => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0));
    
    if (linesToPost.length < 2) {
      alert(isUrdu ? "کم از کم 2 اکاؤنٹس منتخب کرنا لازمی ہے۔" : "Must allocate at least 2 account lines.");
      return;
    }

    linesToPost.forEach(line => {
      totalDebit += parseFloat(line.debit) || 0;
      totalCredit += parseFloat(line.credit) || 0;
    });

    if (Math.abs(totalDebit - totalCredit) > 0.01 || totalDebit === 0) {
      alert(isUrdu ? "ڈیبٹ اور کریڈٹ برابر اور صفر سے زیادہ ہونے چاہئیں۔" : "Debits and Credits must balance and be greater than zero.");
      return;
    }

    setLoading(true);

    const voucherNo = `JE-${Math.floor(100000 + Math.random() * 900000)}`;
    const postingDate = jeDate || new Date().toISOString().split('T')[0];
    const fullNarrative = `[${voucherNo}] ${jeDescription}`;

    const newRowsToSave: any[] = [];
    const localJournalEntries: Journal[] = [];

    for (const line of linesToPost) {
      const acc = accounts.find(a => a.id === line.accountId || a.code === line.accountId);
      if (!acc) continue;

      const amt = parseFloat(line.debit) > 0 ? parseFloat(line.debit) : parseFloat(line.credit);
      const entryType = parseFloat(line.debit) > 0 ? 'Debit' : 'Credit';
      const lineMemo = line.memo ? ` (${line.memo})` : '';

      const localId = "j_multi_" + Math.random().toString(36).substring(2, 9);
      const localEntry: Journal = {
        id: localId,
        account_id: acc.id,
        amount: amt,
        type: entryType,
        description: `${fullNarrative}${lineMemo}`,
        entry_date: postingDate,
        chart_of_accounts: { name: acc.name, code: acc.code, type: acc.type }
      };

      localJournalEntries.push(localEntry);
      newRowsToSave.push({
        account_id: acc.id,
        amount: amt,
        type: entryType,
        description: `${fullNarrative}${lineMemo}`,
        entry_date: postingDate
      });
    }

    setJournal(prev => {
      const updated = [...localJournalEntries, ...prev];
      localStorage.setItem("bs_journal_entries_v1", JSON.stringify(updated));
      return updated;
    });

    const { error } = await supabase.from('journal_entries').insert(newRowsToSave);
    if (error) {
      console.error("Error inserting journal entries:", error);
    }

    if (typeof window !== "undefined") {
      const bc = new BroadcastChannel("finance_local_sync");
      bc.postMessage({ type: "SYNC_JOURNAL", data: [...localJournalEntries, ...journal] });
      bc.close();
    }

    setJeDescription("");
    setJeLines([
      { accountId: "", debit: "", credit: "", memo: "" },
      { accountId: "", debit: "", credit: "", memo: "" }
    ]);
    setIsJournalModalOpen(false);
    setLoading(false);
  };

  const handlePostPaymentVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!payFromAccount || !payToAccount || !payAmount || !payDesc) {
      alert(isUrdu ? "براہ کرم تمام معلومات درج کریں۔" : "Please fill in all fields.");
      return;
    }

    setLoading(true);

    const fromAcc = accounts.find(a => a.id === payFromAccount || a.code === payFromAccount);
    const toAcc = accounts.find(a => a.id === payToAccount || a.code === payToAccount);

    if (!fromAcc || !toAcc) {
      setLoading(false);
      return;
    }

    const amt = parseFloat(payAmount);
    const voucherNo = `PV-${Math.floor(100000 + Math.random() * 900000)}`;
    const postingDate = payDate || new Date().toISOString().split('T')[0];
    const baseNarrative = `[${voucherNo}] ${payDesc}`;

    const row1LocalId = "j_pv1_" + Math.random().toString(36).substring(2, 9);
    const row2LocalId = "j_pv2_" + Math.random().toString(36).substring(2, 9);

    const localEntry1: Journal = {
      id: row1LocalId,
      account_id: toAcc.id,
      amount: amt,
      type: 'Debit',
      description: baseNarrative,
      entry_date: postingDate,
      chart_of_accounts: { name: toAcc.name, code: toAcc.code, type: toAcc.type }
    };

    const localEntry2: Journal = {
      id: row2LocalId,
      account_id: fromAcc.id,
      amount: amt,
      type: 'Credit',
      description: baseNarrative,
      entry_date: postingDate,
      chart_of_accounts: { name: fromAcc.name, code: fromAcc.code, type: fromAcc.type }
    };

    const localEntries = [localEntry1, localEntry2];

    setJournal(prev => {
      const updated = [...localEntries, ...prev];
      localStorage.setItem("bs_journal_entries_v1", JSON.stringify(updated));
      return updated;
    });

    const dbPayload = [
      { account_id: toAcc.id, amount: amt, type: 'Debit', description: baseNarrative, entry_date: postingDate },
      { account_id: fromAcc.id, amount: amt, type: 'Credit', description: baseNarrative, entry_date: postingDate }
    ];

    await supabase.from('journal_entries').insert(dbPayload);

    if (typeof window !== "undefined") {
      const bc = new BroadcastChannel("finance_local_sync");
      bc.postMessage({ type: "SYNC_JOURNAL", data: [...localEntries, ...journal] });
      bc.close();
    }

    setPayAmount("");
    setPayDesc("");
    setIsPaymentModalOpen(false);
    setLoading(false);
  };

  const handleCreateBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccCode || !bankAccName) return;

    setLoading(true);

    const newAcc: Account = {
      id: "acc_bank_" + Date.now(),
      code: bankAccCode,
      name: bankAccName,
      type: 'Asset'
    };

    setAccounts(prev => {
      const updated = [...prev, newAcc];
      localStorage.setItem("bs_chart_of_accounts_v1", JSON.stringify(updated));
      return updated;
    });

    await supabase.from('chart_of_accounts').insert([{
      code: bankAccCode,
      name: bankAccName,
      type: 'Asset'
    }]);

    if (typeof window !== "undefined") {
      const bc = new BroadcastChannel("finance_local_sync");
      bc.postMessage({ type: "SYNC_ACCOUNTS", data: [...accounts, newAcc] });
      bc.close();
    }

    setBankAccCode("");
    setBankAccName("");
    setIsAddAccountModalOpen(false);
    setLoading(false);
  };

  // Grouped journals helper for display list
  const getGroupedJournalEntries = () => {
    const groups: { [key: string]: JournalGroup } = {};
    
    journal.forEach(j => {
      const desc = j.description || '';
      const match = desc.match(/^\[([A-Z0-9\-]+)\]\s*(.*)$/);
      const acc = j.chart_of_accounts || accounts.find(a => a.id === j.account_id || a.code === j.account_id);
      
      if (match) {
        const voucherNo = match[1];
        const narrative = match[2];
        
        if (!groups[voucherNo]) {
          groups[voucherNo] = {
            id: voucherNo,
            entryNo: voucherNo,
            entry_date: j.entry_date,
            description: narrative,
            lines: []
          };
        }
        
        groups[voucherNo].lines.push({
          id: j.id,
          account_id: j.account_id,
          account_name: acc?.name || 'Unknown Account',
          account_code: acc?.code || '',
          type: j.type as 'Debit' | 'Credit',
          amount: Number(j.amount),
          description: j.description
        });
      } else {
        const voucherNo = `VOU-${j.id.substring(0, 8)}`;
        groups[voucherNo] = {
          id: j.id,
          entryNo: voucherNo,
          entry_date: j.entry_date,
          description: desc,
          lines: [{
            id: j.id,
            account_id: j.account_id,
            account_name: acc?.name || 'Unknown Account',
            account_code: acc?.code || '',
            type: j.type as 'Debit' | 'Credit',
            amount: Number(j.amount),
            description: desc
          }]
        };
      }
    });
    
    return Object.values(groups).sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
  };

  type JournalGroup = {
    id: string;
    entryNo: string;
    entry_date: string;
    description: string;
    lines: Array<{
      id: string;
      account_id: string;
      account_name: string;
      account_code: string;
      type: 'Debit' | 'Credit';
      amount: number;
      description: string;
    }>;
  };

  const getCashbookTransactions = () => {
    const list: any[] = [];
    
    // 1. Journal entries affecting Cash & Banks
    journal.forEach(j => {
      const acc = accounts.find(a => a.id === j.account_id || a.code === j.account_id);
      if (!acc || acc.type !== 'Asset') return;
      const isCashOrBank = acc.name.toLowerCase().includes('cash') || acc.name.toLowerCase().includes('bank') || acc.name.toLowerCase().includes('mcb') || acc.name.toLowerCase().includes('meezan');
      if (!isCashOrBank) return;
      
      if (selectedCashbookAccount !== 'all' && acc.id !== selectedCashbookAccount) return;
      
      const desc = j.description || '';
      const match = desc.match(/^\[([A-Z0-9\-]+)\]\s*(.*)$/);
      const entryNo = match ? match[1] : `JE-${j.id.substring(0, 5)}`;
      const narrative = match ? match[2] : desc;
      
      list.push({
        id: j.id,
        date: j.entry_date,
        entryNo: entryNo,
        description: narrative,
        account_name: acc.name,
        debit: j.type === 'Debit' ? Number(j.amount) : 0,
        credit: j.type === 'Credit' ? Number(j.amount) : 0
      });
    });

    // 2. Inventory logs
    displayLogs.forEach(log => {
      const isCash = (log.cash_source || '').toLowerCase().includes('cash') || (log.payment_mode || '').toLowerCase().includes('cash');
      const isBank = (log.cash_source || '').toLowerCase().includes('bank') || (log.payment_mode || '').toLowerCase().includes('bank') || (log.payment_mode || '').toLowerCase().includes('transfer');
      if (!isCash && !isBank) return;
      
      const sourceAccount = accounts.find(a => 
        a.type === 'Asset' && 
        (isCash ? (a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('hand')) : (a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('meezan')))
      );
      if (!sourceAccount) return;
      
      if (selectedCashbookAccount !== 'all' && sourceAccount.id !== selectedCashbookAccount) return;
      
      const isReceipt = log.transaction_type === 'OUT';
      const isPayment = log.transaction_type === 'IN';
      
      list.push({
        id: `inv-${log.id}`,
        date: log.date,
        entryNo: `INV-${log.id}`,
        description: `${log.item_name} (${log.remarks || ''})`,
        account_name: sourceAccount.name,
        debit: isReceipt ? Number(log.total_amount) : 0,
        credit: isPayment ? Number(log.total_amount) : 0
      });
    });

    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let running = 0;
    list.forEach(item => {
      running += (item.debit - item.credit);
      item.runningBalance = running;
    });
    
    return list.reverse();
  };

  const handleSaveEditJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJournal) return;
    
    setJournal(prev => {
      const updated = prev.map(j => j.id === editingJournal.id ? editingJournal : j);
      localStorage.setItem("bs_journal_entries_v1", JSON.stringify(updated));
      return updated;
    });

    await supabase.from('journal_entries').update({ amount: editingJournal.amount, description: editingJournal.description, type: editingJournal.type }).eq('id', editingJournal.id);
    
    if (typeof window !== "undefined") {
      const bc = new BroadcastChannel("finance_local_sync");
      bc.postMessage({ type: "SYNC_JOURNAL", data: journal.map(j => j.id === editingJournal.id ? editingJournal : j) });
      bc.close();
    }

    setEditingJournal(null);
  };

  const handleDeleteJournal = async (id: string) => {
    if (!confirm(isUrdu ? "کیا آپ واقعی اس اینٹری کو حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this journal entry?")) return;
    
    setJournal(prev => {
      const updated = prev.filter(j => j.id !== id);
      localStorage.setItem("bs_journal_entries_v1", JSON.stringify(updated));
      return updated;
    });

    if (id.includes('-') || id.length > 15) {
      await supabase.from('journal_entries').delete().eq('id', id);
    }

    if (typeof window !== "undefined") {
      const bc = new BroadcastChannel("finance_local_sync");
      bc.postMessage({ type: "SYNC_JOURNAL", data: journal.filter(j => j.id !== id) });
      bc.close();
    }
  };

  const handleAddPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Deduplication check: limit same employee payroll within 3 seconds
    const now = Date.now();
    if (lastSubmittedPayroll && 
        lastSubmittedPayroll.employeeId === payEmployeeId && 
        lastSubmittedPayroll.month === payMonth && 
        now - lastSubmittedPayroll.timestamp < 3000) {
      return;
    }
    setLastSubmittedPayroll({ employeeId: payEmployeeId, month: payMonth, timestamp: now });
    setLoading(true);

    const emp = employeesList.find(e => e.id === payEmployeeId);
    const empName = emp?.profiles?.full_name || emp?.name || 'Prof. Muhammad Usman';

    const basic = emp?.base_salary || 50000;
    const allow = parseInt(allowances) || 0;
    const deduc = parseInt(deductions) || 0;
    const net = basic + allow - deduc;

    const payload = { id: Date.now().toString(), employee_id: payEmployeeId, month_year: payMonth || 'June 2026', basic_salary: basic, allowances: allow, deductions: deduc, net_salary: net, status: 'paid', payment_date: new Date().toISOString(), employees: { employee_code: emp?.employee_code || 'TCH-201', profiles: { full_name: empName } } };
    setPayroll(prev => [payload as unknown as Payroll, ...prev]);

    await supabase.from('payroll').insert([{ employee_id: payEmployeeId, month_year: payMonth || 'June 2026', basic_salary: basic, allowances: allow, deductions: deduc, net_salary: net, status: 'paid', payment_date: new Date().toISOString() }]);
    setLoading(false);
  };

  const handleSaveEditPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayroll) return;
    setPayroll(prev => prev.map(p => p.id === editingPayroll.id ? editingPayroll : p));
    await supabase.from('payroll').update({ net_salary: editingPayroll.net_salary, month_year: editingPayroll.month_year }).eq('id', editingPayroll.id);
    setEditingPayroll(null);
  };

  const handleDeletePayroll = async (id: string) => {
    if (!confirm(isUrdu ? "کیا آپ واقعی اس پے رول ہسٹری کو حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this payroll record?")) return;
    setPayroll(payroll.filter(p => p.id !== id));
    await supabase.from('payroll').delete().eq('id', id);
  };

  const handleSendWhatsAppFee = (fee: Fee) => {
    const text = encodeURIComponent(`🎓 *BRIGHT SCHOOL & MONTESSORI SYSTEM*\n\nDear Parent,\nThis is an official confirmation that the fee for student *${fee.student_name || 'Student'}* (Amount: Rs. ${fee.amount}) for *${fee.description}* has been successfully received.\n\nThank you!\nManagement, Bright School.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSendWhatsAppPayroll = (p: Payroll) => {
    const name = p.employees?.profiles?.full_name || 'Faculty Member';
    const text = encodeURIComponent(`💼 *BRIGHT SCHOOL & MONTESSORI SYSTEM*\n\nDear ${name},\nYour salary for *${p.month_year}* (Net Salary: Rs. ${p.net_salary}) has been processed and credited to your account.\n\nThank you for your dedication!\nPrincipal, Bright School.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to calculate total balances for all 5 categories
  const calculateBalances = () => {
    let assets = 0;
    let liabilities = 0;
    let equity = 0;
    let revenue = 0;
    let expenses = 0;

    journal.forEach(j => {
      const accDetails = j.chart_of_accounts || accounts.find(a => a.id === j.account_id || a.code === j.account_id);
      if (!accDetails) return;

      const type = accDetails.type;
      const amt = Number(j.amount || 0);

      if (type === 'Asset') {
        if (j.type === 'Debit') assets += amt;
        else assets -= amt;
      } else if (type === 'Liability') {
        if (j.type === 'Credit') liabilities += amt;
        else liabilities -= amt;
      } else if (type === 'Equity') {
        if (j.type === 'Credit') equity += amt;
        else equity -= amt;
      } else if (type === 'Revenue') {
        if (j.type === 'Credit') revenue += amt;
        else revenue -= amt;
      } else if (type === 'Expense') {
        if (j.type === 'Debit') expenses += amt;
        else expenses -= amt;
      }
    });

    return { assets, liabilities, equity, revenue, expenses };
  };

  const { assets, liabilities, equity, revenue, expenses } = calculateBalances();

  // Helper to calculate balance of a specific account
  const getAccountBalance = (accId: string, accType: string) => {
    let bal = 0;
    journal.filter(j => j.account_id === accId).forEach(j => {
      const amt = Number(j.amount || 0);
      if (accType === 'Asset' || accType === 'Expense') {
        if (j.type === 'Debit') bal += amt;
        else bal -= amt;
      } else {
        if (j.type === 'Credit') bal += amt;
        else bal -= amt;
      }
    });
    return bal;
  };

  return (
    <div className="flex-1 w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-challan, .printable-challan *, .printable-slip, .printable-slip * {
            visibility: visible !important;
          }
          .printable-challan, .printable-slip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* EDIT FEE MODAL */}
      {editingFee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print-btn">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200 dark:border-pink-900">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/30 border-b p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Pencil className="w-5 h-5 text-rose-600" />
                {isUrdu ? 'فیس اینٹری ایڈٹ کریں' : 'Edit Fee Record'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingFee(null)} className="rounded-full"><X className="w-5 h-5"/></Button>
            </CardHeader>
            <form onSubmit={handleSaveEditFee}>
              <CardContent className="p-6 space-y-4">
                <div><Label>{isUrdu ? 'طالب علم کا نام' : 'Student Name'}</Label><Input value={editingFee.student_name || ''} onChange={e => setEditingFee({ ...editingFee, student_name: e.target.value })} className="rounded-xl font-bold mt-1" /></div>
                <div><Label>{isUrdu ? 'رقم (Rs.)' : 'Amount (Rs.)'}</Label><Input type="number" value={editingFee.amount} onChange={e => setEditingFee({ ...editingFee, amount: parseInt(e.target.value) || 0 })} className="rounded-xl font-bold mt-1" /></div>
                <div><Label>{isUrdu ? 'تفصیل' : 'Description'}</Label><Input value={editingFee.description} onChange={e => setEditingFee({ ...editingFee, description: e.target.value })} className="rounded-xl font-bold mt-1" /></div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingFee(null)} className="rounded-xl font-bold">{isUrdu ? 'منسوخ' : 'Cancel'}</Button>
                  <Button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold">{isUrdu ? 'محفوظ کریں' : 'Save Changes'}</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* EDIT PAYROLL MODAL */}
      {editingPayroll && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print-btn">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200 dark:border-pink-900">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/30 border-b p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Pencil className="w-5 h-5 text-rose-600" />
                {isUrdu ? 'پے رول اینٹری ایڈٹ کریں' : 'Edit Payroll Record'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingPayroll(null)} className="rounded-full"><X className="w-5 h-5"/></Button>
            </CardHeader>
            <form onSubmit={handleSaveEditPayroll}>
              <CardContent className="p-6 space-y-4">
                <div><Label>{isUrdu ? 'مہینہ و سال' : 'Month & Year'}</Label><Input value={editingPayroll.month_year} onChange={e => setEditingPayroll({ ...editingPayroll, month_year: e.target.value })} className="rounded-xl font-bold mt-1" /></div>
                <div><Label>{isUrdu ? 'خالص تنخواہ (Net Salary)' : 'Net Salary (Rs.)'}</Label><Input type="number" value={editingPayroll.net_salary} onChange={e => setEditingPayroll({ ...editingPayroll, net_salary: parseInt(e.target.value) || 0 })} className="rounded-xl font-bold mt-1" /></div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingPayroll(null)} className="rounded-xl font-bold">{isUrdu ? 'منسوخ' : 'Cancel'}</Button>
                  <Button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold">{isUrdu ? 'محفوظ کریں' : 'Save Changes'}</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* PRINTABLE TEACHER SALARY SLIP MODAL */}
      {salarySlip && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-rose-300 dark:border-rose-800 space-y-6 printable-slip my-6">
            
            <div className="flex items-center justify-between no-print-btn border-b pb-3">
              <h3 className="font-black text-xl flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Receipt className="w-6 h-6 text-rose-600" />
                {isUrdu ? 'استاد کی سالانہ/ماہانہ پے رول سلپ' : 'Faculty Salary Payslip'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setSalarySlip(null)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* SALARY SLIP DOCUMENT SHEET */}
            <div className="border-2 border-slate-900 p-6 rounded-2xl space-y-6 bg-white text-slate-900 font-sans">
              <div className="flex items-center justify-between border-b-2 border-rose-600 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/school_logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                  <div>
                    <h4 className="font-black text-base uppercase text-slate-900">BRIGHT SCHOOL</h4>
                    <p className="text-xs font-bold text-rose-700 uppercase">& Montessori System</p>
                  </div>
                </div>
                <Badge className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1">PAID & VERIFIED</Badge>
              </div>

              <div className="bg-slate-100 p-4 rounded-xl text-xs space-y-2 border border-slate-300">
                <div className="flex justify-between"><span className="text-slate-500 font-semibold">Employee Name:</span><span className="font-black text-sm text-slate-900">{salarySlip.employees?.profiles?.full_name || 'Prof. Muhammad Usman'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-semibold">Employee Code:</span><span className="font-mono font-bold text-rose-700">{salarySlip.employees?.employee_code || 'TCH-201'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-semibold">Pay Period:</span><span className="font-bold text-slate-800">{salarySlip.month_year}</span></div>
              </div>

              <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-200 p-2 font-black flex justify-between"><span>Salary Breakdown</span><span>Amount</span></div>
                <div className="p-3 space-y-2 font-semibold">
                  <div className="flex justify-between"><span>Basic Salary</span><span>Rs. {salarySlip.basic_salary || 65000}</span></div>
                  <div className="flex justify-between text-emerald-600"><span>Allowances & Bonus</span><span>+ Rs. {salarySlip.allowances || 5000}</span></div>
                  <div className="flex justify-between text-rose-600"><span>Deductions / Tax</span><span>- Rs. {salarySlip.deductions || 0}</span></div>
                  <div className="flex justify-between font-black text-base text-slate-900 border-t border-slate-300 pt-2"><span>Net Payable Salary:</span><span className="text-emerald-700 font-mono">Rs. {salarySlip.net_salary}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 text-center text-xs">
                <div><div className="h-8 border-b border-slate-400"></div><span className="text-slate-500 font-bold block mt-1">Employee Signature</span></div>
                <div><div className="h-8 border-b border-rose-600 font-serif text-sm font-bold text-rose-700">Prof. Tariq Mahmood</div><span className="text-slate-500 font-bold block mt-1">Principal Official Seal</span></div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2 no-print-btn">
              <Button onClick={() => handleSendWhatsAppPayroll(salarySlip)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {isUrdu ? 'واٹس ایپ پر سلپ بھیجیں' : 'Send WhatsApp Slip'}
              </Button>
              <Button onClick={handlePrint} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 flex items-center gap-2">
                <Printer className="w-4 h-4" />
                {isUrdu ? 'سلپ پرنٹ کریں' : 'Print Salary Slip'}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE JOURNAL ENTRY MODAL */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto no-print-btn">
          <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200 dark:border-pink-900">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/30 border-b p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" />
                {isUrdu ? 'نیا جرنل اینٹری واؤچر بنائیں' : 'Create New Journal Entry Voucher'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsJournalModalOpen(false)} className="rounded-full"><X className="w-5 h-5"/></Button>
            </CardHeader>
            <form onSubmit={handlePostMultiLineJournal}>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">{isUrdu ? 'پوسٹنگ کی تاریخ' : 'Posting Date'}</Label>
                    <Input type="date" value={jeDate} onChange={e => setJeDate(e.target.value)} required className="rounded-xl mt-1 h-9 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">{isUrdu ? 'تفصیل / نریشن' : 'Voucher Narrative'}</Label>
                    <Input placeholder="e.g. Canteen commission received" value={jeDescription} onChange={e => setJeDescription(e.target.value)} required className="rounded-xl mt-1 h-9 text-xs" />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold grid grid-cols-12 gap-2 text-slate-700 dark:text-slate-200">
                    <span className="col-span-4">{isUrdu ? 'کھاتہ' : 'Account'}</span>
                    <span className="col-span-3">{isUrdu ? 'ڈیبٹ (+)' : 'Debit (Rs)'}</span>
                    <span className="col-span-3">{isUrdu ? 'کریڈٹ (-)' : 'Credit (Rs)'}</span>
                    <span className="col-span-2 text-center"></span>
                  </div>

                  <div className="p-2 space-y-2 max-h-[220px] overflow-y-auto">
                    {jeLines.map((line, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          <select
                            required
                            className="flex h-8 w-full rounded-lg border border-input bg-background px-2 text-[10px] font-bold"
                            value={line.accountId}
                            onChange={e => {
                              const updated = [...jeLines];
                              updated[idx].accountId = e.target.value;
                              setJeLines(updated);
                            }}
                          >
                            <option value="">{isUrdu ? 'کھاتہ منتخب کریں' : '-- Select --'}</option>
                            {accounts.map(a => (
                              <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={line.debit}
                            className="h-8 text-xs font-bold font-mono"
                            disabled={parseFloat(line.credit) > 0}
                            onChange={e => {
                              const updated = [...jeLines];
                              updated[idx].debit = e.target.value;
                              setJeLines(updated);
                            }}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={line.credit}
                            className="h-8 text-xs font-bold font-mono"
                            disabled={parseFloat(line.debit) > 0}
                            onChange={e => {
                              const updated = [...jeLines];
                              updated[idx].credit = e.target.value;
                              setJeLines(updated);
                            }}
                          />
                        </div>
                        <div className="col-span-2 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={jeLines.length <= 2}
                            onClick={() => setJeLines(jeLines.filter((_, i) => i !== idx))}
                            className="h-7 w-7 text-rose-600 hover:text-rose-700 rounded-full hover:bg-rose-50"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-dashed mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 text-xs font-bold rounded-lg"
                    onClick={() => setJeLines([...jeLines, { accountId: "", debit: "", credit: "", memo: "" }])}
                  >
                    + {isUrdu ? 'کھاتہ شامل کریں' : 'Add Line'}
                  </Button>
                  <div className="flex gap-4 text-xs font-bold text-right">
                    {(() => {
                      let deb = 0, cred = 0;
                      jeLines.forEach(l => {
                        deb += parseFloat(l.debit) || 0;
                        cred += parseFloat(l.credit) || 0;
                      });
                      const isBalanced = Math.abs(deb - cred) < 0.01 && deb > 0;
                      return (
                        <>
                          <div>
                            <span className="block text-[10px] text-muted-foreground">{isUrdu ? 'کل ڈیبٹ' : 'Total Debit'}</span>
                            <span className="text-emerald-600 font-mono">Rs. {deb.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-muted-foreground">{isUrdu ? 'کل کریڈٹ' : 'Total Credit'}</span>
                            <span className="text-rose-600 font-mono">Rs. {cred.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            {isBalanced ? (
                              <Badge className="bg-emerald-600 text-white font-bold">{isUrdu ? 'متوازن ✓' : 'Balanced ✓'}</Badge>
                            ) : (
                              <Badge variant="destructive" className="font-bold">{isUrdu ? 'غیر متوازن' : 'Unbalanced'}</Badge>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsJournalModalOpen(false)} className="rounded-xl font-bold">{isUrdu ? 'منسوخ' : 'Cancel'}</Button>
                  <Button
                    type="submit"
                    disabled={loading || !jeLines.some(l => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0))}
                    className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    {isUrdu ? 'پوسٹ واؤچر' : 'Post Voucher'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* RECORD PAYMENT VOUCHER MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print-btn">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200 dark:border-pink-900">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/30 border-b p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-600" />
                {isUrdu ? 'نیا ادائیگی / خرچہ واؤچر' : 'Record Payment / Expense Voucher'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsPaymentModalOpen(false)} className="rounded-full"><X className="w-5 h-5"/></Button>
            </CardHeader>
            <form onSubmit={handlePostPaymentVoucher}>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-xs">{isUrdu ? 'ادائیگی کا تاریخ' : 'Payment Date'}</Label>
                  <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} required className="rounded-xl mt-1 h-9 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">{isUrdu ? 'فنڈز کا ذریعہ (کھاتہ)' : 'Pay From (Asset Book)'}</Label>
                  <select
                    required
                    className="flex h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-bold mt-1"
                    value={payFromAccount}
                    onChange={e => setPayFromAccount(e.target.value)}
                  >
                    <option value="">{isUrdu ? 'کیش یا بینک منتخب کریں' : '-- Select Cash/Bank --'}</option>
                    {accounts.filter(a => a.type === 'Asset' && (a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('mcb') || a.name.toLowerCase().includes('meezan'))).map(a => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">{isUrdu ? 'خرچہ کھاتہ (Expense Account)' : 'Pay To (Expense Account)'}</Label>
                  <select
                    required
                    className="flex h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-bold mt-1"
                    value={payToAccount}
                    onChange={e => setPayToAccount(e.target.value)}
                  >
                    <option value="">{isUrdu ? 'خرچہ کیٹیگری منتخب کریں' : '-- Select Expense account --'}</option>
                    {accounts.filter(a => a.type === 'Expense').map(a => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">{isUrdu ? 'رقم (Amount)' : 'Payment Amount (Rs.)'}</Label>
                  <Input type="number" required placeholder="e.g. 15000" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="rounded-xl mt-1 h-9 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">{isUrdu ? 'تفصیل (Description)' : 'Narrative / Description'}</Label>
                  <Input required placeholder="e.g. Canteen utility bill paid" value={payDesc} onChange={e => setPayDesc(e.target.value)} className="rounded-xl mt-1 h-9 text-xs" />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)} className="rounded-xl font-bold">{isUrdu ? 'منسوخ' : 'Cancel'}</Button>
                  <Button type="submit" disabled={loading} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold">{isUrdu ? 'رپورٹ کریں' : 'Post Payment'}</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* ADD BANK ACCOUNT MODAL */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print-btn">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200 dark:border-pink-900">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/30 border-b p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Landmark className="w-5 h-5 text-rose-600" />
                {isUrdu ? 'نیا کیش/بینک کھاتہ شامل کریں' : 'Add Cash / Bank Account Asset'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAddAccountModalOpen(false)} className="rounded-full"><X className="w-5 h-5"/></Button>
            </CardHeader>
            <form onSubmit={handleCreateBankAccount}>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-xs">{isUrdu ? 'کھاتہ کوڈ (Code)' : 'Account Code (Asset nature 1xxx)'}</Label>
                  <Input required placeholder="e.g. 1006" value={bankAccCode} onChange={e => setBankAccCode(e.target.value)} className="rounded-xl mt-1 h-9 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">{isUrdu ? 'کھاتہ کا نام' : 'Account Name'}</Label>
                  <Input required placeholder="e.g. Habib Bank Ltd Account" value={bankAccName} onChange={e => setBankAccName(e.target.value)} className="rounded-xl mt-1 h-9 text-xs" />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddAccountModalOpen(false)} className="rounded-xl font-bold">{isUrdu ? 'منسوخ' : 'Cancel'}</Button>
                  <Button type="submit" disabled={loading} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold">{isUrdu ? 'کھاتہ کھولیں' : 'Add Account'}</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* VIEW JOURNAL ENTRY DETAILS MODAL */}
      {viewingVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto no-print-btn">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200 dark:border-pink-900">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/30 border-b p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Stamp className="w-5 h-5 text-rose-600" />
                {isUrdu ? `جرنل واؤچر کی تفصیل — ${viewingVoucher.entryNo}` : `Journal Voucher Details — ${viewingVoucher.entryNo}`}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setViewingVoucher(null)} className="rounded-full"><X className="w-5 h-5"/></Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div><span className="text-muted-foreground">{isUrdu ? 'واؤچر نمبر:' : 'Voucher No:'}</span> <strong className="text-slate-900 dark:text-slate-100">{viewingVoucher.entryNo}</strong></div>
                <div><span className="text-muted-foreground">{isUrdu ? 'تاریخ:' : 'Date:'}</span> <strong className="text-slate-900 dark:text-slate-100">{viewingVoucher.entry_date}</strong></div>
                <div className="col-span-2"><span className="text-muted-foreground">{isUrdu ? 'تفصیل / بیانیہ:' : 'Narrative / Description:'}</span> <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{viewingVoucher.description}</p></div>
              </div>

              <div className="border rounded-xl overflow-hidden mt-4">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/40">
                    <TableRow>
                      <TableHead className="pl-4 text-xs font-bold">{isUrdu ? 'کھاتہ کا نام' : 'Account Name'}</TableHead>
                      <TableHead className="text-right text-xs font-bold">{isUrdu ? 'ڈیبٹ (+)' : 'Debit'}</TableHead>
                      <TableHead className="text-right pr-4 text-xs font-bold">{isUrdu ? 'کریڈٹ (-)' : 'Credit'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs font-semibold">
                    {viewingVoucher.lines.map((line, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="pl-4 font-bold text-slate-800 dark:text-slate-200">
                          {line.account_name} ({line.account_code})
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 font-mono font-bold">
                          {line.type === 'Debit' ? `Rs. ${line.amount.toLocaleString()}` : '—'}
                        </TableCell>
                        <TableCell className="text-right pr-4 text-rose-600 font-mono font-bold">
                          {line.type === 'Credit' ? `Rs. ${line.amount.toLocaleString()}` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(() => {
                      const totalDeb = viewingVoucher.lines.reduce((s, l) => s + (l.type === 'Debit' ? l.amount : 0), 0);
                      return (
                        <TableRow className="bg-muted/30 font-black border-t-2">
                          <TableCell className="pl-4 text-[10px] uppercase">{isUrdu ? 'میزان مجموعی:' : 'Total balanced:'}</TableCell>
                          <TableCell className="text-right text-emerald-700 font-mono">Rs. {totalDeb.toLocaleString()}</TableCell>
                          <TableCell className="text-right pr-4 text-rose-700 font-mono">Rs. {totalDeb.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })()}
                  </TableBody>
                </Table>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={() => setViewingVoucher(null)} className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white px-6">
                  {isUrdu ? 'بند کریں' : 'Close'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PRINTABLE 3-COPY BANK FEE CHALLAN MODAL */}
      {challanFee && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-5xl w-full shadow-2xl border border-rose-300 dark:border-rose-800 space-y-6 printable-challan my-6">
            
            <div className="flex items-center justify-between no-print-btn border-b pb-3">
              <h3 className="font-black text-xl flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Receipt className="w-6 h-6 text-rose-600" />
                {isUrdu ? 'آفیشل 3-کاپی بینک فیس چالان' : 'Official 3-Copy Bank Fee Voucher'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setChallanFee(null)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* 3-COLUMN BANK VOUCHER PRINT SHEET */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-slate-900 p-4 rounded-2xl bg-white text-slate-900 font-sans">
              {['BANK COPY', 'SCHOOL COPY', 'STUDENT COPY'].map((copyTitle, cIdx) => (
                <div key={cIdx} className={`space-y-3 p-3 rounded-xl border border-slate-300 relative ${cIdx < 2 ? 'md:border-r-2 md:border-dashed md:border-slate-400' : ''}`}>
                  <div className="text-center space-y-1 border-b border-slate-300 pb-2">
                    <div className="flex items-center justify-center gap-2">
                      <img src="/school_logo.png" alt="Logo" className="w-7 h-7 object-contain" />
                      <span className="font-black text-xs uppercase tracking-tighter">BRIGHT SCHOOL</span>
                    </div>
                    <p className="text-[9px] font-bold text-rose-700 uppercase">& Montessori System</p>
                    <Badge className="bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">{copyTitle}</Badge>
                  </div>

                  <div className="bg-slate-100 p-2 rounded text-[9px] font-semibold space-y-0.5 border border-slate-200">
                    <div className="flex justify-between"><span>Bank:</span><span className="font-bold text-slate-900">Meezan Bank Ltd</span></div>
                    <div className="flex justify-between"><span>A/C Title:</span><span className="font-bold">Bright School Education</span></div>
                    <div className="flex justify-between"><span>A/C No:</span><span className="font-mono font-bold text-rose-700">0294-0104920194</span></div>
                  </div>

                  <div className="text-[10px] space-y-1">
                    <div className="flex justify-between border-b border-slate-100 pb-0.5"><span className="text-slate-500 font-medium">Challan No:</span><span className="font-mono font-bold text-slate-900">CHL-{challanFee.id.toString().substring(0, 6)}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-0.5"><span className="text-slate-500 font-medium">Student:</span><span className="font-bold text-slate-900 truncate max-w-[120px]">{challanFee.student_name || 'Muhammad Ali'}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-0.5"><span className="text-slate-500 font-medium">Due Date:</span><span className="font-mono font-bold text-rose-600">10-JUL-2026</span></div>
                  </div>

                  <div className="text-[9px] border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-200 p-1 font-bold flex justify-between"><span>Particulars</span><span>Amount</span></div>
                    <div className="p-1.5 space-y-1">
                      <div className="flex justify-between"><span>Tuition / Monthly Fee</span><span>Rs. {challanFee.amount}</span></div>
                      <div className="flex justify-between text-slate-500"><span>Exam & Lab Charges</span><span>Rs. 500</span></div>
                      <div className="flex justify-between font-bold border-t border-slate-300 pt-1 text-slate-900"><span>Total Payable:</span><span className="text-rose-700">Rs. {challanFee.amount + 500}</span></div>
                    </div>
                  </div>

                  <div className="pt-2 text-[8px] flex justify-between items-end">
                    <div><span className="block text-slate-400">Depositor Sign: ________</span></div>
                    <div className="w-12 h-12 rounded border border-dashed border-slate-400 flex items-center justify-center text-[7px] text-slate-400 font-bold text-center">BANK STAMP</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2 no-print-btn">
              <Button onClick={() => handleSendWhatsAppFee(challanFee)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {isUrdu ? 'واٹس ایپ پر رسیپٹ بھیجیں' : 'Send WhatsApp Receipt'}
              </Button>
              <Button onClick={handlePrint} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 flex items-center gap-2">
                <Printer className="w-4 h-4" />
                {isUrdu ? '3-کاپی بینک چالان پرنٹ کریں' : 'Print 3-Copy Challan'}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Avatar className="h-9 w-9 border border-border shadow-sm"><AvatarImage src="/admin_avatar.png" /><AvatarFallback>SA</AvatarFallback></Avatar>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-rose-600" /> {isUrdu ? 'مالیات و فیس مینجمنٹ' : 'Finance & Accounting'}
            </h1>
            <p className="text-muted-foreground mt-1">{isUrdu ? 'فیس کی وصولی، چالان پرنٹنگ اور پے رول ہسٹری' : 'Manage fees, vouchers, payroll, and general ledger.'}</p>
          </div>
          <div className="bg-muted p-1.5 rounded-2xl flex border border-border/50 max-w-3xl print:hidden overflow-x-auto gap-1">
            <button onClick={() => setActiveTab('fees')} className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'fees' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>Fees & Dues</button>
            <button onClick={() => setActiveTab('payroll')} className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'payroll' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>Payroll & Slips</button>
            <button onClick={() => setActiveTab('cashbook')} className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'cashbook' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>{isUrdu ? 'کیش بک (Cash Book)' : 'Cash Book'}</button>
            <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'ledger' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>General Ledger</button>
            <button onClick={() => setActiveTab('trial_balance')} className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'trial_balance' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>{isUrdu ? 'ٹرائل بیلنس' : 'Trial Balance'}</button>
            <button onClick={() => setActiveTab('statements')} className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'statements' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>{isUrdu ? 'فنانشل گوشوارے' : 'Financial Statements'}</button>
          </div>
        </div>

        {activeTab === 'fees' && (
          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-1 border-border shadow-sm bg-card h-fit">
              <CardHeader className="bg-muted/50 border-b border-border"><CardTitle>Collect Fee</CardTitle></CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleAddFee} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Student</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" onChange={(e) => setStudentId(e.target.value)}>
                      <option value="">General Income</option>
                      {studentsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Amount (Rs.)</Label><Input type="number" required value={feeAmount} onChange={e => setFeeAmount(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Description</Label><Input required value={feeDesc} onChange={e => setFeeDesc(e.target.value)} /></div>
                  <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : "Collect Fee"}</Button>
                </form>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2 border-border shadow-sm bg-card h-fit overflow-hidden">
              <CardHeader className="bg-muted/50 border-b border-border"><CardTitle>Revenue & Fee Vouchers</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table><TableHeader><TableRow><TableHead className="pl-4">Receipt #</TableHead><TableHead>Student Name</TableHead><TableHead>Amount</TableHead><TableHead className="text-right pr-4">Actions & Vouchers</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[...fees].sort((a, b) => Number(b.id) - Number(a.id)).map(f => (
                    <TableRow key={f.id}>
                      <TableCell className="pl-4 font-mono font-bold text-xs text-rose-600">#{f.id}</TableCell>
                      <TableCell className="font-bold">{f.student_name || 'General Income'}</TableCell>
                      <TableCell className="text-emerald-600 font-black">Rs. {f.amount}</TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 3-COPY CHALLAN BUTTON */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 rounded-xl border-amber-300 hover:bg-amber-50 text-amber-700 font-bold text-xs flex items-center gap-1"
                            onClick={() => setChallanFee(f)}
                            title="Print 3-Copy Bank Challan"
                          >
                            <Receipt className="w-3.5 h-3.5 text-amber-600" />
                            <span>Challan</span>
                          </Button>

                          {/* WHATSAPP RECEIPT BUTTON */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 rounded-xl border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1"
                            onClick={() => handleSendWhatsAppFee(f)}
                            title="Send WhatsApp Receipt"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </Button>

                          {/* EDIT BUTTON */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 rounded-xl border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs"
                            onClick={() => setEditingFee(f)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {/* DELETE BUTTON */}
                          <Button variant="destructive" size="sm" className="h-8 px-2 rounded-xl" onClick={() => handleDeleteFee(f.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-1 border-border shadow-sm bg-card h-fit">
              <CardHeader className="bg-muted/50 border-b border-border"><CardTitle>Process Payroll</CardTitle></CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleAddPayroll} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Employee</Label>
                    <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3" onChange={(e) => setPayEmployeeId(e.target.value)}>
                      <option value="">Select...</option>
                      {employeesList.map(e => <option key={e.id} value={e.id}>{e.profiles?.full_name || e.name || 'Staff Member'} ({e.employee_code || e.id})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Month-Year (MM-YYYY)</Label><Input required value={payMonth} onChange={e => setPayMonth(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Allowances (Rs.)</Label><Input type="number" value={allowances} onChange={e => setAllowances(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Deductions (Rs.)</Label><Input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} /></div>
                  <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : "Generate Salary Slip"}</Button>
                </form>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2 border-border shadow-sm bg-card h-fit overflow-hidden">
              <CardHeader className="bg-muted/50 border-b border-border"><CardTitle>Payroll History & Salary Slips</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table><TableHeader><TableRow><TableHead className="pl-4">Employee</TableHead><TableHead>Month</TableHead><TableHead>Net Salary</TableHead><TableHead className="text-right pr-4">Actions & Slips</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[...payroll].sort((a, b) => Number(b.id) - Number(a.id)).map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-4 font-bold">{p.employees?.profiles?.full_name || 'Prof. Muhammad Usman'}</TableCell>
                      <TableCell className="font-semibold text-xs text-muted-foreground">{p.month_year}</TableCell>
                      <TableCell className="text-emerald-600 font-black">Rs. {p.net_salary}</TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* SALARY SLIP PRINT BUTTON */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 rounded-xl border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1"
                            onClick={() => setSalarySlip(p)}
                            title="Print Faculty Salary Slip"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Salary Slip</span>
                          </Button>

                          {/* WHATSAPP PAYROLL BUTTON */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 rounded-xl border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold text-xs"
                            onClick={() => handleSendWhatsAppPayroll(p)}
                            title="Send WhatsApp Salary Slip"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          </Button>

                          {/* EDIT BUTTON */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 rounded-xl border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs"
                            onClick={() => setEditingPayroll(p)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {/* DELETE BUTTON */}
                          <Button variant="destructive" size="sm" className="h-8 px-2 rounded-xl" onClick={() => handleDeletePayroll(p.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. Summary Cards Grid */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5 print:hidden">
              <Card className="bg-emerald-500/[0.02] border-emerald-500/20 dark:border-emerald-500/10">
                <CardContent className="p-4 flex flex-col justify-between h-24">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider">{isUrdu ? "اثاثے (Assets)" : "Total Assets"}</p>
                  <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 truncate">Rs. {assets.toLocaleString()}</h3>
                </CardContent>
              </Card>
              <Card className="bg-rose-500/[0.02] border-rose-500/20 dark:border-rose-500/10">
                <CardContent className="p-4 flex flex-col justify-between h-24">
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-black uppercase tracking-wider">{isUrdu ? "واجبات (Liabilities)" : "Total Liabilities"}</p>
                  <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 truncate">Rs. {liabilities.toLocaleString()}</h3>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/[0.02] border-blue-500/20 dark:border-blue-500/10">
                <CardContent className="p-4 flex flex-col justify-between h-24">
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider">{isUrdu ? "سرمایہ (Equity)" : "Total Equity"}</p>
                  <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 truncate">Rs. {equity.toLocaleString()}</h3>
                </CardContent>
              </Card>
              <Card className="bg-amber-500/[0.02] border-amber-500/20 dark:border-amber-500/10">
                <CardContent className="p-4 flex flex-col justify-between h-24">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">{isUrdu ? "ریونیو / آمدنی (Income)" : "Total Revenue"}</p>
                  <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 truncate">Rs. {revenue.toLocaleString()}</h3>
                </CardContent>
              </Card>
              <Card className="bg-orange-500/[0.02] border-orange-500/20 dark:border-orange-500/10">
                <CardContent className="p-4 flex flex-col justify-between h-24">
                  <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-wider">{isUrdu ? "اخراجات (Expenses)" : "Total Expenses"}</p>
                  <h3 className="text-xl font-black text-orange-600 dark:text-orange-400 truncate">Rs. {expenses.toLocaleString()}</h3>
                </CardContent>
              </Card>
            </div>

            {/* 2. Subtabs for 5 Categories */}
            <div className="bg-muted p-1 rounded-2xl flex border print:hidden overflow-x-auto gap-1">
              {(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setSubTab(tab); setAccountId(""); }}
                  className={`flex-1 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                    subTab === tab ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'Asset' && (isUrdu ? 'ایسٹس (Assets)' : 'Assets')}
                  {tab === 'Liability' && (isUrdu ? 'لائبلٹیز (Liabilities)' : 'Liabilities')}
                  {tab === 'Equity' && (isUrdu ? 'ایکویٹی (Equity)' : 'Equity')}
                  {tab === 'Revenue' && (isUrdu ? 'ریونیو (Revenue)' : 'Income / Revenue')}
                  {tab === 'Expense' && (isUrdu ? 'اخراجات (Expenses)' : 'Expenses')}
                </button>
              ))}
            </div>

            {/* 3. Grid for Accounts & Transactions */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column: Forms */}
              <div className="lg:col-span-1 space-y-6">
                {/* Add Account Card */}
                <Card className="border-border shadow-sm bg-card h-fit">
                  <CardHeader className="bg-muted/50 border-b border-border py-3 px-4">
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                      <Plus className="w-4 h-4 text-rose-600" />
                      {isUrdu ? `${subTab} کھاتہ شامل کریں` : `Add ${subTab} Account`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 px-4 pb-4">
                    <form onSubmit={handleAddAccount} className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{isUrdu ? 'کھاتہ کوڈ (Code)' : 'Account Code'}</Label>
                        <Input required placeholder="e.g. 1006" value={newAccountCode} onChange={e => setNewAccountCode(e.target.value)} className="h-9 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{isUrdu ? 'کھاتہ کا نام (Name)' : 'Account Name'}</Label>
                        <Input required placeholder="e.g. Office Furniture" value={newAccountName} onChange={e => setNewAccountName(e.target.value)} className="h-9 text-xs" />
                      </div>
                      <Button type="submit" className="w-full h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold" disabled={loading}>
                        {isUrdu ? 'نیا کھاتہ بنائیں' : 'Create Account'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Voucher Operations Card */}
                <Card className="border-border shadow-sm bg-card h-fit">
                  <CardHeader className="bg-muted/50 border-b border-border py-3 px-4">
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-rose-600" />
                      {isUrdu ? 'فنانشل واؤچرز درج کریں' : 'Voucher Transactions'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 px-4 pb-4 space-y-3">
                    <p className="text-xs text-muted-foreground font-semibold">
                      {isUrdu ? 'ترقی یافتہ ڈبل اینٹری جرنل اور ادائیگیوں کو یہاں سے درج کریں۔' : 'Create balanced double entry journal vouchers and expense payments.'}
                    </p>
                    <Button type="button" onClick={() => setIsJournalModalOpen(true)} className="w-full h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl">
                      <Plus className="w-4 h-4" />
                      {isUrdu ? 'نیا جرنل واؤچر بنائیں' : 'New Journal Voucher'}
                    </Button>
                    <Button type="button" onClick={() => setIsPaymentModalOpen(true)} className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl">
                      <CreditCard className="w-4 h-4" />
                      {isUrdu ? 'نیا ادائیگی واؤچر (خرچہ)' : 'New Payment / Expense'}
                    </Button>
                    <Button type="button" onClick={() => setIsAddAccountModalOpen(true)} className="w-full h-9 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl">
                      <Landmark className="w-4 h-4" />
                      {isUrdu ? 'نیا کیش/بینک کھاتہ ایڈ کریں' : 'Add Cash / Bank Account'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
 
              {/* Right Column: Tables */}
              <div className="lg:col-span-2 space-y-6">
                {/* Accounts & Balances Table */}
                <Card className="border-border shadow-sm bg-card overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b border-border py-3 px-4">
                    <CardTitle className="text-sm font-extrabold">
                      {isUrdu ? `${subTab} کھاتوں کی تفصیل اور بیلنس` : `${subTab} Chart of Accounts & Balances`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="pl-4 text-xs font-bold">{isUrdu ? 'کوڈ' : 'Code'}</TableHead>
                          <TableHead className="text-xs font-bold">{isUrdu ? 'کھاتہ کا نام' : 'Account Name'}</TableHead>
                          <TableHead className="text-right pr-4 text-xs font-bold">{isUrdu ? 'موجودہ بیلنس' : 'Current Balance'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.filter(a => a.type === subTab).map(a => {
                          const bal = getAccountBalance(a.id, a.type);
                          return (
                            <TableRow key={a.id} className="text-xs">
                              <TableCell className="pl-4 font-mono font-bold text-slate-500">{a.code}</TableCell>
                              <TableCell className="font-bold">{a.name}</TableCell>
                              <TableCell className="text-right pr-4 font-mono font-black text-emerald-600">
                                Rs. {bal.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {accounts.filter(a => a.type === subTab).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-xs text-muted-foreground italic">
                              {isUrdu ? 'کوئی کھاتہ موجود نہیں ہے۔' : 'No accounts found.'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
 
                {/* Grouped Journal Vouchers List */}
                <Card className="border-border shadow-sm bg-card overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b border-border py-3 px-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-extrabold">
                      {isUrdu ? 'ڈبل اینٹری جرنل لیجر بوک' : 'Double Entry Ledger Book'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="pl-4 text-xs font-bold">{isUrdu ? 'واؤچر نمبر' : 'Voucher No'}</TableHead>
                          <TableHead className="text-xs font-bold">{isUrdu ? 'تاریخ' : 'Date'}</TableHead>
                          <TableHead className="text-xs font-bold">{isUrdu ? 'بیانیہ / تفصیل' : 'Narrative / Description'}</TableHead>
                          <TableHead className="text-right text-xs font-bold">{isUrdu ? 'کل رقم' : 'Amount'}</TableHead>
                          <TableHead className="text-center text-xs font-bold">{isUrdu ? 'حیثیت' : 'Status'}</TableHead>
                          <TableHead className="text-right pr-4 text-xs font-bold"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const grouped = getGroupedJournalEntries();
                          return (
                            <>
                              {grouped.map(je => {
                                const debits = je.lines.reduce((s, l) => s + (l.type === 'Debit' ? l.amount : 0), 0);
                                return (
                                  <TableRow key={je.id} className="text-xs">
                                    <TableCell className="pl-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                                      {je.entryNo}
                                    </TableCell>
                                    <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                                      {je.entry_date?.split('T')[0]}
                                    </TableCell>
                                    <TableCell className="font-bold max-w-[200px] truncate">
                                      {je.description}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-black text-emerald-600">
                                      Rs. {debits.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge className="bg-emerald-600 text-white font-bold text-[10px] py-0.5 px-2">Posted</Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                      <div className="flex justify-end gap-1.5">
                                        <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px] font-bold rounded-lg border-indigo-200 hover:bg-indigo-50 text-indigo-700" onClick={() => setViewingVoucher(je)}>
                                          👁️ {isUrdu ? 'تفصیل' : 'View'}
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-rose-600 hover:bg-rose-50 rounded-full" onClick={async () => {
                                          if (!confirm(isUrdu ? "کیا آپ واقعی اس واؤچر کی تمام اینٹریز کو حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete all entries for this voucher?")) return;
                                          for (const line of je.lines) {
                                            if (!line.id.includes('j_multi_') && !line.id.includes('j_pv')) {
                                              await supabase.from('journal_entries').delete().eq('id', line.id);
                                            }
                                          }
                                          setJournal(prev => {
                                            const updated = prev.filter(j => !je.lines.some(l => l.id === j.id));
                                            localStorage.setItem("bs_journal_entries_v1", JSON.stringify(updated));
                                            return updated;
                                          });
                                        }}>
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              {grouped.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center py-4 text-xs text-muted-foreground italic">
                                    {isUrdu ? 'کوئی واؤچر موجود نہیں ہے۔' : 'No journal vouchers found.'}
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })()}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CASH BOOK (MOVED FROM INVENTORY) */}
        {activeTab === 'cashbook' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Profit & Loss metrics cards */}
            <div className="grid gap-4 md:grid-cols-3 print:hidden">
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase">{isUrdu ? "فروخت سے کل آمدنی (Revenue)" : "Sales Revenue"}</p>
                    <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">Rs. {totalSalesRevenue.toLocaleString()}</h4>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-600 rounded-lg py-1 px-2 font-bold text-[10px]">Income</Badge>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase">{isUrdu ? "فروخت شدہ مال کی لاگت (COGS)" : "Cost of Goods Sold"}</p>
                    <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">Rs. {totalCostOfGoodsSold.toLocaleString()}</h4>
                  </div>
                  <Badge className="bg-rose-500/10 text-rose-600 rounded-lg py-1 px-2 font-bold text-[10px]">Expenses</Badge>
                </CardContent>
              </Card>
              <Card className={`bg-card border-border ${totalProfitLoss >= 0 ? 'bg-emerald-500/[0.02]' : 'bg-rose-500/[0.02]'}`}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase">{isUrdu ? "نیٹ منافع / نقصان (Profit / Loss)" : "Net Profit / Loss"}</p>
                    <h4 className={`text-lg font-black ${totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Rs. {totalProfitLoss.toLocaleString()}
                    </h4>
                  </div>
                  <Badge className={`rounded-lg py-1 px-2 font-bold text-[10px] ${
                    totalProfitLoss >= 0 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
                  }`}>
                    {totalProfitLoss >= 0 ? (isUrdu ? 'منافع' : 'Net Profit') : (isUrdu ? 'نقصان' : 'Net Loss')}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Balances summary cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border bg-card">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase">{isUrdu ? "نقد رقم (Cash in Hand)" : "Cash in Hand Balance"}</p>
                    <h3 className="text-2xl font-black text-emerald-600">Rs. {cashInHand.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><WalletCards className="w-5 h-5"/></div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase">{isUrdu ? "بینک اکاؤنٹ (Bank Balance)" : "Bank Account Balance"}</p>
                    <h3 className="text-2xl font-black text-emerald-600">Rs. {bankBalance.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Landmark className="w-5 h-5"/></div>
                </CardContent>
              </Card>
            </div>

            {/* CASH BOOK CONTROLS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-border print:hidden">
              <div className="flex items-center gap-2">
                <WalletCards className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-extrabold text-foreground">
                  {isUrdu ? 'کیش بک اور بینک لیجرز' : 'Cash Book & Bank Ledgers'}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="flex h-9 rounded-xl border border-input bg-background px-3 text-xs font-bold animate-in"
                  value={selectedCashbookAccount}
                  onChange={e => setSelectedCashbookAccount(e.target.value)}
                >
                  <option value="all">{isUrdu ? 'تمام کیش و بینک اکاؤنٹس' : 'All Cash & Bank Accounts'}</option>
                  {accounts.filter(a => a.type === 'Asset' && (a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('mcb') || a.name.toLowerCase().includes('meezan'))).map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
                <Button type="button" onClick={() => setIsAddAccountModalOpen(true)} className="h-9 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1">
                  <Landmark className="w-4 h-4" />
                  {isUrdu ? 'نیا بینک اکاؤنٹ کھولیں' : 'Add Bank / Cash Account'}
                </Button>
              </div>
            </div>

            {/* CASH BOOK RUNNING LEDGER TABLE */}
            <Card className="border-border shadow-xl bg-card rounded-3xl overflow-hidden print:border-none print:shadow-none">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="pl-6 text-xs font-bold">{isUrdu ? 'تاریخ' : 'Date'}</TableHead>
                      <TableHead className="text-xs font-bold">{isUrdu ? 'واؤچر نمبر / حوالہ' : 'Ref No'}</TableHead>
                      <TableHead className="text-xs font-bold">{isUrdu ? 'تفصیل / بیانیہ' : 'Narrative'}</TableHead>
                      <TableHead className="text-xs font-bold">{isUrdu ? 'کیش / بینک اکاؤنٹ' : 'Book Name'}</TableHead>
                      <TableHead className="text-right text-xs font-bold">{isUrdu ? 'ڈیبٹ (+ آمد)' : 'Debit (In)'}</TableHead>
                      <TableHead className="text-right text-xs font-bold">{isUrdu ? 'کریڈٹ (- خرچ)' : 'Credit (Out)'}</TableHead>
                      <TableHead className="text-right pr-6 text-xs font-bold">{isUrdu ? 'رننگ بیلنس' : 'Running Balance'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs font-semibold">
                    {(() => {
                      const cbLogs = getCashbookTransactions();
                      return (
                        <>
                          {cbLogs.map((item: any, idx: number) => (
                            <TableRow key={item.id || idx}>
                              <TableCell className="pl-6 font-bold font-mono text-slate-500">{item.date?.split('T')[0]}</TableCell>
                              <TableCell className="font-bold text-rose-600 font-mono">{item.entryNo}</TableCell>
                              <TableCell className="font-bold max-w-[200px] truncate">{item.description}</TableCell>
                              <TableCell className="text-slate-500 font-semibold">{item.account_name}</TableCell>
                              <TableCell className="text-right font-mono font-bold text-emerald-600">
                                {item.debit > 0 ? `Rs. ${item.debit.toLocaleString()}` : '—'}
                              </TableCell>
                              <TableCell className="text-right font-mono font-bold text-rose-600">
                                {item.credit > 0 ? `Rs. ${item.credit.toLocaleString()}` : '—'}
                              </TableCell>
                              <TableCell className="text-right pr-6 font-mono font-black text-slate-900 dark:text-slate-100 text-sm">
                                Rs. {item.runningBalance.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                          {cbLogs.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground italic">
                                {isUrdu ? 'اس اکاؤنٹ میں کوئی ٹرانزیکشن موجود نہیں ہے۔' : 'No transactions found for this cashbook account.'}
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TRIAL BALANCE TAB */}
        {activeTab === 'trial_balance' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Activity className="w-5 h-5 text-rose-600" />
              <h2 className="text-xl font-extrabold text-foreground">
                {isUrdu ? 'ٹرائل بیلنس (Trial Balance Ledger)' : 'General Ledger Trial Balance'}
              </h2>
            </div>
            
            <Card className="border-border shadow-xl bg-card rounded-3xl overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="pl-6 font-bold">{isUrdu ? 'کھاتہ کوڈ (Code)' : 'Account Code'}</TableHead>
                      <TableHead className="font-bold">{isUrdu ? 'کھاتہ عنوان (Title)' : 'Account Title'}</TableHead>
                      <TableHead className="font-bold">{isUrdu ? 'نوعیت (Type)' : 'Type'}</TableHead>
                      <TableHead className="font-bold text-right pr-6">{isUrdu ? 'ڈیبٹ رقم (Debit)' : 'Debit (Rs)'}</TableHead>
                      <TableHead className="font-bold text-right pr-6">{isUrdu ? 'کریڈٹ رقم (Credit)' : 'Credit (Rs)'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs font-semibold">
                    {(() => {
                      let totalDebit = 0;
                      let totalCredit = 0;
                      return (
                        <>
                          {accounts.map(a => {
                            const bal = getAccountBalance(a.id, a.type);
                            let debit = 0;
                            let credit = 0;
                            if (a.type === 'Asset' || a.type === 'Expense') {
                              if (bal >= 0) debit = bal;
                              else credit = Math.abs(bal);
                            } else {
                              if (bal >= 0) credit = bal;
                              else debit = Math.abs(bal);
                            }
                            totalDebit += debit;
                            totalCredit += credit;
                            return (
                              <TableRow key={a.id}>
                                <TableCell className="pl-6 font-bold font-mono text-slate-500">{a.code}</TableCell>
                                <TableCell className="font-black text-slate-800 dark:text-slate-200">{a.name}</TableCell>
                                <TableCell><Badge variant="outline" className="font-bold">{a.type}</Badge></TableCell>
                                <TableCell className="text-right pr-6 font-mono text-emerald-600 font-bold">
                                  {debit > 0 ? `Rs. ${debit.toLocaleString()}` : '—'}
                                </TableCell>
                                <TableCell className="text-right pr-6 font-mono text-rose-600 font-bold">
                                  {credit > 0 ? `Rs. ${credit.toLocaleString()}` : '—'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-muted/50 font-black border-t-2 border-slate-900 dark:border-slate-100">
                            <TableCell colSpan={3} className="pl-6 text-sm">{isUrdu ? 'کل میزان (Grand Total)' : 'Grand Total:'}</TableCell>
                            <TableCell className="text-right pr-6 font-mono text-emerald-700 text-sm font-black">Rs. {totalDebit.toLocaleString()}</TableCell>
                            <TableCell className="text-right pr-6 font-mono text-rose-700 text-sm font-black">Rs. {totalCredit.toLocaleString()}</TableCell>
                          </TableRow>
                        </>
                      );
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STATEMENTS TAB */}
        {activeTab === 'statements' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <WalletCards className="w-5 h-5 text-rose-600" />
              <h2 className="text-xl font-extrabold text-foreground">
                {isUrdu ? 'مالیاتی گوشوارے (Financial Statements)' : 'Official Financial Statements'}
              </h2>
            </div>

            {(() => {
              // Calculate values for Statements
              const totalFeesRevenue = fees.reduce((sum, f) => sum + f.amount, 0);
              const otherRevenue = journal
                .filter(j => {
                  const acc = accounts.find(a => a.id === j.account_id || a.code === j.account_id);
                  return acc?.type === 'Revenue';
                })
                .reduce((sum, j) => {
                  const amt = Number(j.amount || 0);
                  return sum + (j.type === 'Credit' ? amt : -amt);
                }, 0);

              const totalInc = totalFeesRevenue + totalSalesRevenue + otherRevenue;
              const salariesExpense = payroll.reduce((sum, p) => sum + p.net_salary, 0);
              
              const otherExpenses = journal
                .filter(j => {
                  const acc = accounts.find(a => a.id === j.account_id || a.code === j.account_id);
                  return acc?.type === 'Expense';
                })
                .reduce((sum, j) => {
                  const amt = Number(j.amount || 0);
                  return sum + (j.type === 'Debit' ? amt : -amt);
                }, 0);

              const totalExp = totalCostOfGoodsSold + salariesExpense + otherExpenses;
              const netProfitYTD = totalInc - totalExp;

              // Balance Sheet
              // Standard Asset/Liab/Equity listings
              const assetAccounts = accounts.filter(a => a.type === 'Asset');
              const liabAccounts = accounts.filter(a => a.type === 'Liability');
              const equityAccounts = accounts.filter(a => a.type === 'Equity');

              const totalAssetsVal = assetAccounts.reduce((sum, a) => sum + getAccountBalance(a.id, a.type), 0);
              const totalLiabilitiesVal = liabAccounts.reduce((sum, a) => sum + getAccountBalance(a.id, a.type), 0);
              const baseEquityVal = equityAccounts.reduce((sum, a) => sum + getAccountBalance(a.id, a.type), 0);
              const totalEquityVal = baseEquityVal + netProfitYTD;

              return (
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* INCOME STATEMENT */}
                  <Card className="border-border shadow-xl bg-card rounded-3xl overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b border-border p-5">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-extrabold flex items-center gap-2">
                          <span>📊</span>
                          {isUrdu ? 'آمدنی کا گوشوارہ (P&L Statement)' : 'Income Statement (Profit & Loss)'}
                        </CardTitle>
                        <Badge variant="secondary" className="font-bold text-[10px] uppercase">YTD</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 text-xs font-semibold">
                      {/* Income */}
                      <div className="border-b pb-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mb-2 uppercase">{isUrdu ? 'کل آمدنی (Revenue)' : 'Operating Revenues'}</h4>
                        <div className="flex justify-between py-1"><span>{isUrdu ? 'فیس وصولی (School Fees)' : 'Tuition & Admission Fees'}</span><span className="font-mono text-emerald-600 font-bold">Rs. {totalFeesRevenue.toLocaleString()}</span></div>
                        <div className="flex justify-between py-1"><span>{isUrdu ? 'فروخت سیلز (Inventory Revenue)' : 'General Sales Revenue'}</span><span className="font-mono text-emerald-600 font-bold">Rs. {totalSalesRevenue.toLocaleString()}</span></div>
                        {otherRevenue > 0 && <div className="flex justify-between py-1"><span>{isUrdu ? 'دیگر آمدنی (Other Income)' : 'Other Ledger Income'}</span><span className="font-mono text-emerald-600 font-bold">Rs. {otherRevenue.toLocaleString()}</span></div>}
                        <div className="flex justify-between py-1.5 font-bold text-slate-800 dark:text-slate-200 border-t border-slate-200 mt-1"><span>{isUrdu ? 'مجموعی آمدنی:' : 'Total Revenues:'}</span><span className="font-mono">Rs. {totalInc.toLocaleString()}</span></div>
                      </div>

                      {/* Cost of Goods */}
                      <div className="border-b pb-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mb-2 uppercase">{isUrdu ? 'براہ راست اخراجات (COGS)' : 'Cost of Revenues'}</h4>
                        <div className="flex justify-between py-1"><span>{isUrdu ? 'فروخت شدہ مال کی لاگت' : 'Cost of Goods Sold (COGS)'}</span><span className="font-mono text-rose-600 font-bold">Rs. {totalCostOfGoodsSold.toLocaleString()}</span></div>
                        <div className="flex justify-between py-1.5 font-bold text-slate-800 dark:text-slate-200 border-t border-slate-200 mt-1"><span>{isUrdu ? 'خام منافع (Gross Profit):' : 'Gross Profit:'}</span><span className="font-mono text-emerald-700">Rs. {(totalInc - totalCostOfGoodsSold).toLocaleString()}</span></div>
                      </div>

                      {/* Operating Expenses */}
                      <div className="border-b pb-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mb-2 uppercase">{isUrdu ? 'انتظامی اخراجات (Operating Expenses)' : 'Operating Expenses'}</h4>
                        <div className="flex justify-between py-1"><span>{isUrdu ? 'ملازمین کی تنخواہیں (Staff Salaries)' : 'Employee Payroll Salaries'}</span><span className="font-mono text-rose-600 font-bold">Rs. {salariesExpense.toLocaleString()}</span></div>
                        {journal
                          .filter(j => {
                            const acc = accounts.find(a => a.id === j.account_id || a.code === j.account_id);
                            return acc?.type === 'Expense';
                          })
                          .map(j => {
                            const acc = accounts.find(a => a.id === j.account_id || a.code === j.account_id);
                            return (
                              <div key={j.id} className="flex justify-between py-1 pl-3 text-muted-foreground">
                                <span>{acc?.name} ({j.description})</span>
                                <span className="font-mono">Rs. {Number(j.amount).toLocaleString()}</span>
                              </div>
                            );
                          })}
                        <div className="flex justify-between py-1.5 font-bold text-slate-800 dark:text-slate-200 border-t border-slate-200 mt-1"><span>{isUrdu ? 'مجموعی اخراجات:' : 'Total Operating Expenses:'}</span><span className="font-mono">Rs. {totalExp.toLocaleString()}</span></div>
                      </div>

                      {/* Net Retained Profit */}
                      <div className={`p-4 rounded-2xl flex justify-between items-center ${netProfitYTD >= 0 ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' : 'bg-rose-500/10 text-rose-800 dark:text-rose-300'}`}>
                        <span className="font-black text-sm">{isUrdu ? 'خالص منافع / نقصان (YTD Net Profit):' : 'Net Retained Profit (YTD):'}</span>
                        <span className="font-mono text-lg font-black">Rs. {netProfitYTD.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* BALANCE SHEET */}
                  <Card className="border-border shadow-xl bg-card rounded-3xl overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b border-border p-5">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-extrabold flex items-center gap-2">
                          <span>⚖️</span>
                          {isUrdu ? 'مالیاتی پوزیشن کا گوشوارہ (Balance Sheet)' : 'Statement of Financial Position (Balance Sheet)'}
                        </CardTitle>
                        <Badge variant="secondary" className="font-bold text-[10px] uppercase">As of Today</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 text-xs font-semibold">
                      {/* Assets Section */}
                      <div className="border-b pb-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mb-2 uppercase">{isUrdu ? 'اثاثہ جات (Assets)' : 'Assets'}</h4>
                        {assetAccounts.map(a => {
                          const bal = getAccountBalance(a.id, a.type);
                          return (
                            <div key={a.id} className="flex justify-between py-1">
                              <span>{a.name} ({a.code})</span>
                              <span className="font-mono text-emerald-600 font-bold">Rs. {bal.toLocaleString()}</span>
                            </div>
                          );
                        })}
                        {assetAccounts.length === 0 && (
                          <div className="flex justify-between py-1">
                            <span>Cash & Bank Balances (Est.)</span>
                            <span className="font-mono text-emerald-600 font-bold">Rs. {(cashInHand + bankBalance).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-1.5 font-bold text-slate-900 dark:text-slate-100 border-t border-slate-200 mt-1">
                          <span>{isUrdu ? 'مجموعی اثاثہ جات:' : 'Total Assets:'}</span>
                          <span className="font-mono text-emerald-700 text-sm font-black">Rs. {totalAssetsVal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Liabilities Section */}
                      <div className="border-b pb-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mb-2 uppercase">{isUrdu ? 'واجبات (Liabilities)' : 'Liabilities'}</h4>
                        {liabAccounts.map(a => {
                          const bal = getAccountBalance(a.id, a.type);
                          return (
                            <div key={a.id} className="flex justify-between py-1">
                              <span>{a.name} ({a.code})</span>
                              <span className="font-mono text-rose-600 font-bold">Rs. {bal.toLocaleString()}</span>
                            </div>
                          );
                        })}
                        {liabAccounts.length === 0 && (
                          <div className="text-muted-foreground italic py-1">No Liabilities accounts recorded</div>
                        )}
                        <div className="flex justify-between py-1.5 font-bold text-slate-900 dark:text-slate-100 border-t border-slate-200 mt-1">
                          <span>{isUrdu ? 'مجموعی واجبات:' : 'Total Liabilities:'}</span>
                          <span className="font-mono text-rose-700 text-sm font-black">Rs. {totalLiabilitiesVal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Equity Section */}
                      <div className="border-b pb-2">
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mb-2 uppercase">{isUrdu ? 'ایکویٹی (Equity)' : 'Equity'}</h4>
                        {equityAccounts.map(a => {
                          const bal = getAccountBalance(a.id, a.type);
                          return (
                            <div key={a.id} className="flex justify-between py-1">
                              <span>{a.name} ({a.code})</span>
                              <span className="font-mono text-indigo-600 font-bold">Rs. {bal.toLocaleString()}</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between py-1">
                          <span>Retained Earnings (YTD Profit)</span>
                          <span className="font-mono text-indigo-600 font-bold">Rs. {netProfitYTD.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1.5 font-bold text-slate-900 dark:text-slate-100 border-t border-slate-200 mt-1">
                          <span>{isUrdu ? 'مجموعی سرمایہ/ایکویٹی:' : 'Total Equity:'}</span>
                          <span className="font-mono text-indigo-700 text-sm font-black">Rs. {totalEquityVal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Summary Banner check */}
                      <div className="pt-2">
                        <div className="flex justify-between py-2 font-bold text-sm bg-muted/40 px-3 rounded-xl border">
                          <span>{isUrdu ? 'واجبات اور ایکویٹی مجموعی:' : 'Total Liabilities & Equity:'}</span>
                          <span className="font-mono text-slate-900 dark:text-slate-100 text-base font-black">Rs. {(totalLiabilitiesVal + totalEquityVal).toLocaleString()}</span>
                        </div>
                        <div className="mt-3 text-center">
                          {Math.abs(totalAssetsVal - (totalLiabilitiesVal + totalEquityVal)) < 1 ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1 px-3">
                              ✓ {isUrdu ? 'بیلنس شیٹ متوازن ہے' : 'Balance Sheet is Balanced'}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="font-bold text-xs py-1 px-3">
                              ⚠️ {isUrdu ? 'بیلنس شیٹ غیر متوازن ہے' : `Balance Sheet out of balance by Rs. ${Math.abs(totalAssetsVal - (totalLiabilitiesVal + totalEquityVal)).toLocaleString()}`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </div>
        )}

      </main>
    </div>
  );
}
