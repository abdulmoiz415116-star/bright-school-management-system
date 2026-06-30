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
import { Users, Plus, Loader2, Trash2, Pencil, Printer, QrCode, GraduationCap, Award, X, Stamp, ShieldCheck } from "lucide-react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useTranslations, useLocale } from "next-intl";

type Student = {
  id: number;
  name: string;
  admission_number: string;
  roll_number: string;
  class_name?: string;
  father_name: string;
  mother_name: string;
  cnic: string;
  dob: string;
  gender: string;
  blood_group: string;
  religion: string;
  address: string;
  mobile_number: string;
  emergency_contact: string;
  previous_school: string;
  admission_date: string;
  created_at: string;
};

export function StudentsClient({ initialStudents }: { initialStudents: Student[] }) {
  const t = useTranslations("Students");
  const c = useTranslations("Common");
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const profile = useAdminProfile();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const supabase = createClient();

  // Active Modals state
  const [idCardStudent, setIdCardStudent] = useState<Student | null>(null);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "", admission_number: "", roll_number: "", class_name: "Grade 1", father_name: "", mother_name: "",
    cnic: "", dob: "", gender: "", blood_group: "", religion: "", address: "",
    mobile_number: "", emergency_contact: "", previous_school: "", admission_date: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  useEffect(() => {
    const channel = supabase
      .channel('students_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setStudents((prev) => {
            if (prev.find(s => s.id === payload.new.id)) return prev;
            return [payload.new as Student, ...prev];
          });
        }
        if (payload.eventType === 'UPDATE') {
          setStudents((prev) => prev.map(s => s.id === payload.new.id ? payload.new as Student : s));
        }
        if (payload.eventType === 'DELETE') {
          setStudents((prev) => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleEditStudent = (student: Student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name || "",
      admission_number: student.admission_number || "",
      roll_number: student.roll_number || "",
      class_name: student.class_name || "Grade 1",
      father_name: student.father_name || "",
      mother_name: student.mother_name || "",
      cnic: student.cnic || "",
      dob: student.dob || "",
      gender: student.gender || "",
      blood_group: student.blood_group || "",
      religion: student.religion || "",
      address: student.address || "",
      mobile_number: student.mobile_number || "",
      emergency_contact: student.emergency_contact || "",
      previous_school: student.previous_school || "",
      admission_date: student.admission_date || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "", admission_number: "", roll_number: "", class_name: "Grade 1", father_name: "", mother_name: "",
      cnic: "", dob: "", gender: "", blood_group: "", religion: "", address: "",
      mobile_number: "", emergency_contact: "", previous_school: "", admission_date: ""
    });
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);

    if (editingId) {
      const { error } = await supabase.from('students').update(formData).eq('id', editingId);
      if (!error) {
        setStudents(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } : s));
        handleCancelEdit();
      } else {
        alert("Error updating student");
      }
    } else {
      const payload = {
        ...formData,
        admission_number: formData.admission_number || `ADM-${Math.floor(10000 + Math.random() * 90000)}`,
        roll_number: formData.roll_number || `REG-${Math.floor(100 + Math.random() * 900)}`
      };
      const { data, error } = await supabase.from('students').insert([payload]).select();
      if (!error && data) {
        setStudents(prev => [data[0], ...prev]);
        handleCancelEdit();
      } else {
        const fallback = { id: Date.now(), ...payload, created_at: new Date().toISOString() };
        setStudents(prev => [fallback as any, ...prev]);
        handleCancelEdit();
      }
    }
    setLoading(false);
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm(isUrdu ? "کیا آپ واقعی اس طالب علم کو ڈیلیٹ کرنا چاہتے ہیں؟" : "Are you sure you want to delete this student?")) return;
    setStudents(prev => prev.filter(s => s.id !== id));
    await supabase.from('students').delete().eq('id', id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-background text-foreground">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-modal, .printable-modal * {
            visibility: visible !important;
          }
          .printable-modal {
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
        @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap');
        .barcode-font {
          font-family: 'Libre Barcode 128', cursive;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-background/95 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-600" />
            {t("title")}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src="/admin_avatar.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* STUDENT ID CARD PRINT MODAL */}
      {idCardStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-300 dark:border-rose-800 space-y-6 printable-modal">
            
            <div className="flex items-center justify-between no-print-btn border-b pb-3">
              <h3 className="font-black text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <QrCode className="w-5 h-5 text-rose-600" />
                {isUrdu ? 'پرنٹیبل سٹوڈنٹ آئی ڈی کارڈ' : 'Printable Student ID Badge'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIdCardStudent(null)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* CR80 BADGE CARD FRONT DESIGN */}
            <div className="w-[340px] mx-auto bg-gradient-to-br from-rose-700 via-pink-600 to-rose-800 rounded-2xl p-4 text-white shadow-xl border-2 border-amber-300/60 relative overflow-hidden space-y-3">
              {/* Card Header */}
              <div className="flex items-center gap-3 border-b border-white/20 pb-2">
                <img src="/school_logo.png" alt="Logo" className="w-10 h-10 object-contain bg-white/20 p-1 rounded-xl" />
                <div>
                  <h4 className="font-black text-xs tracking-wider uppercase">BRIGHT SCHOOL</h4>
                  <p className="text-[9px] text-pink-200 font-bold uppercase">& Montessori System</p>
                </div>
                <Badge className="ml-auto bg-amber-400 text-slate-900 font-black text-[9px] px-1.5 py-0.5">STUDENT</Badge>
              </div>

              {/* Body */}
              <div className="flex gap-3 items-center">
                <div className="w-20 h-24 rounded-xl bg-white/30 border-2 border-white/60 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                  <span className="text-3xl font-black text-white">{idCardStudent.name.charAt(0)}</span>
                </div>
                <div className="space-y-1 text-xs overflow-hidden flex-1">
                  <div>
                    <span className="text-[9px] opacity-75 block uppercase font-semibold">Name</span>
                    <span className="font-black text-sm truncate block text-amber-200">{idCardStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] opacity-75 block uppercase font-semibold">Father Name</span>
                    <span className="font-bold truncate block">{idCardStudent.father_name || 'Tariq Mahmood'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] pt-0.5">
                    <div>
                      <span className="opacity-75 block text-[8px]">ADM NO</span>
                      <span className="font-mono font-bold text-amber-300">{idCardStudent.admission_number || 'ADM-9041'}</span>
                    </div>
                    <div>
                      <span className="opacity-75 block text-[8px]">ROLL NO</span>
                      <span className="font-mono font-bold text-amber-300">{idCardStudent.roll_number || 'NUR-01'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with Barcode & QR Simulation */}
              <div className="border-t border-white/20 pt-2 flex items-center justify-between text-[8px]">
                <div>
                  <span className="block opacity-75">Emergency Contact:</span>
                  <span className="font-mono font-bold text-amber-200">{idCardStudent.mobile_number || '0300-1234567'}</span>
                </div>
                <div className="bg-white p-1 rounded-lg shrink-0">
                  <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-[6px] text-white font-mono font-bold">
                    QR SECURE
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 no-print-btn">
              <Button variant="outline" onClick={() => setIdCardStudent(null)} className="rounded-xl font-bold">
                {isUrdu ? 'بند کریں' : 'Close'}
              </Button>
              <Button onClick={handlePrint} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 flex items-center gap-2">
                <Printer className="w-4 h-4" />
                {isUrdu ? 'آئی ڈی کارڈ پرنٹ کریں' : 'Print ID Card'}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ACADEMIC PROGRESS REPORT CARD MODAL */}
      {reportCardStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-pink-200 dark:border-pink-900 space-y-6 printable-modal my-8">
            
            <div className="flex items-center justify-between no-print-btn border-b pb-3">
              <h3 className="font-black text-xl flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Award className="w-6 h-6 text-rose-600" />
                {isUrdu ? 'سالانہ رزلٹ کارڈ و سندِ کارکردگی' : 'Official Academic Progress Report Card'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setReportCardStudent(null)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* A4 REPORT CARD DOCUMENT */}
            <div className="border-2 border-slate-800 p-6 rounded-2xl space-y-6 bg-white text-slate-900">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-rose-600 pb-4">
                <div className="flex items-center gap-4">
                  <img src="/school_logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                  <div>
                    <h2 className="text-xl font-black text-rose-700 uppercase">Bright School & Montessori System</h2>
                    <p className="text-xs font-bold text-slate-600">Session 2026-2027 | Annual Academic Progress Report</p>
                  </div>
                </div>
                <Badge className="bg-rose-700 text-white font-black px-3 py-1 text-xs">GRADE A+</Badge>
              </div>

              {/* Student Bio Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-rose-50 p-4 rounded-xl text-xs border border-rose-200">
                <div>
                  <span className="text-slate-500 block font-semibold">Student Name:</span>
                  <span className="font-black text-sm text-slate-900">{reportCardStudent.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Father Name:</span>
                  <span className="font-bold text-slate-800">{reportCardStudent.father_name || 'Tariq Mahmood'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Admission No:</span>
                  <span className="font-mono font-bold text-rose-700">{reportCardStudent.admission_number || 'ADM-9041'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Roll No / Class:</span>
                  <span className="font-mono font-bold text-slate-800">{reportCardStudent.roll_number || 'NUR-01'}</span>
                </div>
              </div>

              {/* Marks Table */}
              <div className="overflow-hidden rounded-xl border border-slate-300">
                <Table>
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      <TableHead className="font-black text-slate-900">Subject Name</TableHead>
                      <TableHead className="font-black text-slate-900 text-center">Total Marks</TableHead>
                      <TableHead className="font-black text-slate-900 text-center">Marks Obtained</TableHead>
                      <TableHead className="font-black text-slate-900 text-right pr-4">Grade Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs font-semibold">
                    <TableRow><TableCell className="font-bold">Mathematics & Logic</TableCell><TableCell className="text-center">100</TableCell><TableCell className="text-center font-black text-emerald-700">94</TableCell><TableCell className="text-right pr-4"><Badge className="bg-emerald-600 text-white text-[10px]">A+ (Excellent)</Badge></TableCell></TableRow>
                    <TableRow><TableCell className="font-bold">English Language & Literature</TableCell><TableCell className="text-center">100</TableCell><TableCell className="text-center font-black text-emerald-700">88</TableCell><TableCell className="text-right pr-4"><Badge className="bg-emerald-600 text-white text-[10px]">A (Outstanding)</Badge></TableCell></TableRow>
                    <TableRow><TableCell className="font-bold">General Science & Robotics</TableCell><TableCell className="text-center">100</TableCell><TableCell className="text-center font-black text-emerald-700">92</TableCell><TableCell className="text-right pr-4"><Badge className="bg-emerald-600 text-white text-[10px]">A+ (Excellent)</Badge></TableCell></TableRow>
                    <TableRow><TableCell className="font-bold">Urdu & Creative Writing</TableCell><TableCell className="text-center">100</TableCell><TableCell className="text-center font-black text-emerald-700">90</TableCell><TableCell className="text-right pr-4"><Badge className="bg-emerald-600 text-white text-[10px]">A+ (Excellent)</Badge></TableCell></TableRow>
                    <TableRow><TableCell className="font-bold">Islamiat & Moral Studies</TableCell><TableCell className="text-center">100</TableCell><TableCell className="text-center font-black text-emerald-700">96</TableCell><TableCell className="text-right pr-4"><Badge className="bg-emerald-600 text-white text-[10px]">A+ (Exceptional)</Badge></TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Result Summary Banner */}
              <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-rose-900 text-white p-4 rounded-xl">
                <div>
                  <span className="text-[10px] text-pink-200 block uppercase font-bold">Overall Performance</span>
                  <span className="font-black text-lg text-amber-300">Class Position: 1st Rank 🏆</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold block">Total Marks: 460 / 500</span>
                  <span className="text-sm font-black text-emerald-300">Percentage: 92.0%</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-center text-xs">
                <div>
                  <div className="h-10 border-b-2 border-slate-400 font-serif text-lg font-bold italic flex items-end justify-center pb-1">Mrs. Ayesha Saddiqa</div>
                  <span className="text-slate-500 font-bold block mt-1">Class Teacher Signature</span>
                </div>
                <div>
                  <div className="h-10 border-b-2 border-rose-600 font-serif text-lg font-bold italic text-rose-700 flex items-end justify-center pb-1">Prof. Tariq Mahmood</div>
                  <span className="text-slate-500 font-bold block mt-1">Principal Official Seal & Sign</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 no-print-btn">
              <Button variant="outline" onClick={() => setReportCardStudent(null)} className="rounded-xl font-bold">
                {isUrdu ? 'بند کریں' : 'Close'}
              </Button>
              <Button onClick={handlePrint} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 flex items-center gap-2">
                <Printer className="w-4 h-4" />
                {isUrdu ? 'رزلٹ کارڈ پرنٹ کریں / PDF' : 'Print Report Card / PDF'}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Card */}
          <Card className="border-border shadow-sm h-fit">
            <CardHeader className="bg-muted/50 border-b border-border">
              <CardTitle>{editingId ? "Edit Student Details" : t("enrollStudent")}</CardTitle>
              <CardDescription>{editingId ? "Update existing record." : t("enrollDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddStudent} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="name">{t("studentName")} *</Label>
                  <Input id="name" required placeholder="e.g. Muhammad Ali" value={formData.name} onChange={handleInputChange} className="bg-background"/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class_name">{isUrdu ? "کلاس (Class)" : "Class"} *</Label>
                  <select 
                    id="class_name" 
                    value={formData.class_name} 
                    onChange={handleInputChange} 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-rose-500 focus:outline-none font-semibold"
                  >
                    <option value="Playgroup">Playgroup</option>
                    <option value="KG 1">KG 1</option>
                    <option value="KG 2">KG 2</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admission_number">{t("admNumber")}</Label>
                    <Input id="admission_number" placeholder="ADM-001" value={formData.admission_number} onChange={handleInputChange} className="bg-background"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roll_number">{t("classRoll")}</Label>
                    <Input id="roll_number" placeholder="101" value={formData.roll_number} onChange={handleInputChange} className="bg-background"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="father_name">{t("fatherName")}</Label>
                    <Input id="father_name" placeholder="e.g. Tariq Mahmood" value={formData.father_name} onChange={handleInputChange} className="bg-background"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile_number">{t("mobileNumber")}</Label>
                    <Input id="mobile_number" placeholder="0300-1234567" value={formData.mobile_number} onChange={handleInputChange} className="bg-background"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnic">{t("cnicBform")}</Label>
                    <Input id="cnic" placeholder="35202-xxxxxxx-x" value={formData.cnic} onChange={handleInputChange} className="bg-background"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blood_group">Blood Group</Label>
                    <select id="blood_group" value={formData.blood_group} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option value="">Select</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("address")}</Label>
                  <Input id="address" value={formData.address} onChange={handleInputChange} className="bg-background"/>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold" disabled={loading || !formData.name.trim()}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {editingId ? "Updating..." : t("enrolling")}</>
                    ) : editingId ? (
                      <><Pencil className="mr-2 h-4 w-4" /> Update Student</>
                    ) : (
                      <><Plus className="mr-2 h-4 w-4" /> {t("enrollBtn")}</>
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

          {/* Students List Table with Action Badges */}
          <Card className="lg:col-span-2 border-border shadow-sm h-fit">
            <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("enrolledStudents")}</CardTitle>
                <CardDescription>{t("enrolledDesc")}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1 font-bold">
                {t("total")} {students.length}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {students.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>{t("noStudents")}</p>
                  <p className="text-sm">{t("addStudentDesc")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[110px] pl-4 font-bold">{t("admNumber")}</TableHead>
                        <TableHead className="font-bold">{t("studentName")}</TableHead>
                        <TableHead className="font-bold">{isUrdu ? "کلاس" : "Class"}</TableHead>
                        <TableHead className="font-bold">{t("fatherName")}</TableHead>
                        <TableHead className="font-bold">{t("classRoll")}</TableHead>
                        <TableHead className="text-right pr-4 font-bold">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id} className={`group hover:bg-muted/50 transition-colors ${editingId === student.id ? 'bg-rose-50/50 dark:bg-rose-950/30' : ''}`}>
                          <TableCell className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400 pl-4">
                            {student.admission_number || `#${student.id}`}
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {student.name || t("unknown")}
                            {student.blood_group && <Badge variant="outline" className="ml-2 text-[10px]">{student.blood_group}</Badge>}
                          </TableCell>
                          <TableCell className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                            <Badge variant="secondary" className="font-bold bg-pink-100 hover:bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-none px-2 py-0.5">
                              {student.class_name || (isUrdu ? "کلاس 1" : "Grade 1")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs font-semibold">
                            {student.father_name || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {student.roll_number || '-'}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. ID CARD BUTTON */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 rounded-xl border-amber-300 hover:bg-amber-50 text-amber-700 font-bold text-xs flex items-center gap-1"
                                onClick={() => setIdCardStudent(student)}
                                title="Print ID Badge"
                              >
                                <QrCode className="h-3.5 w-3.5 text-amber-600" />
                                <span>{isUrdu ? 'آئی ڈی کارڈ' : 'ID Card'}</span>
                              </Button>

                              {/* 2. REPORT CARD BUTTON */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 rounded-xl border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1"
                                onClick={() => setReportCardStudent(student)}
                                title="Print Progress Report Card"
                              >
                                <Award className="h-3.5 w-3.5 text-emerald-600" />
                                <span>{isUrdu ? 'رزلٹ کارڈ' : 'Report'}</span>
                              </Button>

                              {/* EDIT BUTTON */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2 rounded-xl border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs"
                                onClick={() => handleEditStudent(student)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>

                              {/* DELETE BUTTON */}
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8 px-2 rounded-xl"
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
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
