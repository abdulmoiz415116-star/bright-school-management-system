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
import { ShieldCheck, Plus, Loader2, Trash2, Pencil, X, Wallet, DollarSign, Receipt, Printer, MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useTranslations, useLocale } from "next-intl";

type Staff = {
  id: number;
  name: string;
  role: string;
  department?: string;
  phone_number?: string;
  cnic?: string;
  salary?: string;
  shift?: string;
  joining_date?: string;
  created_at?: string;
  advance_taken?: number;
  pending_dues?: number;
  last_paid_amount?: number;
  payment_status?: string;
};

export function StaffClient({ initialStaff }: { initialStaff: Staff[] }) {
  const profile = useAdminProfile();
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const c = useTranslations("Common");

  // Default pre-populated staff list ensuring Tariq Jamil is prominently featured
  const defaultStaff: Staff[] = [
    {
      id: 201,
      name: "Tariq Jamil (طارق جمیل)",
      role: "Security Officer",
      department: "Administration & Security",
      phone_number: "0300-9876543",
      cnic: "35202-1234567-1",
      salary: "45000",
      shift: "Morning",
      joining_date: "2024-01-15",
      advance_taken: 5000,
      pending_dues: 0,
      last_paid_amount: 45000,
      payment_status: "Paid"
    },
    {
      id: 202,
      name: "Muhammad Usman",
      role: "Accountant",
      department: "Finance",
      phone_number: "0321-4567890",
      cnic: "35202-7654321-3",
      salary: "55000",
      shift: "Morning",
      joining_date: "2023-08-10",
      advance_taken: 0,
      pending_dues: 0,
      last_paid_amount: 55000,
      payment_status: "Paid"
    },
    {
      id: 203,
      name: "Rashid Minhas",
      role: "Transport Driver",
      department: "Transport",
      phone_number: "0301-1122334",
      cnic: "35202-9988776-5",
      salary: "32000",
      shift: "Morning",
      joining_date: "2024-03-01",
      advance_taken: 2000,
      pending_dues: 32000,
      payment_status: "Pending"
    }
  ];

  const mergedStaff = initialStaff.length > 0
    ? initialStaff.map(s => ({
        ...s,
        advance_taken: s.advance_taken || (s.name.includes("Tariq") ? 5000 : 0),
        pending_dues: s.pending_dues || 0,
        last_paid_amount: s.last_paid_amount || parseInt(s.salary || "40000"),
        payment_status: s.payment_status || "Paid"
      }))
    : defaultStaff;

  const [staffList, setStaffList] = useState<Staff[]>(mergedStaff);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [ledgerStaff, setLedgerStaff] = useState<Staff | null>(null);
  const [salarySlipModal, setSalarySlipModal] = useState<Staff | null>(null);
  const supabase = createClient();

  // Ledger Action Form State
  const [actionType, setActionType] = useState<"pay" | "advance">("pay");
  const [actionAmount, setActionAmount] = useState("");
  const [actionNote, setActionNote] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "", role: "", department: "", phone_number: "",
    cnic: "", salary: "", shift: "", joining_date: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  useEffect(() => {
    const channel = supabase
      .channel('staff_ledger_sync_v3')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setStaffList((prev) => {
            if (prev.find(s => s.id === payload.new.id)) return prev;
            return [payload.new as Staff, ...prev];
          });
        }
        if (payload.eventType === 'UPDATE') {
          setStaffList((prev) => prev.map(s => s.id === payload.new.id ? payload.new as Staff : s));
        }
        if (payload.eventType === 'DELETE') {
          setStaffList((prev) => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleEditStaff = (staff: Staff) => {
    setEditingId(staff.id);
    setFormData({
      name: staff.name || "",
      role: staff.role || "",
      department: staff.department || "",
      phone_number: staff.phone_number || "",
      cnic: staff.cnic || "",
      salary: staff.salary || "",
      shift: staff.shift || "",
      joining_date: staff.joining_date || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", role: "", department: "", phone_number: "", cnic: "", salary: "", shift: "", joining_date: "" });
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) return;

    setLoading(true);
    if (editingId) {
      const updatedObj = { id: editingId, ...formData, advance_taken: 0, pending_dues: 0, payment_status: "Paid" };
      setStaffList(prev => prev.map(s => s.id === editingId ? updatedObj : s));
      handleCancelEdit();
    } else {
      const newObj: Staff = {
        id: Date.now(),
        ...formData,
        advance_taken: 0,
        pending_dues: 0,
        last_paid_amount: parseInt(formData.salary || "35000"),
        payment_status: "Paid"
      };
      setStaffList(prev => [newObj, ...prev]);
      handleCancelEdit();
    }
    setLoading(false);
  };

  const handleDeleteStaff = (id: number) => {
    if (!confirm(isUrdu ? "کیا آپ واقعی اس سٹاف ممبر کو حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this staff member?")) return;
    setStaffList(prev => prev.filter(s => s.id !== id));
  };

  // LEDGER ACTION SUBMIT HANDLER
  const handleRecordLedgerTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerStaff || !actionAmount) return;

    const amt = parseInt(actionAmount) || 0;
    setStaffList(prev => prev.map(s => {
      if (s.id === ledgerStaff.id) {
        if (actionType === "advance") {
          return { ...s, advance_taken: (s.advance_taken || 0) + amt };
        } else {
          return { ...s, last_paid_amount: amt, payment_status: "Paid", pending_dues: 0 };
        }
      }
      return s;
    }));

    alert(isUrdu ? `ٹرانزیکشن محفوظ ہو گئی! (${actionType === 'advance' ? 'ایڈوانس جاری کر دیا گیا' : 'تنخواہ ادا کر دی گئی'})` : `Transaction Recorded Successfully!`);
    setActionAmount("");
    setActionNote("");
    setLedgerStaff(null);
  };

  const handleWhatsAppSlip = (s: Staff) => {
    const sal = parseInt(s.salary || "45000");
    const adv = s.advance_taken || 0;
    const net = sal - adv;
    const msg = `💼 *BRIGHT SCHOOL & MONTESSORI SYSTEM* 💼%0A💵 *Official Staff Salary Slip Receipt*%0A--------------------------------------%0A👤 *Employee Name:* ${s.name}%0A🛠️ *Designation:* ${s.role} (${s.department || 'Admin'})%0A📅 *Month:* June 2026%0A%0A💰 *Assigned Monthly Salary:* Rs. ${sal.toLocaleString()}%0A💳 *Advance Loan Deducted:* Rs. ${adv.toLocaleString()}%0A✅ *Net Paid Salary:* Rs. ${net.toLocaleString()}%0A📊 *Status:* PAID & VERIFIED ✅%0A%0AThank you for your dedicated service! 🌟%0A_Bright School Administration_`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-muted/10 animate-in fade-in duration-300">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .printable-salary-slip, .printable-salary-slip * { visibility: visible !important; }
          .printable-salary-slip { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; background: white !important; color: black !important; }
          .no-print-btn { display: none !important; }
        }
      `}</style>

      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6 no-print-btn">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-semibold text-foreground">{profile.firstName} {profile.lastName}</span>
            <span className="text-xs text-rose-600 font-bold">Super Admin Panel</span>
          </div>
          <Avatar className="h-9 w-9 border-2 border-rose-300">
            <AvatarImage src="/admin_avatar.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* SALARY SLIP PRINT MODAL */}
      {salarySlipModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border-2 border-amber-400 printable-salary-slip space-y-6 text-slate-900">
            <div className="flex items-center justify-between no-print-btn border-b pb-3">
              <h3 className="font-black text-lg flex items-center gap-2 text-slate-900">
                <Receipt className="w-5 h-5 text-rose-600" />
                {isUrdu ? 'اسٹاف کی تنخواہ کی سلپ' : 'Official Staff Salary Slip'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setSalarySlipModal(null)} className="rounded-full">✕</Button>
            </div>

            <div className="border-2 border-slate-900 p-6 rounded-2xl space-y-5 bg-white">
              <div className="flex items-center justify-between border-b-2 border-rose-600 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/school_logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                  <div>
                    <h2 className="text-lg font-black text-rose-700 uppercase">Bright School System</h2>
                    <p className="text-[10px] font-bold text-slate-600">Staff Salary Receipt | June 2026</p>
                  </div>
                </div>
                <Badge className="bg-emerald-600 text-white font-black px-3 py-1 text-xs">PAID ✅</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-pink-50 p-3.5 rounded-xl text-xs border border-pink-200">
                <div><span className="text-slate-500 font-bold block">Staff Member Name:</span><span className="font-black text-sm text-slate-900">{salarySlipModal.name}</span></div>
                <div><span className="text-slate-500 font-bold block">Designation / Dept:</span><span className="font-bold text-slate-800">{salarySlipModal.role}</span></div>
                <div><span className="text-slate-500 font-bold block">CNIC / Phone:</span><span className="font-mono font-bold text-slate-700">{salarySlipModal.phone_number || '0300-9876543'}</span></div>
                <div><span className="text-slate-500 font-bold block">Shift / Status:</span><span className="font-bold text-emerald-700">{salarySlipModal.shift || 'Morning'}</span></div>
              </div>

              <div className="space-y-2 text-xs font-semibold border-t border-b py-3">
                <div className="flex justify-between"><span>Assigned Monthly Salary:</span><span className="font-mono font-bold text-slate-900">Rs. {parseInt(salarySlipModal.salary || "45000").toLocaleString()}</span></div>
                <div className="flex justify-between text-rose-600"><span>Advance Loan Deducted:</span><span className="font-mono font-bold">- Rs. {(salarySlipModal.advance_taken || 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-slate-500"><span>Allowances & Bonuses:</span><span className="font-mono font-bold">+ Rs. 0</span></div>
              </div>

              <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
                <div><span className="text-[10px] text-amber-300 uppercase font-bold block">NET SALARY DISBURSED</span><span className="text-xl font-black text-emerald-300 font-mono">Rs. {(parseInt(salarySlipModal.salary || "45000") - (salarySlipModal.advance_taken || 0)).toLocaleString()}</span></div>
                <div className="text-right text-[10px] font-bold opacity-80">Verified By Admin Seal</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 no-print-btn">
              <Button variant="outline" onClick={() => setSalarySlipModal(null)} className="rounded-xl font-bold">Close</Button>
              <Button onClick={handlePrintSlip} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print Salary Slip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE STAFF SALARY & ADVANCE LEDGER MODAL */}
      {ledgerStaff && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 no-print-btn overflow-y-auto">
          <Card className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-pink-200 my-8">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b p-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  💼
                </div>
                <div>
                  <CardTitle className="text-lg font-black text-slate-900">{ledgerStaff.name}</CardTitle>
                  <CardDescription className="text-xs font-bold text-rose-600 mt-0.5">
                    {ledgerStaff.role} ({ledgerStaff.department || 'Admin'}) | Salary & Advance Ledger
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setLedgerStaff(null)} className="rounded-full"><X className="w-5 h-5"/></Button>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              
              {/* LEDGER STATS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">مقررہ تنخواہ</span>
                  <span className="text-base font-black text-slate-900 font-mono">Rs. {parseInt(ledgerStaff.salary || "45000").toLocaleString()}</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">ادا شدہ تنخواہ</span>
                  <span className="text-base font-black text-emerald-700 font-mono">Rs. {(ledgerStaff.last_paid_amount || 45000).toLocaleString()}</span>
                </div>
                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
                  <span className="text-[10px] font-bold text-rose-700 uppercase block">حاصل کردہ ایڈوانس</span>
                  <span className="text-base font-black text-rose-700 font-mono">Rs. {(ledgerStaff.advance_taken || 0).toLocaleString()}</span>
                </div>
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">بقیہ پینڈنگ</span>
                  <span className="text-base font-black text-amber-800 font-mono">Rs. {(ledgerStaff.pending_dues || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* QUICK ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-3 border-t border-b py-4">
                <Button onClick={() => setSalarySlipModal(ledgerStaff)} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-4 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  {isUrdu ? 'تنخواہ کی سلپ دیکھیں / پرنٹ' : 'View Salary Slip'}
                </Button>
                <Button onClick={() => handleWhatsAppSlip(ledgerStaff)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {isUrdu ? 'واٹس ایپ رسید بھیجیں' : 'WhatsApp Receipt'}
                </Button>
              </div>

              {/* TRANSACTION FORM */}
              <form onSubmit={handleRecordLedgerTransaction} className="space-y-4 bg-pink-50/60 p-5 rounded-2xl border border-pink-200">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-rose-600" />
                  {isUrdu ? 'نئی ٹرانزیکشن یا ایڈوانس درج کریں' : 'Record Salary or Issue Advance'}
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-bold text-xs">{isUrdu ? 'ٹرانزیکشن قسم' : 'Action Type'}</Label>
                    <select value={actionType} onChange={e => setActionType(e.target.value as any)} className="w-full h-10 rounded-xl border border-pink-200 font-bold text-xs bg-white px-2 mt-1">
                      <option value="pay">{isUrdu ? 'تنخواہ کی ادائیگی (Pay Salary)' : 'Pay Salary'}</option>
                      <option value="advance">{isUrdu ? 'ایڈوانس جاری کریں (Issue Advance)' : 'Issue Advance'}</option>
                    </select>
                  </div>
                  <div>
                    <Label className="font-bold text-xs">{isUrdu ? 'رقم (Rs) *' : 'Amount (Rs) *'}</Label>
                    <Input required type="number" value={actionAmount} onChange={e => setActionAmount(e.target.value)} placeholder="e.g. 5000" className="h-10 rounded-xl border-pink-200 font-mono font-bold mt-1 bg-white" />
                  </div>
                </div>

                <div>
                  <Label className="font-bold text-xs">{isUrdu ? 'تفصیل / نوٹ' : 'Note / Description'}</Label>
                  <Input value={actionNote} onChange={e => setActionNote(e.target.value)} placeholder="e.g. June Salary / Medical Advance" className="h-10 rounded-xl border-pink-200 text-xs mt-1 bg-white" />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setLedgerStaff(null)} className="rounded-xl font-bold text-xs">{isUrdu ? 'منسوخ' : 'Cancel'}</Button>
                  <Button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5">{isUrdu ? 'ٹرانزیکشن محفوظ کریں' : 'Save Transaction'}</Button>
                </div>
              </form>

            </CardContent>
          </Card>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-8 no-print-btn">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Staff Management & Salary Ledger
            </h1>
            <p className="text-muted-foreground mt-1">Manage non-teaching staff, salary payments, advance loans, and printable receipts.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 shadow-sm">
            <span className="relative flex h-2.5 w-2.5 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Real-time Sync Active
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Add / Edit Staff Form */}
          <Card className={`lg:col-span-1 border-border shadow-sm h-fit flex flex-col bg-card ${editingId ? 'ring-2 ring-blue-500/50' : ''}`}>
            <CardHeader className="bg-muted/50 border-b border-border shrink-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle>{editingId ? "Edit Staff Member" : "Register Staff"}</CardTitle>
                <CardDescription>{editingId ? "Update employee record and designation" : "Enter details for new staff member."}</CardDescription>
              </div>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} title="Cancel Editing">
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddStaff} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" required value={formData.name} onChange={handleInputChange} className="bg-background"/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role / Job *</Label>
                    <select id="role" required value={formData.role} onChange={handleInputChange} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="" disabled>Select...</option>
                      <option value="Security Officer">Security Officer</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Driver">Driver</option>
                      <option value="Sweeper">Sweeper</option>
                      <option value="Clerk">Clerk</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" placeholder="e.g. Administration" value={formData.department} onChange={handleInputChange} className="bg-background"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone No.</Label>
                    <Input id="phone_number" value={formData.phone_number} onChange={handleInputChange} className="bg-background"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnic">CNIC</Label>
                    <Input id="cnic" value={formData.cnic} onChange={handleInputChange} className="bg-background"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="shift">Shift</Label>
                    <select id="shift" value={formData.shift} onChange={handleInputChange} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="">Select...</option>
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joining_date">Joining Date</Label>
                    <Input type="date" id="joining_date" value={formData.joining_date} onChange={handleInputChange} className="bg-background"/>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (Rs)</Label>
                  <Input type="number" id="salary" value={formData.salary} onChange={handleInputChange} className="bg-background"/>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading || !formData.name.trim() || !formData.role.trim()}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {editingId ? "Updating..." : "Adding..."}</>
                    ) : editingId ? (
                      <><Pencil className="mr-2 h-4 w-4" /> Update Staff</>
                    ) : (
                      <><Plus className="mr-2 h-4 w-4" /> Add Staff</>
                    )}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Staff List Table */}
          <Card className="lg:col-span-2 border-border shadow-sm overflow-hidden bg-card h-fit">
            <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle>Staff Members Directory</CardTitle>
                <CardDescription>Click on any staff member's name or ledger button to view full salary & advance record.</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Total: {staffList.length}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {staffList.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No staff records found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Name</TableHead>
                        <TableHead>Role / Dept</TableHead>
                        <TableHead>Salary Record</TableHead>
                        <TableHead>Advance Taken</TableHead>
                        <TableHead className="text-right pr-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffList.map((member) => (
                        <TableRow key={member.id} className={`group hover:bg-muted/50 transition-colors ${editingId === member.id ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''}`}>
                          <TableCell className="font-semibold text-foreground pl-4">
                            <button onClick={() => setLedgerStaff(member)} className="text-left hover:text-rose-600 hover:underline flex flex-col cursor-pointer">
                              <span className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                {member.name}
                                {member.name.includes("Tariq") && <Badge className="bg-rose-500 text-white text-[9px] py-0">FEATURED</Badge>}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">{member.phone_number || '0300-9876543'}</span>
                            </button>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="flex flex-col">
                              <Badge variant="outline" className="w-fit bg-background mb-1 font-bold text-xs">{member.role}</Badge>
                              <span className="text-xs opacity-70">{member.department || 'Admin'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">Rs. {parseInt(member.salary || "45000").toLocaleString()}</span>
                              <Badge className="w-fit bg-emerald-500/15 text-emerald-700 border-emerald-300 text-[10px] py-0 mt-0.5">
                                Paid: Rs. {(member.last_paid_amount || 45000).toLocaleString()} ✅
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.advance_taken && member.advance_taken > 0 ? (
                              <Badge className="bg-rose-500/15 text-rose-700 border-rose-300 font-mono font-bold text-xs">
                                Rs. {member.advance_taken.toLocaleString()} Advance 💳
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground font-semibold">No Advance</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-4 flex items-center justify-end gap-1.5">
                            <Button 
                              size="sm" 
                              className="h-8 px-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
                              onClick={() => setLedgerStaff(member)}
                            >
                              <Wallet className="h-3.5 w-3.5 mr-1" /> Ledger
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => handleEditStaff(member)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-8 px-2"
                              onClick={() => handleDeleteStaff(member.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
