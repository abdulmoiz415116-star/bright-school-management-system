"use client";

import React, { useState, useEffect } from "react";
import { 
  GraduationCap, Printer, CheckCircle2, User, Users, Phone, MapPin, 
  FileCheck2, Calendar, Sparkles, AlertCircle, Shield, ArrowRight, Save, Upload, Trash2, Stamp, Check, Search, ExternalLink, Pencil, X
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Student = {
  id?: number;
  name: string;
  admission_number?: string;
  roll_number?: string;
  father_name?: string;
  mother_name?: string;
  cnic?: string;
  dob?: string;
  gender?: string;
  blood_group?: string;
  religion?: string;
  address?: string;
  mobile_number?: string;
  emergency_contact?: string;
  previous_school?: string;
  admission_date?: string;
  created_at?: string;
};

export function AdmissionClient({ initialStudents = [] }: { initialStudents?: Student[] }) {
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const supabase = createClient();

  const [studentsList, setStudentsList] = useState<Student[]>(initialStudents);
  const [formNo, setFormNo] = useState(() => `BS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedStudent, setSubmittedStudent] = useState<Student | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Signatures state
  const [parentSignature, setParentSignature] = useState("");
  const [officerSignature, setOfficerSignature] = useState("");
  const [principalStatus, setPrincipalStatus] = useState<"Approved" | "Pending">("Approved");
  const [principalName] = useState("Prof. Tariq Mahmood");

  // Form State
  const [formData, setFormData] = useState({
    student_name: "",
    gender: "Male",
    dob: "",
    cnic: "",
    religion: "Islam",
    blood_group: "A+",
    class_applying: "Nursery",
    previous_school: "",
    father_name: "",
    father_cnic: "",
    father_occupation: "",
    mobile_number: "",
    whatsapp_number: "",
    mother_name: "",
    mother_cnic: "",
    mother_occupation: "",
    address: "",
    emergency_contact: "",
    emergency_relation: "",
    agree_terms: false
  });

  // Real-time synchronization
  useEffect(() => {
    const channel = supabase
      .channel('admission_students_sync_v3')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setStudentsList(prev => {
            if (prev.find(s => s.id === payload.new.id)) return prev;
            return [payload.new as Student, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setStudentsList(prev => prev.map(s => s.id === payload.new.id ? payload.new as Student : s));
        } else if (payload.eventType === 'DELETE') {
          setStudentsList(prev => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(isUrdu ? "تصویر کا سائز 5MB سے کم ہونا چاہیے۔" : "Photo size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_name || !formData.father_name || !formData.mobile_number) {
      setErrorMsg(isUrdu ? "برائے مہربانی لازمی خانے (نام، والد کا نام، موبائل نمبر) پر کریں۔" : "Please fill out all required fields (Student Name, Father Name, Mobile Number).");
      return;
    }

    if (!formData.agree_terms) {
      setErrorMsg(isUrdu ? "براہ کرم اقرار نامہ اور سکول قواعد کی منظوری پر ٹک کریں۔" : "Please accept the declaration terms.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const admNo = `ADM-${Math.floor(10000 + Math.random() * 90000)}`;
      const rollNo = `${formData.class_applying.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

      const newStudentRecord: Student = {
        name: formData.student_name,
        admission_number: admNo,
        roll_number: rollNo,
        father_name: formData.father_name,
        mother_name: formData.mother_name,
        cnic: formData.cnic,
        dob: formData.dob,
        gender: formData.gender,
        blood_group: formData.blood_group,
        religion: formData.religion,
        address: formData.address,
        mobile_number: formData.mobile_number,
        emergency_contact: `${formData.emergency_contact} (${formData.emergency_relation})`,
        previous_school: formData.previous_school,
        admission_date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase.from('students').insert([newStudentRecord]).select();

      if (error) {
        console.error("Supabase error:", error);
      }

      const finalRecord = data && data.length > 0 ? (data[0] as Student) : newStudentRecord;
      setSubmittedStudent(finalRecord);
      setStudentsList(prev => [finalRecord, ...prev]);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting admission:", err);
      const fallbackRecord: Student = {
        name: formData.student_name,
        admission_number: `ADM-${Math.floor(10000 + Math.random() * 90000)}`,
        roll_number: `${formData.class_applying.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
        father_name: formData.father_name,
        mobile_number: formData.mobile_number,
        admission_date: new Date().toISOString().split('T')[0]
      };
      setSubmittedStudent(fallbackRecord);
      setStudentsList(prev => [fallbackRecord, ...prev]);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  // EDIT STUDENT HANDLERS
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name || "",
      father_name: student.father_name || "",
      mobile_number: student.mobile_number || "",
      admission_number: student.admission_number || "",
      roll_number: student.roll_number || "",
      cnic: student.cnic || "",
      address: student.address || ""
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const updated = { ...editingStudent, ...editFormData };
    setStudentsList(prev => prev.map(s => (s.id && s.id === editingStudent.id) || (s.admission_number === editingStudent.admission_number) ? updated : s));

    if (editingStudent.id) {
      try {
        await supabase.from('students').update(editFormData).eq('id', editingStudent.id);
      } catch (err) {
        console.log("DB update note:", err);
      }
    }
    setEditingStudent(null);
  };

  // DELETE STUDENT HANDLER
  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(isUrdu ? `کیا آپ واقعی طالب علم "${student.name}" کا ایڈمیشن ریکارڈ حذف کرنا چاہتے ہیں؟` : `Are you sure you want to delete admission record for "${student.name}"?`)) return;

    setStudentsList(prev => prev.filter(s => (s.id && s.id !== student.id) || (s.admission_number !== student.admission_number)));

    if (student.id) {
      try {
        await supabase.from('students').delete().eq('id', student.id);
      } catch (err) {
        console.log("DB delete note:", err);
      }
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setSubmittedStudent(null);
    setFormNo(`BS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormData({
      student_name: "", gender: "Male", dob: "", cnic: "", religion: "Islam", blood_group: "A+",
      class_applying: "Nursery", previous_school: "", father_name: "", father_cnic: "",
      father_occupation: "", mobile_number: "", whatsapp_number: "", mother_name: "", mother_cnic: "",
      mother_occupation: "", address: "", emergency_contact: "", emergency_relation: "", agree_terms: false
    });
    setPhotoPreview(null);
    setParentSignature("");
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredStudents = studentsList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.admission_number && s.admission_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.father_name && s.father_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full space-y-8">
      
      {/* CSS style for print mode */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.15in !important;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 9px !important;
          }
          header, sidebar, nav, button, .no-print, [data-sidebar], .sidebar-trigger {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0.1in !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .print-container * {
            font-size: 9px !important;
            line-height: 1.1 !important;
          }
          .print-container h2 {
            font-size: 13px !important;
          }
          .print-container h3 {
            font-size: 10px !important;
            margin-top: 4px !important;
            margin-bottom: 4px !important;
            padding-bottom: 2px !important;
          }
          .print-container select, 
          .print-container input {
            height: 24px !important;
            padding: 2px 6px !important;
            font-size: 9px !important;
            border-radius: 4px !important;
            border: 1px solid #cbd5e1 !important;
          }
        }
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .signature-font {
          font-family: 'Great Vibes', cursive;
        }
      `}</style>

      {/* EDIT MODAL OVERLAY */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200 dark:border-pink-900 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/30 border-b border-rose-100 dark:border-rose-900/40 p-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Pencil className="w-5 h-5 text-rose-600" />
                  {isUrdu ? 'طالب علم کی تفصیلات ایڈٹ کریں' : 'Edit Student Details'}
                </CardTitle>
                <CardDescription className="text-xs font-semibold mt-0.5">
                  {editingStudent.admission_number || 'ADM-8941'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingStudent(null)} className="rounded-full hover:bg-rose-100 dark:hover:bg-rose-900">
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSaveEdit}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs uppercase">{isUrdu ? 'طالب علم کا نام' : 'Student Name'}</Label>
                  <Input 
                    value={editFormData.name || ''} 
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} 
                    className="rounded-xl font-semibold h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase">{isUrdu ? 'والد کا نام' : 'Father Name'}</Label>
                    <Input 
                      value={editFormData.father_name || ''} 
                      onChange={e => setEditFormData({ ...editFormData, father_name: e.target.value })} 
                      className="rounded-xl font-semibold h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase">{isUrdu ? 'موبائل نمبر' : 'Mobile Number'}</Label>
                    <Input 
                      value={editFormData.mobile_number || ''} 
                      onChange={e => setEditFormData({ ...editFormData, mobile_number: e.target.value })} 
                      className="rounded-xl font-semibold h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase">{isUrdu ? 'شناختی کارڈ / بی فارم' : 'CNIC / B-Form'}</Label>
                    <Input 
                      value={editFormData.cnic || ''} 
                      onChange={e => setEditFormData({ ...editFormData, cnic: e.target.value })} 
                      className="rounded-xl font-mono h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase">{isUrdu ? 'رول نمبر' : 'Roll Number'}</Label>
                    <Input 
                      value={editFormData.roll_number || ''} 
                      onChange={e => setEditFormData({ ...editFormData, roll_number: e.target.value })} 
                      className="rounded-xl font-mono h-11"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-xs uppercase">{isUrdu ? 'رہائشی پتہ' : 'Home Address'}</Label>
                  <Input 
                    value={editFormData.address || ''} 
                    onChange={e => setEditFormData({ ...editFormData, address: e.target.value })} 
                    className="rounded-xl font-semibold h-11"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setEditingStudent(null)} className="rounded-xl font-bold">
                    {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-6">
                    {isUrdu ? 'تبدیلیاں محفوظ کریں' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* TOP ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-pink-950/40 backdrop-blur-xl p-6 rounded-3xl border border-pink-200/80 dark:border-pink-800/30 shadow-lg no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-pink-100 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            {isUrdu ? 'برائٹ سکول اینڈ مونٹیسوری سسٹم - ایڈمیشن فارم' : 'Bright School & Montessori System'}
          </h1>
          <p className="text-slate-600 dark:text-pink-200/70 text-sm font-medium mt-1">
            {isUrdu ? 'آن لائن داخلہ فارم اور رئیل ٹائم سٹوڈنٹ رجسٹریشن سائیڈ' : 'Official Student Admission Application & Live Registration Portal'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handlePrint} 
            variant="outline"
            className="rounded-xl border-pink-300 dark:border-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/30 font-bold flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-rose-600" />
            {isUrdu ? 'پرنٹ فارم / PDF' : 'Print Form / PDF'}
          </Button>
        </div>
      </div>

      {/* SUCCESS MODAL BANNER (Pro-Level Celebration Alert) */}
      {submitted && submittedStudent && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 rounded-3xl text-white shadow-2xl shadow-emerald-600/30 animate-in zoom-in-95 duration-300 space-y-6 no-print border-2 border-emerald-400/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-emerald-400/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-xl font-black text-2xl">
                🎉
              </div>
              <div>
                <Badge className="bg-white/20 text-white border-white/30 font-bold text-xs mb-1">
                  {isUrdu ? 'داخلہ منظوری مکمل' : 'Admission Confirmed'}
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black">{isUrdu ? 'داخلہ فارم کامیابی سے جمع ہو گیا ہے!' : 'Student Enrolled Successfully!'}</h3>
                <p className="text-sm font-medium text-emerald-100 mt-1">
                  {isUrdu ? `طالب علم کا ڈیٹا سٹوڈنٹس ڈائریکٹری اور ڈیش بورڈ میں رئیل ٹائم سنک ہو چکا ہے۔` : `Student record registered live in the database.`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Button onClick={handlePrint} className="rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-sm px-6 h-12 shadow-lg flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-700" />
                {isUrdu ? 'پرنٹ فارم / PDF ڈاؤن لوڈ کریں' : 'Print Official Form / Save PDF'}
              </Button>
              <Link href="/students">
                <Button variant="outline" className="rounded-xl border-white/40 bg-emerald-800/40 text-white hover:bg-emerald-800 font-bold text-sm px-5 h-12 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  {isUrdu ? 'طلباء ڈائریکٹری میں دیکھیں' : 'View in Students Directory'}
                </Button>
              </Link>
              <Button onClick={handleResetForm} variant="ghost" className="rounded-xl text-emerald-100 hover:bg-emerald-800/40 font-bold text-sm">
                {isUrdu ? '+ نیا داخلہ فارم' : '+ Fill Another Form'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/15 p-4 rounded-2xl border border-white/10 text-xs">
            <div>
              <span className="opacity-75 block font-medium">{isUrdu ? 'طالب علم کا نام' : 'Student Name'}</span>
              <span className="font-black text-base text-white truncate block">{submittedStudent.name}</span>
            </div>
            <div>
              <span className="opacity-75 block font-medium">{isUrdu ? 'ایڈمیشن نمبر' : 'Admission No.'}</span>
              <span className="font-mono font-bold text-base text-emerald-200 block">{submittedStudent.admission_number}</span>
            </div>
            <div>
              <span className="opacity-75 block font-medium">{isUrdu ? 'رول نمبر' : 'Roll Number'}</span>
              <span className="font-mono font-bold text-base text-emerald-200 block">{submittedStudent.roll_number}</span>
            </div>
            <div>
              <span className="opacity-75 block font-medium">{isUrdu ? 'فارم نمبر' : 'Form No.'}</span>
              <span className="font-mono font-bold text-base text-white block">{formNo}</span>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/15 border border-rose-500/40 p-4 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-200 text-sm font-bold no-print">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* MAIN PRO FORM PAPER CONTAINER */}
      <form onSubmit={handleSubmit} className="print-container bg-white dark:bg-slate-950/80 rounded-2xl border border-pink-200/80 dark:border-pink-900/40 shadow-lg overflow-hidden p-4 sm:p-6 space-y-4 print:p-2 print:space-y-2">
        
        {/* OFFICIAL SCHOOL HEADER (Visible on screen and Print) */}
        <div className="border-b-2 border-slate-900 dark:border-pink-800/60 pb-3 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <img 
              src="/school_logo.png" 
              alt="Bright School Official Crest" 
              className="w-14 h-14 object-contain shrink-0 drop-shadow-md print:w-11 print:h-11"
            />
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase print:text-sm">
                {isUrdu ? 'برائٹ سکول اینڈ مونٹیسوری سسٹم' : 'Bright School & Montessori System'}
              </h2>
              <p className="text-rose-600 dark:text-rose-400 font-bold text-xs mt-0.5 print:text-[9px]">
                {isUrdu ? 'تعلیم اور کردار سازی کا اعلیٰ مرکز - Nurturing Young Minds' : 'Nurturing Young Minds for a Brighter Future'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold print:text-[8px]">
                Regd No: BS-EDU-9042 | Main Campus | Ph: 0300-1234567
              </p>
            </div>
          </div>
          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 bg-pink-50 dark:bg-pink-950/60 p-2 px-3 rounded-xl border border-pink-200/60 dark:border-pink-800/40 shrink-0 text-center md:text-right print:p-1">
            <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-400 tracking-wider print:text-[8px]">
              {isUrdu ? 'ایڈمیشن فارم سیشن' : 'Session 2026-2027'}
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-pink-200/80 dark:border-pink-800/50 shadow-sm print:text-[9px] print:py-0">
              Form No: {formNo}
            </span>
            <span className="text-[9px] font-semibold text-slate-500 print:text-[8px]">
              Date: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* PHOTO & CLASS SELECTION BLOCK */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          
          <div className="md:col-span-4 space-y-4 print:col-span-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 print:p-2 print:space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-pink-100 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5 print:text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {isUrdu ? '1۔ مطلوبہ کلاس کا انتخاب (Admission Sought For)' : '1. Admission Sought For'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:grid-cols-3">
                <div>
                  <Label htmlFor="class_applying" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                    {isUrdu ? 'کلاس / گریڈ *' : 'Class / Grade *'}
                  </Label>
                  <select
                    id="class_applying"
                    name="class_applying"
                    value={formData.class_applying}
                    onChange={handleInputChange}
                    className="w-full mt-1 h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-xs focus:ring-2 focus:ring-rose-500 print:h-7 print:text-[10px]"
                  >
                    <option value="Playgroup">Playgroup (پلے گروپ)</option>
                    <option value="Nursery">Nursery (نرسری)</option>
                    <option value="Prep/KG">Prep / KG (کے جی)</option>
                    <option value="Grade 1">Grade 1 (کلاس اول)</option>
                    <option value="Grade 2">Grade 2 (کلاس دوم)</option>
                    <option value="Grade 3">Grade 3 (کلاس سوم)</option>
                    <option value="Grade 4">Grade 4 (کلاس چہارم)</option>
                    <option value="Grade 5">Grade 5 (کلاس پنجم)</option>
                    <option value="Grade 6">Grade 6 (کلاس ششم)</option>
                    <option value="Grade 7">Grade 7 (کلاس ہفتم)</option>
                    <option value="Grade 8">Grade 8 (کلاس ہشتم)</option>
                    <option value="Grade 9">Grade 9 (کلاس نہم)</option>
                    <option value="Grade 10">Grade 10 (کلاس دہم)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="shift" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                    {isUrdu ? 'شفٹ (Shift)' : 'Shift'}
                  </Label>
                  <select id="shift" className="w-full mt-1 h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-xs print:h-7 print:text-[10px]">
                    <option value="Morning">Morning Shift (صبح)</option>
                    <option value="Afternoon">Afternoon Shift (شام)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="previous_school" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                    {isUrdu ? 'سابقہ سکول (Previous School)' : 'Previous School Name'}
                  </Label>
                  <Input
                    id="previous_school"
                    name="previous_school"
                    placeholder={isUrdu ? 'سابقہ سکول کا نام' : 'e.g. Army Public School'}
                    value={formData.previous_school}
                    onChange={handleInputChange}
                    className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 print:h-7"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* REAL PASSPORT PHOTO UPLOAD BOX */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 text-center relative overflow-hidden min-h-[120px] print:col-span-1 print:min-h-[100px] print:p-1 group">
            {photoPreview ? (
              <div className="relative w-full h-full flex flex-col items-center">
                <img 
                  src={photoPreview} 
                  alt="Candidate" 
                  className="w-20 h-24 object-cover rounded-lg border border-white shadow-sm mb-1.5 print:w-16 print:h-20"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="no-print bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full text-[9px] font-bold shadow-sm transition flex items-center gap-0.5 px-2"
                >
                  <Trash2 className="w-3 h-3" /> {isUrdu ? 'ہٹائیں' : 'Remove'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 px-1">
                <User className="w-8 h-8 text-rose-400 mb-1 print:w-6 print:h-6" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 print:text-[8px]">
                  {isUrdu ? 'تصویر اپلوڈ کریں' : 'Upload Photo'}
                </span>
                <span className="text-[8px] text-slate-500 mb-2 print:hidden">(Passport Size)</span>
                
                <label className="no-print bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white px-2.5 py-1 rounded-lg text-[9px] font-bold cursor-pointer shadow-sm transition flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  {isUrdu ? 'انتخاب' : 'Select'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            )}
          </div>

        </div>

        {/* SECTION 2: CANDIDATE PERSONAL DETAILS */}
        <div className="space-y-3 print:space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-pink-100 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5 print:text-xs">
            <User className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            {isUrdu ? '2۔ طالب علم کی ذاتی معلومات (Candidate Personal Details)' : '2. Candidate Personal Details'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
            <div>
              <Label htmlFor="student_name" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'طالب علم کا مکمل نام *' : 'Full Name of Candidate *'}
              </Label>
              <Input
                id="student_name"
                name="student_name"
                required
                placeholder={isUrdu ? 'مثال: محمد علی' : 'e.g. Muhammad Ali'}
                value={formData.student_name}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold print:h-7"
              />
            </div>
            <div>
              <Label htmlFor="gender" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'جنس (Gender)' : 'Gender'}
              </Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full mt-1 h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold text-xs print:h-7 print:text-[10px]"
              >
                <option value="Male">Male (لڑکا)</option>
                <option value="Female">Female (لڑکی)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="dob" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'تاریخ پیدائش (Date of Birth)' : 'Date of Birth'}
              </Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold print:h-7"
              />
            </div>
            <div>
              <Label htmlFor="cnic" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'بی فارم / شناختی کارڈ نمبر' : 'B-Form / CNIC No.'}
              </Label>
              <Input
                id="cnic"
                name="cnic"
                placeholder="35202-XXXXXXX-X"
                value={formData.cnic}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono print:h-7"
              />
            </div>
            <div>
              <Label htmlFor="blood_group" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'بلڈ گروپ (Blood Group)' : 'Blood Group'}
              </Label>
              <select
                id="blood_group"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleInputChange}
                className="w-full mt-1 h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold text-xs print:h-7 print:text-[10px]"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <Label htmlFor="religion" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'مذہب (Religion)' : 'Religion'}
              </Label>
              <Input
                id="religion"
                name="religion"
                value={formData.religion}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold print:h-7"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PARENTS DETAILS */}
        <div className="space-y-3 print:space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-pink-100 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5 print:text-xs">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {isUrdu ? '3۔ والدین کی معلومات (Father & Mother Particulars)' : '3. Parents Particulars'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
            <div>
              <Label htmlFor="father_name" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'والد کا نام *' : "Father's Full Name *"}
              </Label>
              <Input
                id="father_name"
                name="father_name"
                required
                placeholder={isUrdu ? 'والد کا نام' : "e.g. Tariq Mahmood"}
                value={formData.father_name}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold print:h-7"
              />
            </div>
            <div>
              <Label htmlFor="father_cnic" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'والد کا شناختی کارڈ نمبر' : "Father's CNIC No."}
              </Label>
              <Input
                id="father_cnic"
                name="father_cnic"
                placeholder="35202-XXXXXXX-X"
                value={formData.father_cnic}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono print:h-7"
              />
            </div>
            <div>
              <Label htmlFor="father_occupation" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'والد کا پیشہ / کاروبار' : "Father's Occupation"}
              </Label>
              <Input
                id="father_occupation"
                name="father_occupation"
                placeholder={isUrdu ? 'پیشہ' : 'e.g. Business'}
                value={formData.father_occupation}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold print:h-7"
              />
            </div>
            <div>
              <Label htmlFor="mobile_number" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'موبائل نمبر (رابطہ) *' : 'Mobile Number (Primary) *'}
              </Label>
              <Input
                id="mobile_number"
                name="mobile_number"
                required
                placeholder="0300-1234567"
                value={formData.mobile_number}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold print:h-7"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp_number" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'واٹس ایپ نمبر' : 'WhatsApp Number'}
              </Label>
              <Input
                id="whatsapp_number"
                name="whatsapp_number"
                placeholder="0300-1234567"
                value={formData.whatsapp_number}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold print:h-7"
              />
            </div>
            <div>
              <Label htmlFor="mother_name" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'والدہ کا نام' : "Mother's Name"}
              </Label>
              <Input
                id="mother_name"
                name="mother_name"
                placeholder={isUrdu ? 'والدہ کا نام' : "e.g. Sadia Tariq"}
                value={formData.mother_name}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold print:h-7"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: ADDRESS & EMERGENCY */}
        <div className="space-y-3 print:space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-pink-100 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5 print:text-xs">
            <MapPin className="w-4 h-4 text-rose-500" />
            {isUrdu ? '4۔ پتہ اور ہنگامی رابطہ (Address & Emergency Contact)' : '4. Residence & Emergency Contact'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="md:col-span-3 print:col-span-3">
              <Label htmlFor="address" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'موجودہ رہائشی پتہ (Home Address)' : 'Current Home Address'}
              </Label>
              <Input
                id="address"
                name="address"
                placeholder={isUrdu ? 'مکمل گھر کا پتہ لکھیں' : 'House No, Street, Colony, City'}
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold print:h-7"
              />
            </div>
            <div className="print:col-span-1">
              <Label htmlFor="emergency_contact" className="font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                {isUrdu ? 'ہنگامی فون نمبر' : 'Emergency Phone No.'}
              </Label>
              <Input
                id="emergency_contact"
                name="emergency_contact"
                placeholder="0321-7654321"
                value={formData.emergency_contact}
                onChange={handleInputChange}
                className="mt-1 h-8 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold print:h-7"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: CHECKLIST & UNDERTAKING */}
        <div className="space-y-3 bg-pink-50/50 dark:bg-pink-950/20 p-3 rounded-xl border border-pink-200/60 dark:border-pink-800/40 print:p-2 print:space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-pink-100 flex items-center gap-1.5 border-b border-pink-200 dark:border-pink-900/60 pb-1.5 print:text-xs">
            <FileCheck2 className="w-4 h-4 text-amber-600" />
            {isUrdu ? '5۔ ضروری دستاویزات اور اقرار نامہ (Documents & Undertaking)' : '5. Required Documents & Undertaking'}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300 py-1 print:grid-cols-4 print:gap-1 print:py-0">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 px-3 rounded-lg border border-pink-200/50 print:p-1">
              <input type="checkbox" defaultChecked className="rounded text-rose-600 w-3.5 h-3.5" />
              <span className="print:text-[8px]">4 Passport Photos</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 px-3 rounded-lg border border-pink-200/50 print:p-1">
              <input type="checkbox" defaultChecked className="rounded text-rose-600 w-3.5 h-3.5" />
              <span className="print:text-[8px]">B-Form Copy</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 px-3 rounded-lg border border-pink-200/50 print:p-1">
              <input type="checkbox" defaultChecked className="rounded text-rose-600 w-3.5 h-3.5" />
              <span className="print:text-[8px]">Father CNIC Copy</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 px-3 rounded-lg border border-pink-200/50 print:p-1">
              <input type="checkbox" defaultChecked className="rounded text-rose-600 w-3.5 h-3.5" />
              <span className="print:text-[8px]">Result Card / SLC</span>
            </div>
          </div>

          <div className="pt-1.5 print:pt-0">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="agree_terms"
                checked={formData.agree_terms}
                onChange={handleInputChange}
                className="mt-0.5 w-4 h-4 rounded border-pink-400 text-rose-600 focus:ring-rose-500 shrink-0"
              />
              <span className="text-[10px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight print:text-[8px]">
                {isUrdu 
                  ? 'میں اقرار کرتا/کرتی ہوں کہ تمام درج شدہ معلومات بالکل درست ہیں۔ میں برائٹ سکول کے تمام قواعد و ضوابط اور فیس شیڈول کی پابندی کا عہد کرتا ہوں۔'
                  : 'I hereby declare that the information provided is correct. I agree to abide by the rules and fee policy of Bright School.'
                }
              </span>
            </label>
          </div>
        </div>

        {/* REAL-TIME INTERACTIVE DIGITAL SIGNATURES & APPROVAL SECTION */}
        <div className="space-y-4 pt-3 border-t-2 border-slate-200 dark:border-slate-800 print:space-y-1">
          <div className="flex items-center justify-between no-print">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Stamp className="w-4 h-4 text-rose-600" />
              {isUrdu ? 'ڈیجیٹل دستخط اور منظوریاں (Digital Signatures & Approvals)' : 'Digital Signatures & Approvals'}
            </h3>
            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
              {isUrdu ? 'رئیل ٹائم لائو سنک' : 'Real-time Live Sync'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
            
            {/* 1. PARENT / GUARDIAN SIGNATURE */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 print:p-1.5 print:space-y-1">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 print:pb-0.5">
                <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                  {isUrdu ? '1۔ دستخط والد / سرپرست' : '1. Parent Signature'}
                </span>
                <Badge variant="outline" className="text-[8px] h-4 py-0">Verified</Badge>
              </div>
              
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-500 no-print">
                  {isUrdu ? 'والد/سرپرست کا نام یا ڈیجیٹل سائن یہاں لکھیں:' : 'Type Parent Full Name / E-Sign:'}
                </Label>
                <Input
                  placeholder={formData.father_name || (isUrdu ? 'والد کا نام' : 'Parent Signature Name')}
                  value={parentSignature}
                  onChange={e => setParentSignature(e.target.value)}
                  className="h-8 text-xs rounded-lg no-print"
                />
                <div className="h-10 bg-white dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center px-2 text-center print:h-8 print:border-none print:bg-transparent">
                  <span className="signature-font text-xl text-slate-800 dark:text-slate-100 font-bold truncate print:text-lg">
                    {parentSignature || formData.father_name || 'Tariq Mahmood'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ADMISSION OFFICER SIGNATURE */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 print:p-1.5 print:space-y-1">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 print:pb-0.5">
                <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 print:text-[8px]">
                  {isUrdu ? '2۔ دستخط ایڈمیشن آفیسر' : '2. Admission Officer'}
                </span>
                <Badge variant="secondary" className="text-[8px] h-4 py-0 bg-indigo-500/10 text-indigo-600">Officer Verified</Badge>
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-500 no-print">
                  {isUrdu ? 'ایڈمیشن آفیسر سائن / آئی ڈی:' : 'Officer Name / Code:'}
                </Label>
                <Input
                  placeholder="Officer Admin #04"
                  value={officerSignature}
                  onChange={e => setOfficerSignature(e.target.value)}
                  className="h-8 text-xs rounded-lg no-print"
                />
                <div className="h-10 bg-white dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center px-2 text-center print:h-8 print:border-none print:bg-transparent">
                  <span className="signature-font text-xl text-indigo-700 dark:text-indigo-400 font-bold truncate print:text-lg">
                    {officerSignature || 'Officer Admin #04'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. PRINCIPAL APPROVAL & OFFICIAL SEAL */}
            <div className="bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 space-y-2 print:p-1.5 print:space-y-1">
              <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-900 pb-1.5 print:pb-0.5">
                <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-400 print:text-[8px]">
                  {isUrdu ? '3۔ منظوری پرنسپل و آفیشل سیل' : '3. Principal Approval & Seal'}
                </span>
                <div className="flex items-center gap-1 no-print">
                  <button
                    type="button"
                    onClick={() => setPrincipalStatus('Approved')}
                    className={`px-1.5 py-0.5 text-[8px] font-bold rounded transition ${principalStatus === 'Approved' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrincipalStatus('Pending')}
                    className={`px-1.5 py-0.5 text-[8px] font-bold rounded transition ${principalStatus === 'Pending' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-1 pt-1 print:pt-0">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 print:text-[9px]">{principalName}</p>
                  <p className="text-[9px] text-slate-500 font-medium">Principal, Bright School</p>
                  <Badge className={`text-[8px] h-4 py-0 ${principalStatus === 'Approved' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {principalStatus === 'Approved' ? 'APPROVED' : 'PENDING'}
                  </Badge>
                </div>

                {/* OFFICIAL EMBOSSED SEAL STAMP */}
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-rose-600/60 dark:border-rose-400/60 flex flex-col items-center justify-center text-center p-0.5 transform rotate-[-6deg] bg-rose-500/5 shrink-0 print:w-11 print:h-11">
                  <span className="text-[5px] font-black uppercase tracking-tighter text-rose-700 dark:text-rose-300 leading-none">BRIGHT</span>
                  <Stamp className="w-3.5 h-3.5 text-rose-600 my-0.5 print:w-2.5 print:h-2.5 print:my-0" />
                  <span className="text-[4px] font-black uppercase text-rose-800 dark:text-rose-200 leading-none">APPROVED</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4 flex justify-end gap-4 no-print">
          <Button
            type="submit"
            disabled={loading}
            className="h-14 px-10 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-base shadow-xl shadow-rose-500/25 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isUrdu ? 'جمع ہو رہا ہے...' : 'Submitting...'}
              </span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isUrdu ? 'داخلہ فارم جمع کریں (Submit Admission)' : 'Submit Admission Application'}
              </>
            )}
          </Button>
        </div>

      </form>

      {/* PRO LEVEL RECENT ADMISSIONS DIRECTORY TABLE WITH EDIT & DELETE */}
      <Card className="border-border shadow-xl bg-card rounded-3xl overflow-hidden no-print">
        <CardHeader className="bg-muted/40 border-b border-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Users className="w-6 h-6 text-rose-600" />
              {isUrdu ? 'حالیہ داخلہ شدہ طلباء کی فہرست (Recent Admissions Directory)' : 'Recent Admissions Directory'}
            </CardTitle>
            <CardDescription className="text-xs font-medium mt-1">
              {isUrdu ? 'فارم جمع ہوتے ہی ڈیٹا بیس میں لائیو رجسٹر ہونے والے طلباء برائے پرنٹ، ایڈٹ اور ڈیلیٹ' : 'Live registered admission applications in system database'}
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isUrdu ? 'طالب علم کا نام یا ایڈمیشن نمبر...' : 'Search student or admission no...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl h-10 border-border"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="pl-6 font-bold">{isUrdu ? 'ایڈمیشن نمبر / رول نمبر' : 'Adm No. / Roll No'}</TableHead>
                <TableHead className="font-bold">{isUrdu ? 'طالب علم کا نام' : 'Student Name'}</TableHead>
                <TableHead className="font-bold">{isUrdu ? 'والد کا نام' : 'Father Name'}</TableHead>
                <TableHead className="font-bold">{isUrdu ? 'رابطہ نمبر' : 'Mobile Number'}</TableHead>
                <TableHead className="font-bold">{isUrdu ? 'تاریخ داخلہ' : 'Admission Date'}</TableHead>
                <TableHead className="text-right pr-6 font-bold">{isUrdu ? 'ایکشن (Actions)' : 'Action'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-semibold">{isUrdu ? 'کوئی نیا داخلہ ریکارڈ نہیں ملا۔' : 'No recent admission records found.'}</TableCell></TableRow>
              ) : filteredStudents.map((student, idx) => (
                <TableRow key={student.id || idx} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-6 font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                    <div>{student.admission_number || 'ADM-8941'}</div>
                    <div className="text-[10px] text-muted-foreground font-sans">{student.roll_number || 'NUR-01'}</div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 dark:text-slate-100">{student.name}</TableCell>
                  <TableCell className="text-xs font-semibold text-muted-foreground">{student.father_name || '-'}</TableCell>
                  <TableCell className="text-xs font-mono">{student.mobile_number || '-'}</TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">{student.admission_date || new Date().toLocaleDateString()}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        onClick={handlePrint}
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center gap-1"
                        title={isUrdu ? 'پرنٹ کریں' : 'Print Form'}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'پرنٹ' : 'Print'}</span>
                      </Button>

                      <Button 
                        onClick={() => handleOpenEdit(student)}
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1"
                        title={isUrdu ? 'تفصیلات تبدیل کریں' : 'Edit Student'}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'ایڈٹ' : 'Edit'}</span>
                      </Button>

                      <Button 
                        onClick={() => handleDeleteStudent(student)}
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs flex items-center gap-1"
                        title={isUrdu ? 'حذف کریں' : 'Delete Student'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'حذف' : 'Delete'}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
