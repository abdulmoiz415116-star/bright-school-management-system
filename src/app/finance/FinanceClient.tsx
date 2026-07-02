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
  const [activeTab, setActiveTab] = useState<'fees' | 'payroll' | 'ledger' | 'cashbook'>('fees');
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
          <div className="bg-muted p-1.5 rounded-2xl flex border border-border/50 max-w-lg print:hidden overflow-x-auto gap-1">
            <button onClick={() => setActiveTab('fees')} className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'fees' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>Fees & Dues</button>
            <button onClick={() => setActiveTab('payroll')} className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'payroll' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>Payroll & Slips</button>
            <button onClick={() => setActiveTab('cashbook')} className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'cashbook' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>{isUrdu ? 'کیش بک (Cash Book)' : 'Cash Book'}</button>
            <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'ledger' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>General Ledger</button>
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

                {/* Post Transaction Card */}
                <Card className="border-border shadow-sm bg-card h-fit">
                  <CardHeader className="bg-muted/50 border-b border-border py-3 px-4">
                    <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-rose-600" />
                      {isUrdu ? 'ٹرانزیکشن پوسٹ کریں' : 'Post Journal Entry'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 px-4 pb-4">
                    <form onSubmit={handleAddJournal} className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{isUrdu ? 'کھاتہ منتخب کریں' : 'Select Account'}</Label>
                        <select required className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs" value={accountId} onChange={e => setAccountId(e.target.value)}>
                          <option value="">{isUrdu ? 'منتخب کریں...' : 'Select Account...'}</option>
                          {accounts.filter(a => a.type === subTab).map(a => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{isUrdu ? 'ٹائپ (Debit/Credit)' : 'Entry Type'}</Label>
                        <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs" value={journalType} onChange={e => setJournalType(e.target.value)}>
                          <option value="Debit">Debit (+)</option>
                          <option value="Credit">Credit (-)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{isUrdu ? 'رقم (Rs.)' : 'Amount (Rs.)'}</Label>
                        <Input type="number" required placeholder="Amount" value={journalAmount} onChange={e => setJournalAmount(e.target.value)} className="h-9 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{isUrdu ? 'تفصیل' : 'Description'}</Label>
                        <Input required placeholder="Transaction description" value={journalDesc} onChange={e => setJournalDesc(e.target.value)} className="h-9 text-xs" />
                      </div>
                      <Button type="submit" className="w-full h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold" disabled={loading}>
                        {isUrdu ? 'اینٹری پوسٹ کریں' : 'Post Transaction'}
                      </Button>
                    </form>
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

                {/* Ledger Entries List */}
                <Card className="border-border shadow-sm bg-card overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b border-border py-3 px-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-extrabold">
                      {isUrdu ? `${subTab} لیجر ٹرانزیکشن لاگز` : `${subTab} Ledger Transactions`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="pl-4 text-xs font-bold">{isUrdu ? 'تاریخ' : 'Date'}</TableHead>
                          <TableHead className="text-xs font-bold">{isUrdu ? 'تفصیل / کھاتہ' : 'Details / Account'}</TableHead>
                          <TableHead className="text-center text-xs font-bold">{isUrdu ? 'ڈیبٹ (+)' : 'Debit'}</TableHead>
                          <TableHead className="text-center text-xs font-bold">{isUrdu ? 'کریڈٹ (-)' : 'Credit'}</TableHead>
                          <TableHead className="text-right pr-4 text-xs font-bold"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...journal].sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()).filter(j => {
                          const accDetails = j.chart_of_accounts || accounts.find(a => a.id === j.account_id || a.code === j.account_id);
                          return accDetails?.type === subTab;
                        }).map(j => {
                          const accDetails = j.chart_of_accounts || accounts.find(a => a.id === j.account_id || a.code === j.account_id);
                          const isDebit = j.type === 'Debit';
                          return (
                            <TableRow key={j.id} className="text-xs">
                              <TableCell className="pl-4 font-mono text-slate-500 font-bold whitespace-nowrap">
                                {j.entry_date?.split('T')[0]}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-slate-200">{accDetails?.name || 'Account'}</p>
                                  <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{j.description}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-mono font-bold text-emerald-600">
                                {isDebit ? `Rs. ${Number(j.amount).toLocaleString()}` : '-'}
                              </TableCell>
                              <TableCell className="text-center font-mono font-bold text-rose-600">
                                {!isDebit ? `Rs. ${Number(j.amount).toLocaleString()}` : '-'}
                              </TableCell>
                              <TableCell className="text-right pr-4">
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleDeleteJournal(j.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        }).slice(0, 50)}
                        {journal.filter(j => {
                          const accDetails = j.chart_of_accounts || accounts.find(a => a.id === j.account_id || a.code === j.account_id);
                          return accDetails?.type === subTab;
                        }).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-xs text-muted-foreground italic">
                              {isUrdu ? 'کوئی ٹرانزیکشن موجود نہیں ہے۔' : 'No transactions found.'}
                            </TableCell>
                          </TableRow>
                        )}
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

            {/* LEDGER FILTERS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-border print:hidden">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-extrabold text-foreground">
                  {isUrdu ? 'کیش بک کھاتہ لیجر بک' : 'General Ledger & Cash Book'}
                </h2>
              </div>
              <div className="bg-muted p-1 rounded-xl flex border w-fit mx-auto sm:mx-0">
                <button 
                  onClick={() => setLedgerFilter('ALL')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${ledgerFilter === 'ALL' ? 'bg-background shadow-sm text-foreground font-black' : 'text-muted-foreground'}`}
                >
                  {isUrdu ? 'تمام لاگز' : 'All Transactions'}
                </button>
                <button 
                  onClick={() => setLedgerFilter('CASH')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${ledgerFilter === 'CASH' ? 'bg-background shadow-sm text-foreground font-black' : 'text-muted-foreground'}`}
                >
                  {isUrdu ? 'کیش / بینک' : 'Cash Book'}
                </button>
                <button 
                  onClick={() => setLedgerFilter('CREDIT')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${ledgerFilter === 'CREDIT' ? 'bg-background shadow-sm text-foreground font-black' : 'text-muted-foreground'}`}
                >
                  {isUrdu ? 'ادھار کھاتہ' : 'Credit Ledger'}
                </button>
                <button 
                  onClick={() => setLedgerFilter('INTERNAL')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${ledgerFilter === 'INTERNAL' ? 'bg-background shadow-sm text-foreground font-black' : 'text-muted-foreground'}`}
                >
                  {isUrdu ? 'شعبہ جاتی استعمال' : 'Internal Use'}
                </button>
              </div>
            </div>

            {/* LEDGER GENERAL BOOK TABLE */}
            <Card className="border-border shadow-xl bg-card rounded-3xl overflow-hidden print:border-none print:shadow-none">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="pl-6 font-bold">{isUrdu ? 'تاریخ (Time)' : 'Date'}</TableHead>
                      <TableHead className="font-bold">{isUrdu ? 'تفصیل ٹرانزیکشن' : 'Description / Item Name'}</TableHead>
                      <TableHead className="font-bold">{isUrdu ? 'ادائیگی کا ذریعہ (Source)' : 'Wallet Source'}</TableHead>
                      <TableHead className="font-bold">{isUrdu ? 'طریقہ کار (Mode)' : 'Payment Mode'}</TableHead>
                      <TableHead className="font-bold text-center">{isUrdu ? 'مقدار' : 'Quantity'}</TableHead>
                      <TableHead className="font-bold text-center">{isUrdu ? 'یونٹ قیمت' : 'Unit Price'}</TableHead>
                      <TableHead className="text-right pr-6 font-bold">{isUrdu ? 'ڈیبٹ / کریڈٹ (Amount)' : 'Total Amount (+/-)'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs font-semibold">
                    {filteredLogs.map((log: any, idx: number) => {
                      const isExpense = log.transaction_type === 'IN' || log.payment_mode === 'Supplier Payment';
                      return (
                        <TableRow key={idx}>
                          <TableCell className="pl-6 font-bold font-mono text-slate-500">{log.date?.split('T')[0]}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-black text-slate-800 dark:text-slate-200">{log.item_name || log.description || 'Transaction'}</p>
                              {log.remarks && <p className="text-[10px] text-muted-foreground italic mt-0.5">"{log.remarks}"</p>}
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="font-bold">{log.cash_source || 'N/A'}</Badge></TableCell>
                          <TableCell><Badge className="bg-slate-100 text-slate-800 font-bold border">{log.payment_mode || 'N/A'}</Badge></TableCell>
                          <TableCell className="text-center font-mono">{log.quantity || 1}</TableCell>
                          <TableCell className="text-center font-mono">Rs. {Number(log.unit_price || 0).toLocaleString()}</TableCell>
                          <TableCell className={`text-right pr-6 font-mono font-black text-sm ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isExpense ? '-' : '+'}Rs. {Number(log.total_amount || 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}
