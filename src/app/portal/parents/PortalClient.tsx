"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, FileText, Download, CheckCircle2, XCircle, Clock, Award, QrCode, LogOut, Printer, ShieldCheck, User, CreditCard } from "lucide-react";
import { useLocale } from "next-intl";
import Cookies from "js-cookie";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function PortalClient({ studentInfo, attendance, fees, exams }: any) {
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const supabase = createClient();

  const [reportModal, setReportModal] = useState(false);
  const [idCardModal, setIdCardModal] = useState(false);

  const studentName = studentInfo?.name || "Muhammad Ali Raza";
  const fatherName = studentInfo?.father_name || "Tariq Mahmood";
  const admNo = studentInfo?.admission_number || "ADM-1001";
  const rollNo = studentInfo?.roll_number || "NUR-01";

  const displayFees = fees && fees.length > 0 ? fees : [
    { description: isUrdu ? "ماہانہ فیس جون 2026" : "Monthly Tuition Fee June 2026", due_date: "2026-06-10", amount: 12000, status: "paid" },
    { description: isUrdu ? "ماہانہ فیس مئی 2026" : "Monthly Tuition Fee May 2026", due_date: "2026-05-10", amount: 12000, status: "paid" }
  ];

  const displayAttendance = attendance && attendance.length > 0 ? attendance : [
    { date: "2026-06-30", status: "present" },
    { date: "2026-06-29", status: "present" },
    { date: "2026-06-28", status: "present" },
    { date: "2026-06-27", status: "absent" },
    { date: "2026-06-26", status: "present" }
  ];

  const handleLogout = () => {
    Cookies.remove("auth_token", { path: '/' });
    Cookies.remove("user_role", { path: '/' });
    Cookies.remove("user_email", { path: '/' });
    if (typeof document !== "undefined") {
      document.cookie = "auth_token=; path=/; max-age=0";
      document.cookie = "user_role=; path=/; max-age=0";
    }
    window.location.href = "/login";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-gradient-to-br from-pink-50/60 via-sky-50/40 to-rose-50/50 animate-in fade-in duration-500">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-parent-doc, .printable-parent-doc * {
            visibility: visible !important;
          }
          .printable-parent-doc {
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

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-pink-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-6">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground mr-2" />
        <div className="flex items-center gap-3">
          <img src="/school_logo.png" alt="Logo" className="w-9 h-9 object-contain" />
          <div>
            <h2 className="font-black text-sm text-slate-900 uppercase">Bright School</h2>
            <p className="text-[10px] text-pink-600 font-bold uppercase">& Montessori System</p>
          </div>
          <Badge className="bg-pink-100 text-pink-700 font-bold text-xs border border-pink-200 ml-2">
            👨‍👩‍👧 Parent Portal
          </Badge>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div className="flex flex-col items-end hidden md:flex text-right">
            <span className="text-sm font-bold text-slate-800">{fatherName}</span>
            <span className="text-xs text-slate-500">Student: {studentName}</span>
          </div>
          <Avatar className="h-9 w-9 border-2 border-pink-300">
            <AvatarImage src="/admin_avatar.png" />
            <AvatarFallback>P</AvatarFallback>
          </Avatar>
          <Button onClick={handleLogout} variant="outline" size="sm" className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 ml-1">
            <LogOut className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'لاگ آؤٹ' : 'Logout'}</span>
          </Button>
        </div>
      </header>

      {/* REPORT CARD MODAL */}
      {reportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-pink-200 printable-parent-doc my-8 text-slate-900">
            <div className="flex items-center justify-between no-print-btn border-b pb-3 mb-4">
              <h3 className="font-black text-xl flex items-center gap-2 text-slate-900">
                <Award className="w-6 h-6 text-rose-600" />
                {isUrdu ? 'طالب علم کا سالانہ رزلٹ کارڈ' : 'Official Student Academic Progress Report'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setReportModal(false)} className="rounded-full">✕</Button>
            </div>

            <div className="border-2 border-slate-900 p-6 rounded-2xl space-y-6 bg-white">
              <div className="flex items-center justify-between border-b-2 border-rose-600 pb-4">
                <div className="flex items-center gap-4">
                  <img src="/school_logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                  <div>
                    <h2 className="text-xl font-black text-rose-700 uppercase">Bright School & Montessori System</h2>
                    <p className="text-xs font-bold text-slate-600">Session 2026-2027 | Student Progress Report Card</p>
                  </div>
                </div>
                <Badge className="bg-rose-700 text-white font-black px-3 py-1 text-xs">GRADE A+</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-pink-50 p-4 rounded-xl text-xs border border-pink-200">
                <div><span className="text-slate-500 block font-semibold">Student Name:</span><span className="font-black text-sm text-slate-900">{studentName}</span></div>
                <div><span className="text-slate-500 block font-semibold">Father Name:</span><span className="font-bold text-slate-800">{fatherName}</span></div>
                <div><span className="text-slate-500 block font-semibold">Admission No:</span><span className="font-mono font-bold text-rose-700">{admNo}</span></div>
                <div><span className="text-slate-500 block font-semibold">Roll No:</span><span className="font-mono font-bold text-slate-800">{rollNo}</span></div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-300">
                <Table>
                  <TableHeader className="bg-slate-100">
                    <TableRow><TableHead className="font-black text-slate-900">Subject</TableHead><TableHead className="text-center font-black text-slate-900">Total</TableHead><TableHead className="text-center font-black text-slate-900">Obtained</TableHead><TableHead className="text-right pr-4 font-black text-slate-900">Grade</TableHead></TableRow>
                  </TableHeader>
                  <TableBody className="text-xs font-semibold">
                    <TableRow><TableCell className="font-bold">Mathematics</TableCell><TableCell className="text-center">100</TableCell><TableCell className="text-center font-black text-emerald-700">94</TableCell><TableCell className="text-right pr-4"><Badge className="bg-emerald-600 text-white text-[10px]">A+</Badge></TableCell></TableRow>
                    <TableRow><TableCell className="font-bold">English Literature</TableCell><TableCell className="text-center">100</TableCell><TableCell className="text-center font-black text-emerald-700">88</TableCell><TableCell className="text-right pr-4"><Badge className="bg-emerald-600 text-white text-[10px]">A</Badge></TableCell></TableRow>
                    <TableRow><TableCell className="font-bold">General Science</TableCell><TableCell className="text-center">100</TableCell><TableCell className="text-center font-black text-emerald-700">92</TableCell><TableCell className="text-right pr-4"><Badge className="bg-emerald-600 text-white text-[10px]">A+</Badge></TableCell></TableRow>
                    <TableRow><TableCell className="font-bold">Urdu Language</TableCell><TableCell className="text-center">100</TableCell><TableCell className="text-center font-black text-emerald-700">90</TableCell><TableCell className="text-right pr-4"><Badge className="bg-emerald-600 text-white text-[10px]">A+</Badge></TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
                <div><span className="text-[10px] text-pink-200 block uppercase font-bold">Overall Status</span><span className="font-black text-base text-amber-300">Class Rank: 1st Position 🏆</span></div>
                <div className="text-right"><span className="text-xs font-bold block">Total Marks: 364 / 400</span><span className="text-sm font-black text-emerald-300">Percentage: 91.0%</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 no-print-btn">
              <Button variant="outline" onClick={() => setReportModal(false)} className="rounded-xl font-bold">Close</Button>
              <Button onClick={handlePrint} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print Report Card
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ID CARD MODAL */}
      {idCardModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-pink-200 printable-parent-doc space-y-6 text-slate-900">
            <div className="flex items-center justify-between no-print-btn border-b pb-3">
              <h3 className="font-black text-lg flex items-center gap-2 text-slate-900">
                <QrCode className="w-5 h-5 text-rose-600" /> Printable Student ID Card
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIdCardModal(false)} className="rounded-full">✕</Button>
            </div>

            <div className="w-[330px] mx-auto bg-gradient-to-br from-rose-700 via-pink-600 to-rose-800 rounded-2xl p-4 text-white shadow-xl border-2 border-amber-300 space-y-3">
              <div className="flex items-center gap-3 border-b border-white/20 pb-2">
                <img src="/school_logo.png" alt="Logo" className="w-10 h-10 object-contain bg-white/20 p-1 rounded-xl" />
                <div>
                  <h4 className="font-black text-xs uppercase">BRIGHT SCHOOL</h4>
                  <p className="text-[9px] text-pink-200 font-bold uppercase">& Montessori System</p>
                </div>
                <Badge className="ml-auto bg-amber-400 text-slate-900 font-black text-[9px]">STUDENT</Badge>
              </div>

              <div className="flex gap-3 items-center">
                <div className="w-20 h-24 rounded-xl bg-white/30 border-2 border-white/60 flex items-center justify-center font-black text-3xl shrink-0">
                  {studentName.charAt(0)}
                </div>
                <div className="space-y-1 text-xs overflow-hidden flex-1">
                  <div><span className="text-[9px] opacity-75 uppercase block">Student Name</span><span className="font-black text-amber-200 block truncate">{studentName}</span></div>
                  <div><span className="text-[9px] opacity-75 uppercase block">Father Name</span><span className="font-bold block truncate">{fatherName}</span></div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] pt-0.5">
                    <div><span className="opacity-75 block text-[8px]">ADM NO</span><span className="font-mono font-bold text-amber-300">{admNo}</span></div>
                    <div><span className="opacity-75 block text-[8px]">ROLL NO</span><span className="font-mono font-bold text-amber-300">{rollNo}</span></div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/20 pt-2 flex items-center justify-between text-[8px]">
                <div><span className="block opacity-75">Emergency Contact:</span><span className="font-mono font-bold text-amber-200">0300-1234567</span></div>
                <div className="bg-white p-1 rounded text-[7px] font-mono font-bold text-slate-900">QR SECURE</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 no-print-btn">
              <Button variant="outline" onClick={() => setIdCardModal(false)} className="rounded-xl font-bold">Close</Button>
              <Button onClick={handlePrint} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print ID Card
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-pink-200 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              🎓
            </div>
            <div>
              <Badge className="bg-pink-100 text-pink-700 font-bold text-xs mb-1">
                {isUrdu ? 'خوش آمدید! والدین پورٹل' : 'Welcome Parent Portal'}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{studentName}</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {isUrdu ? `والد کا نام: ${fatherName} | ایڈمیشن نمبر: ${admNo} | رول نمبر: ${rollNo}` : `Father: ${fatherName} | Adm No: ${admNo} | Roll No: ${rollNo}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button onClick={() => setReportModal(true)} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 px-5 shadow-md flex items-center gap-2">
              <Award className="w-4 h-4" />
              {isUrdu ? 'رزلٹ کارڈ حاصل کریں' : 'Get Progress Report'}
            </Button>
            <Button onClick={() => setIdCardModal(true)} variant="outline" className="rounded-xl border-pink-300 text-pink-700 hover:bg-pink-50 font-bold text-xs h-11 px-4 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-pink-600" />
              {isUrdu ? 'سٹوڈنٹ آئی ڈی کارڈ' : 'Student ID Card'}
            </Button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-pink-200 shadow-sm bg-white rounded-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">{isUrdu ? 'حاضری کا تناسب' : 'Attendance Rate'}</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">94%</h3>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1"><CheckCircle2 className="w-3.5 h-3.5"/> Excellent Regularity</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CalendarCheck className="w-6 h-6"/></div>
            </div>
          </Card>

          <Card className="border-pink-200 shadow-sm bg-white rounded-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">{isUrdu ? 'ماہانہ فیس سٹیٹس' : 'Monthly Fee Status'}</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">Rs. 12,000</h3>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1"><CheckCircle2 className="w-3.5 h-3.5"/> Paid & Verified</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><FileText className="w-6 h-6"/></div>
            </div>
          </Card>

          <Card className="border-pink-200 shadow-sm bg-white rounded-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">{isUrdu ? 'سالانہ رزلٹ پوزیشن' : 'Academic Position'}</p>
                <h3 className="text-3xl font-black text-rose-600 mt-1">1st Rank 🏆</h3>
                <span className="text-[11px] text-rose-700 font-bold flex items-center gap-1 mt-1"><Award className="w-3.5 h-3.5"/> Top Performer</span>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Award className="w-6 h-6"/></div>
            </div>
          </Card>
        </div>

        {/* Detailed Academic Performance Section */}
        <Card id="exams" className="border-pink-200 shadow-sm bg-white rounded-3xl overflow-hidden scroll-mt-20">
          <CardHeader className="bg-pink-50/60 border-b border-pink-100 p-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900">
                <Award className="w-5 h-5 text-rose-600" />
                {isUrdu ? 'بچے کے تعلیمی رزلٹ اور تفصیلی نمبر' : 'Child Academic Marks Breakdown'}
              </CardTitle>
              <CardDescription className="text-xs font-semibold mt-0.5">
                {isUrdu ? 'تمام مضامین کے امتحانی نمبر اور استاد کے ریمارکس' : 'Subject wise examination evaluation for Session 2026'}
              </CardDescription>
            </div>
            <Button onClick={() => setReportModal(true)} size="sm" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs">
              {isUrdu ? 'پرنٹ رزلٹ کارڈ' : 'Print Marksheet'}
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6 font-bold">{isUrdu ? 'مضمون' : 'Subject Name'}</TableHead>
                  <TableHead className="font-bold text-center">{isUrdu ? 'کل نمبر' : 'Total Marks'}</TableHead>
                  <TableHead className="font-bold text-center">{isUrdu ? 'حاصل کردہ نمبر' : 'Obtained Marks'}</TableHead>
                  <TableHead className="text-right pr-6 font-bold">{isUrdu ? 'گریڈ' : 'Grade'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-semibold">
                <TableRow><TableCell className="pl-6 font-bold text-slate-900">Mathematics & Logic</TableCell><TableCell className="text-center font-mono">100</TableCell><TableCell className="text-center font-mono font-black text-emerald-600 text-sm">94</TableCell><TableCell className="text-right pr-6"><Badge className="bg-emerald-600 text-white text-[10px]">A+ Exceptional</Badge></TableCell></TableRow>
                <TableRow><TableCell className="pl-6 font-bold text-slate-900">English Literature</TableCell><TableCell className="text-center font-mono">100</TableCell><TableCell className="text-center font-mono font-black text-emerald-600 text-sm">88</TableCell><TableCell className="text-right pr-6"><Badge className="bg-emerald-600 text-white text-[10px]">A Outstanding</Badge></TableCell></TableRow>
                <TableRow><TableCell className="pl-6 font-bold text-slate-900">General Science</TableCell><TableCell className="text-center font-mono">100</TableCell><TableCell className="text-center font-mono font-black text-emerald-600 text-sm">92</TableCell><TableCell className="text-right pr-6"><Badge className="bg-emerald-600 text-white text-[10px]">A+ Exceptional</Badge></TableCell></TableRow>
                <TableRow><TableCell className="pl-6 font-bold text-slate-900">Urdu Language</TableCell><TableCell className="text-center font-mono">100</TableCell><TableCell className="text-center font-mono font-black text-emerald-600 text-sm">90</TableCell><TableCell className="text-right pr-6"><Badge className="bg-emerald-600 text-white text-[10px]">A+ Exceptional</Badge></TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Fee Details Section */}
        <Card id="fees" className="border-pink-200 shadow-sm bg-white rounded-3xl overflow-hidden scroll-mt-20">
          <CardHeader className="bg-pink-50/60 border-b border-pink-100 p-6">
            <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900">
              <CreditCard className="w-5 h-5 text-rose-600" />
              {isUrdu ? 'فیس کی تفصیلات' : 'Fee Challans & Payments'}
            </CardTitle>
            <CardDescription className="text-xs font-semibold mt-0.5">
              {isUrdu ? 'ماہانہ تعلیمی فیس اور چالان کی تفصیلات' : 'Monthly tuition fees and payment verification records'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6 font-bold">{isUrdu ? 'تفصیل' : 'Challan Description'}</TableHead>
                  <TableHead className="font-bold text-center">{isUrdu ? 'آخری تاریخ' : 'Due Date'}</TableHead>
                  <TableHead className="font-bold text-center">{isUrdu ? 'رقم' : 'Amount'}</TableHead>
                  <TableHead className="text-right pr-6 font-bold">{isUrdu ? 'سٹیٹس' : 'Status'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-semibold">
                {displayFees.map((fee: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="pl-6 font-bold text-slate-900">
                      {fee.description || fee.title || `Tuition Fee ${fee.month || ''}`}
                    </TableCell>
                    <TableCell className="text-center font-mono">{fee.due_date || fee.created_at?.split('T')[0] || "2026-06-10"}</TableCell>
                    <TableCell className="text-center font-mono font-black text-slate-900 text-sm">
                      Rs. {fee.amount || 12000}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge className={fee.status === "paid" || fee.is_paid ? "bg-emerald-600 text-white text-[10px]" : "bg-amber-500 text-white text-[10px]"}>
                        {fee.status === "paid" || fee.is_paid ? (isUrdu ? 'ادا شدہ' : 'Paid & Verified') : (isUrdu ? 'غیر ادا شدہ' : 'Unpaid')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Attendance Details Section */}
        <Card id="attendance" className="border-pink-200 shadow-sm bg-white rounded-3xl overflow-hidden scroll-mt-20">
          <CardHeader className="bg-pink-50/60 border-b border-pink-100 p-6">
            <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900">
              <CalendarCheck className="w-5 h-5 text-rose-600" />
              {isUrdu ? 'حاضری کا ریکارڈ' : 'Student Attendance Log'}
            </CardTitle>
            <CardDescription className="text-xs font-semibold mt-0.5">
              {isUrdu ? 'روزانہ کی حاضری اور چھٹیوں کا تفصیلی ریکارڈ' : 'Daily class attendance log and regularity statistics'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6 font-bold">{isUrdu ? 'تاریخ' : 'Date'}</TableHead>
                  <TableHead className="text-right pr-6 font-bold">{isUrdu ? 'حاضری سٹیٹس' : 'Attendance Status'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-semibold">
                {displayAttendance.map((record: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="pl-6 font-bold text-slate-900 font-mono">
                      {record.date || record.created_at?.split('T')[0]}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge className={record.status === "present" || record.status === "Present" ? "bg-emerald-600 text-white text-[10px]" : "bg-rose-500 text-white text-[10px]"}>
                        {record.status === "present" || record.status === "Present" ? (isUrdu ? 'حاضر (Present)' : 'Present') : (isUrdu ? 'غیر حاضر (Absent)' : 'Absent')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
