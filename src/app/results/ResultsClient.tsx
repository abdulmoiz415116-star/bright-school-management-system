"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Award, Printer, Search, User, CheckCircle2, Stamp, Pencil, Trash2, X, Plus, MessageCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Student = {
  id: number;
  name: string;
  admission_number?: string;
  roll_number?: string;
  father_name?: string;
  class_name?: string;
  section?: string;
  term?: string;
  session?: string;
  subjects?: { id: number; name: string; total: number; obtained: number }[];
};

export function ResultsClient({ students: initialStudents = [] }: { students?: Student[] }) {
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const supabase = createClient();

  const defaultList: Student[] = [
    { id: 101, name: "Muhammad Ali Raza", admission_number: "ADM-1001", roll_number: "NUR-01", father_name: "Tariq Mahmood" },
    { id: 102, name: "Syeda Fatima Zahra", admission_number: "ADM-1002", roll_number: "KG-05", father_name: "Syed Hassan Shah" },
    { id: 103, name: "Zainab Binte Bilal", admission_number: "ADM-1003", roll_number: "G1-12", father_name: "Bilal Ahmad" },
    { id: 104, name: "Hamza Tariq", admission_number: "ADM-1004", roll_number: "G2-08", father_name: "Tariq Mahmood" },
    { id: 105, name: "Ayesha Omer", admission_number: "ADM-1005", roll_number: "G3-15", father_name: "Omer Farooq" },
    { id: 106, name: "Ibrahim Khalid", admission_number: "ADM-1006", roll_number: "G4-02", father_name: "Khalid Pervez" },
    { id: 107, name: "Maryam Sajid", admission_number: "ADM-1007", roll_number: "G5-19", father_name: "Sajid Ali" },
    { id: 108, name: "Bilal Usman", admission_number: "ADM-1008", roll_number: "G6-11", father_name: "Muhammad Usman" },
    { id: 109, name: "Anaya Usman", admission_number: "ADM-1009", roll_number: "G7-04", father_name: "Usman Ghani" },
    { id: 110, name: "Abdullah Haroon", admission_number: "ADM-1010", roll_number: "G8-20", father_name: "Haroon Rasheed" }
  ];

  const classesList = ['Playgroup', 'Nursery', 'Prep/KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
  const sectionsList = ['Section A', 'Section B'];
  const termsList = ['First Term', 'Mid Term', 'Final Term'];
  const sessionsList = ['2026-2027', '2027-2028'];

  const mergedInitial = (initialStudents.length > 0 ? initialStudents : defaultList).map((s, index) => {
    const assignedClass = s.class_name || classesList[index % classesList.length];
    const assignedSection = s.section || sectionsList[index % sectionsList.length];
    const assignedTerm = s.term || termsList[index % termsList.length];
    const assignedSession = s.session || sessionsList[index % sessionsList.length];
    
    return {
      ...s,
      class_name: assignedClass,
      section: assignedSection,
      term: assignedTerm,
      session: assignedSession,
      subjects: s.subjects || [
        { id: 1, name: "Mathematics & Logic", total: 100, obtained: Math.floor(80 + Math.random() * 18) },
        { id: 2, name: "English Literature", total: 100, obtained: Math.floor(80 + Math.random() * 18) },
        { id: 3, name: "General Science", total: 100, obtained: Math.floor(80 + Math.random() * 18) },
        { id: 4, name: "Urdu Language", total: 100, obtained: Math.floor(80 + Math.random() * 18) },
        { id: 5, name: "Islamiat & Morals", total: 100, obtained: Math.floor(80 + Math.random() * 18) }
      ]
    };
  });

  const [studentsList, setStudentsList] = useState<Student[]>(mergedInitial);
  const [selectedSession, setSelectedSession] = useState("2026-2027");
  const [selectedTerm, setSelectedTerm] = useState("First Term");
  const [selectedClass, setSelectedClass] = useState("Grade 5");
  const [selectedSection, setSelectedSection] = useState("Section A");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newFatherName, setNewFatherName] = useState("");
  const [newClassRoll, setNewClassRoll] = useState("");

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentForm, setEditStudentForm] = useState<Partial<Student>>({});

  // REALTIME SYNCHRONIZATION
  useEffect(() => {
    const channel = supabase
      .channel('results_light_pastel_v7')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const fresh: Student = {
            id: payload.new.id,
            name: payload.new.name,
            admission_number: payload.new.admission_number || `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
            roll_number: payload.new.roll_number || 'NUR-01',
            father_name: payload.new.father_name || 'Parent',
            class_name: selectedClass,
            section: selectedSection,
            term: selectedTerm,
            session: selectedSession,
            subjects: [
              { id: 1, name: "Mathematics & Logic", total: 100, obtained: 90 },
              { id: 2, name: "English Literature", total: 100, obtained: 88 },
              { id: 3, name: "General Science", total: 100, obtained: 92 },
              { id: 4, name: "Urdu Language", total: 100, obtained: 86 },
              { id: 5, name: "Islamiat & Morals", total: 100, obtained: 95 }
            ]
          };
          setStudentsList(prev => [fresh, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setStudentsList(prev => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, selectedClass, selectedSection, selectedTerm, selectedSession]);

  const activeStudent = selectedStudentId !== null ? (studentsList.find(s => s.id === selectedStudentId) || null) : null;

  const currentSubjects = activeStudent ? (activeStudent.subjects || []) : [];
  const totalMax = currentSubjects.reduce((a, b) => a + b.total, 0);
  const totalObtained = currentSubjects.reduce((a, b) => a + b.obtained, 0);
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "0.0";

  let overallGrade = "A+";
  const p = parseFloat(percentage);
  if (p >= 90) overallGrade = "A+";
  else if (p >= 80) overallGrade = "A";
  else if (p >= 70) overallGrade = "B";
  else if (p >= 60) overallGrade = "C";
  else overallGrade = "D";

  const handleMarkChange = (subId: number, newObtained: number) => {
    if (!activeStudent) return;
    const updatedVal = Math.min(100, Math.max(0, newObtained));
    setStudentsList(prev => prev.map(st => {
      if (st.id === activeStudent.id) {
        return {
          ...st,
          subjects: (st.subjects || []).map(sb => sb.id === subId ? { ...sb, obtained: updatedVal } : sb)
        };
      }
      return st;
    }));
  };

  const handleAddStudentResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newId = Date.now();
    const newStudentObj: Student = {
      id: newId,
      name: newStudentName.trim(),
      father_name: newFatherName.trim() || 'Tariq Mahmood',
      roll_number: newClassRoll.trim() || 'REG-01',
      admission_number: `ADM-${Math.floor(10000 + Math.random() * 90000)}`,
      class_name: selectedClass,
      section: selectedSection,
      term: selectedTerm,
      session: selectedSession,
      subjects: [
        { id: 1, name: "Mathematics & Logic", total: 100, obtained: 95 },
        { id: 2, name: "English Literature", total: 100, obtained: 90 },
        { id: 3, name: "General Science", total: 100, obtained: 93 },
        { id: 4, name: "Urdu Language", total: 100, obtained: 88 },
        { id: 5, name: "Islamiat & Morals", total: 100, obtained: 97 }
      ]
    };

    setStudentsList(prev => [newStudentObj, ...prev]);
    setSelectedStudentId(newId);
    setNewStudentName("");
    setNewFatherName("");
    setNewClassRoll("");
    setShowAddModal(false);
  };

  const handleOpenEditStudent = (s: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStudent(s);
    setEditStudentForm({ name: s.name, father_name: s.father_name || '', roll_number: s.roll_number || '' });
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setStudentsList(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...editStudentForm } : s));
    setEditingStudent(null);
  };

  const handleDeleteResultRecord = (sId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(isUrdu ? "کیا آپ واقعی اس طالب علم کا رزلٹ ریکارڈ حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this result record?")) return;
    setStudentsList(prev => prev.filter(s => s.id !== sId));
    if (selectedStudentId === sId) {
      setSelectedStudentId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsAppResult = () => {
    if (!activeStudent) return;
    const subjectSummary = currentSubjects.map(s => `• ${s.name}: ${s.obtained}/${s.total}`).join('%0A');
    const msg = `🎓 *BRIGHT SCHOOL & MONTESSORI SYSTEM* 🎓%0A📜 *Official Academic Progress Report Card*%0A--------------------------------------%0A👤 *Student Name:* ${activeStudent.name}%0A👨‍👦 *Father Name:* ${activeStudent.father_name || 'Parent'}%0A🆔 *Adm No:* ${activeStudent.admission_number || 'ADM-1001'} | *Roll:* ${activeStudent.roll_number || 'NUR-01'}%0A%0A📚 *Subject-wise Evaluation:*%0A${subjectSummary}%0A%0A🏆 *Grand Total:* ${totalObtained} / ${totalMax}%0A📊 *Percentage:* ${percentage}%%0A🌟 *Overall Grade:* ${overallGrade}%0A🏅 *Standing:* 1st Position (Gold Medallist)%0A%0ACongratulations to the respected parents! 🎉%0A_Bright School Administration_`;
    
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const filteredStudents = studentsList.filter(s => {
    const matchSession = s.session === selectedSession;
    const matchTerm = s.term === selectedTerm;
    const matchClass = s.class_name === selectedClass;
    const matchSection = s.section === selectedSection;

    const query = searchQuery.trim().toLowerCase();
    const matchQuery = query === "" ||
      s.name.toLowerCase().includes(query) ||
      (s.admission_number && s.admission_number.toLowerCase().includes(query)) ||
      (s.father_name && s.father_name.toLowerCase().includes(query));

    return matchSession && matchTerm && matchClass && matchSection && matchQuery;
  }).sort((a, b) => {
    const admA = a.admission_number || "";
    const admB = b.admission_number || "";
    return admA.localeCompare(admB, undefined, { numeric: true, sensitivity: 'base' });
  });

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-gradient-to-br from-pink-50/50 via-sky-50/30 to-rose-50/30 animate-in fade-in duration-300">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .printable-result-card, .printable-result-card * { visibility: visible !important; }
          .printable-result-card { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; background: white !important; color: black !important; }
          .no-print-btn { display: none !important; }
        }
      `}</style>

      <TopNav />

      {/* ADD NEW STUDENT RESULT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print-btn">
          <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-200">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b p-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                <Plus className="w-4 h-4 text-rose-600" />
                {isUrdu ? 'نیا رزلٹ سٹوڈنٹ شامل کریں' : 'Add New Student Result'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="rounded-full h-8 w-8"><X className="w-4 h-4"/></Button>
            </CardHeader>
            <form onSubmit={handleAddStudentResult}>
              <CardContent className="p-5 space-y-3">
                <div><Label className="font-bold text-xs uppercase">{isUrdu ? 'طالب علم کا نام *' : 'Student Name *'}</Label><Input required value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="e.g. Hamza Ahmad" className="rounded-xl font-bold mt-1 h-9 text-xs" /></div>
                <div><Label className="font-bold text-xs uppercase">{isUrdu ? 'والد کا نام' : 'Father Name'}</Label><Input value={newFatherName} onChange={e => setNewFatherName(e.target.value)} placeholder="e.g. Tariq Mahmood" className="rounded-xl font-bold mt-1 h-9 text-xs" /></div>
                <div><Label className="font-bold text-xs uppercase">{isUrdu ? 'رول نمبر (یا کلاس رول)' : 'Roll Number'}</Label><Input value={newClassRoll} onChange={e => setNewClassRoll(e.target.value)} placeholder="e.g. 12" className="rounded-xl font-mono mt-1 h-9 text-xs" /></div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl font-bold h-9 text-xs">{isUrdu ? 'منسوخ' : 'Cancel'}</Button>
                  <Button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 text-xs">{isUrdu ? 'رزلٹ کارڈ بنائیں' : 'Create Result Card'}</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* EDIT STUDENT BIO MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print-btn">
          <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-200">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b p-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                <Pencil className="w-4 h-4 text-rose-600" />
                {isUrdu ? 'رزلٹ سٹوڈنٹ ایڈٹ کریں' : 'Edit Student Particulars'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingStudent(null)} className="rounded-full h-8 w-8"><X className="w-4 h-4"/></Button>
            </CardHeader>
            <form onSubmit={handleSaveEditStudent}>
              <CardContent className="p-5 space-y-3">
                <div><Label className="font-bold text-xs uppercase">{isUrdu ? 'طالب علم کا نام' : 'Student Name'}</Label><Input value={editStudentForm.name || ''} onChange={e => setEditStudentForm({ ...editStudentForm, name: e.target.value })} className="rounded-xl font-bold mt-1 h-9 text-xs" /></div>
                <div><Label className="font-bold text-xs uppercase">{isUrdu ? 'والد کا نام' : 'Father Name'}</Label><Input value={editStudentForm.father_name || ''} onChange={e => setEditStudentForm({ ...editStudentForm, father_name: e.target.value })} className="rounded-xl font-bold mt-1 h-9 text-xs" /></div>
                <div><Label className="font-bold text-xs uppercase">{isUrdu ? 'رول نمبر' : 'Roll Number'}</Label><Input value={editStudentForm.roll_number || ''} onChange={e => setEditStudentForm({ ...editStudentForm, roll_number: e.target.value })} className="rounded-xl font-mono mt-1 h-9 text-xs" /></div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingStudent(null)} className="rounded-xl font-bold h-9 text-xs">{isUrdu ? 'منسوخ' : 'Cancel'}</Button>
                  <Button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 text-xs">{isUrdu ? 'محفوظ کریں' : 'Save Changes'}</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-4">
        
        {/* LIGHT SOFT TOP HEADER BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-xl px-5 py-3.5 rounded-2xl border border-pink-200 shadow-sm no-print-btn">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-pink-700 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-800">
                  {isUrdu ? 'رزلٹ کارڈ پورٹل' : 'Bright School Result Cards'}
                </h1>
                <Badge className="bg-pink-100 text-pink-700 font-bold text-[9px] px-2 py-0 border border-pink-200">SOFT LIGHT THEME</Badge>
              </div>
              <p className="text-slate-500 text-xs font-semibold hidden sm:block">
                {isUrdu ? 'سبجیکٹ وائز لائیو نمبر، واٹس ایپ شیئر، پرنٹ و پی ڈی ایف' : 'Subject-wise live marks, WhatsApp sharing & PDF print'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {searchPerformed && (
              <Button onClick={() => setShowAddModal(true)} size="sm" variant="outline" className="rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-xs h-9 px-3.5 flex items-center gap-1.5 shadow-sm">
                <Plus className="w-3.5 h-3.5" />
                <span>{isUrdu ? '+ نیا سٹوڈنٹ' : '+ Add Result'}</span>
              </Button>
            )}
            {activeStudent && (
              <>
                <Button onClick={handleSendWhatsAppResult} size="sm" variant="outline" className="rounded-xl border-emerald-400 text-emerald-700 hover:bg-emerald-50 font-bold text-xs h-9 px-3.5 flex items-center gap-1.5 shadow-sm">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isUrdu ? 'واٹس ایپ بھیجیں' : 'WhatsApp Result'}</span>
                </Button>
                <Button onClick={handlePrint} size="sm" variant="outline" className="rounded-xl border-pink-300 text-pink-700 hover:bg-pink-50 font-bold text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm">
                  <Printer className="w-3.5 h-3.5 text-pink-600" />
                  <span>{isUrdu ? 'پرنٹ / PDF' : 'Print / PDF'}</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* PRO SEARCH & FILTER BAR */}
        <div className="bg-white rounded-2xl border border-pink-200 p-4 sm:p-5 shadow-sm space-y-4 no-print-btn">
          <div className="flex items-center justify-between border-b pb-2 border-slate-100">
            <h3 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-pink-600" />
              {isUrdu ? 'امتحانی رزلٹ تلاش کریں (Result Search Filters)' : 'Result Search Filters'}
            </h3>
            <Badge className="bg-pink-100 text-pink-700 font-bold text-[9px] border border-pink-200">
              {isUrdu ? 'پرو رزلٹ فلٹر' : 'Pro Results Explorer'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">{isUrdu ? 'تعلیمی سیشن' : 'Academic Session'}</Label>
              <select 
                value={selectedSession} 
                onChange={e => setSelectedSession(e.target.value)}
                className="w-full h-9 rounded-xl border border-pink-200 bg-slate-50/50 px-2.5 py-1 text-xs font-bold text-slate-800"
              >
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">{isUrdu ? 'امتحانی ٹرم (Term)' : 'Exam Term'}</Label>
              <select 
                value={selectedTerm} 
                onChange={e => setSelectedTerm(e.target.value)}
                className="w-full h-9 rounded-xl border border-pink-200 bg-slate-50/50 px-2.5 py-1 text-xs font-bold text-slate-800"
              >
                <option value="First Term">First Term (پہلا ٹرم)</option>
                <option value="Mid Term">Mid Term (مڈ ٹرم)</option>
                <option value="Final Term">Final Term (سالانہ امتحان)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">{isUrdu ? 'کلاس / گریڈ (Class)' : 'Class / Grade'}</Label>
              <select 
                value={selectedClass} 
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full h-9 rounded-xl border border-pink-200 bg-slate-50/50 px-2.5 py-1 text-xs font-bold text-slate-800"
              >
                {classesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-slate-500">{isUrdu ? 'سیکشن (Section)' : 'Section'}</Label>
              <select 
                value={selectedSection} 
                onChange={e => setSelectedSection(e.target.value)}
                className="w-full h-9 rounded-xl border border-pink-200 bg-slate-50/50 px-2.5 py-1 text-xs font-bold text-slate-800"
              >
                {sectionsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <Button 
                onClick={() => {
                  setSearchPerformed(true);
                  const matches = studentsList.filter(s => s.class_name === selectedClass && s.section === selectedSection && s.term === selectedTerm && s.session === selectedSession);
                  if (matches.length > 0) {
                    setSelectedStudentId(matches[0].id);
                  } else {
                    setSelectedStudentId(null);
                  }
                }} 
                className="w-full h-9 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'تلاش کریں (Search)' : 'Search Result'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* RESULTS AREA */}
        {!searchPerformed ? (
          <Card className="border-pink-200 shadow-sm bg-white rounded-2xl p-8 text-center no-print-btn max-w-md mx-auto mt-6">
            <CardContent className="space-y-4 py-4 flex flex-col items-center">
              <Award className="w-12 h-12 text-pink-500 opacity-30 animate-bounce" />
              <h2 className="text-base font-black text-slate-800">
                {isUrdu ? 'کلاس امتحانی رزلٹ تلاش کریں' : 'Search Student Results'}
              </h2>
              <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                {isUrdu 
                  ? 'رزلٹ کارڈز دیکھنے اور پرنٹ کرنے کے لیے اوپر کلاس، سیکشن اور امتحانی ٹرم منتخب کر کے "تلاش کریں" پر کلک کریں۔' 
                  : 'Select Session, Class, Section, and Term from the filters above and click Search to display student list and printable report cards.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT SELECTOR (4 COLS) */}
            <div className="lg:col-span-4 space-y-4 no-print-btn animate-in slide-in-from-left duration-300">
              <Card className="border-pink-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="bg-pink-50/70 border-b border-pink-100 px-4 py-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-pink-600" />
                    {isUrdu ? 'طلبا کی لسٹ' : 'Student List'}
                  </CardTitle>
                  <Badge className="bg-pink-100 text-pink-700 font-bold text-[10px] px-2 py-0 border border-pink-200">{filteredStudents.length}</Badge>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <Input 
                      placeholder={isUrdu ? 'نام سرچ کریں...' : 'Search student...'}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-8 rounded-xl border-pink-200 h-8 text-xs"
                    />
                  </div>

                  <div className="max-h-[450px] overflow-y-auto space-y-1.5 pr-1">
                    {filteredStudents.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-semibold">
                        {isUrdu ? 'اس کلاس میں کوئی رزلٹ نہیں ملا۔' : 'No results found for this class.'}
                      </div>
                    ) : filteredStudents.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudentId(s.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedStudentId === s.id ? 'bg-pink-100/90 text-pink-950 font-bold border-pink-300 shadow-sm' : 'bg-slate-50/80 hover:bg-pink-50/50 border-slate-200 text-slate-800'}`}
                      >
                        <div className="overflow-hidden pr-2">
                          <div className="text-xs font-black truncate">{s.name}</div>
                          <div className={`text-[10px] font-medium truncate ${selectedStudentId === s.id ? 'text-pink-800' : 'text-slate-500'}`}>
                            Roll: {s.roll_number || 'NUR-01'} | Adm: {s.admission_number || 'ADM-1001'}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditStudent(s, e)}
                            className={`p-1 rounded-md transition ${selectedStudentId === s.id ? 'hover:bg-pink-200 text-pink-800' : 'hover:bg-indigo-100 text-indigo-600'}`}
                            title="Edit Info"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteResultRecord(s.id, e)}
                            className={`p-1 rounded-md transition ${selectedStudentId === s.id ? 'hover:bg-pink-200 text-pink-800' : 'hover:bg-red-100 text-red-600'}`}
                            title="Delete Record"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT OFFICIAL REPORT CARD SHEET */}
            <div className="lg:col-span-8 printable-result-card">
              {selectedStudentId === null || !activeStudent ? (
                <Card className="border-pink-200 shadow-sm bg-white rounded-2xl p-12 text-center no-print-btn h-full flex flex-col items-center justify-center min-h-[350px]">
                  <CardContent className="space-y-3 py-6 flex flex-col items-center justify-center">
                    <User className="w-12 h-12 text-pink-400 opacity-30" />
                    <h3 className="text-sm font-bold text-slate-800">
                      {isUrdu ? 'طالب علم منتخب کریں' : 'Select Student to View'}
                    </h3>
                    <p className="text-slate-500 text-[11px] font-semibold">
                      {isUrdu 
                        ? 'رزلٹ کارڈ، نمبروں کی تفصیل اور پرنٹ آپشنز دیکھنے کے لیے بائیں لسٹ سے کسی طالب علم پر کلک کریں۔' 
                        : 'Select any student from the left directory to display their official report card sheet.'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-pink-200 text-slate-800 relative overflow-hidden space-y-5">
                  
                  {/* Watermark Crest Simulation */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none">
                    <img src="/school_logo.png" alt="Watermark" className="w-[350px] h-[350px] object-contain" />
                  </div>

                  {/* CARD TOP OFFICIAL HEADER */}
                  <div className="border-b-2 border-pink-200 pb-4 flex items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-pink-50 border border-pink-200 p-1 shrink-0 shadow-sm flex items-center justify-center">
                        <img src="/school_logo.png" alt="Bright School Crest" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <Badge className="bg-pink-100 text-pink-800 font-bold text-[9px] uppercase px-2 py-0.5 mb-0.5 border border-pink-200">
                          PROGRESS CERTIFICATE
                        </Badge>
                        <h2 className="text-lg sm:text-xl font-black text-rose-700 tracking-tight uppercase leading-tight">
                          BRIGHT SCHOOL & MONTESSORI SYSTEM
                        </h2>
                        <p className="text-[11px] font-bold text-slate-500">
                          Session {selectedSession} | {selectedTerm} Official Report
                        </p>
                      </div>
                    </div>
                    <div className="bg-pink-100/90 text-pink-900 px-4 py-2.5 rounded-xl font-black text-center shrink-0 shadow-sm border border-pink-300">
                      <span className="text-[8px] uppercase block opacity-80 font-bold">GRADE</span>
                      <span className="text-xl leading-none">{overallGrade}</span>
                    </div>
                  </div>

                  {/* CANDIDATE BIO BLOCK */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs relative z-10">
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[8px]">{isUrdu ? "طالب علم کا نام" : "Student Name"}</span>
                      <span className="font-black text-slate-900 truncate block text-sm">{activeStudent.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[8px]">{isUrdu ? "والد کا نام" : "Father Name"}</span>
                      <span className="font-bold text-slate-700 truncate block text-xs">{activeStudent.father_name || 'Tariq Mahmood'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[8px]">{isUrdu ? "رجسٹریشن نمبر" : "Admission No"}</span>
                      <span className="font-mono font-bold text-pink-700 text-xs">{activeStudent.admission_number || 'ADM-1001'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[8px]">{isUrdu ? "کلاس اور رول نمبر" : "Class / Roll"}</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">{selectedClass} / {activeStudent.roll_number || 'NUR-01'} ({selectedSection})</span>
                    </div>
                  </div>

                  {/* REALTIME SUBJECT-WISE MARKS MATRIX TABLE */}
                  <div className="rounded-xl border border-pink-200 overflow-hidden relative z-10">
                    <Table>
                      <TableHeader className="bg-pink-100/90 text-pink-950 border-b border-pink-200">
                        <TableRow className="h-9 hover:bg-transparent">
                          <TableHead className="font-black text-pink-950 text-xs pl-4 uppercase py-2">Subject Title</TableHead>
                          <TableHead className="font-black text-pink-950 text-xs text-center uppercase py-2">Total</TableHead>
                          <TableHead className="font-black text-pink-950 text-xs text-center uppercase py-2">Obtained (Live Edit)</TableHead>
                          <TableHead className="font-black text-pink-950 text-xs text-right pr-4 uppercase py-2">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs font-semibold">
                        {currentSubjects.map((sub) => (
                          <TableRow key={sub.id} className="h-10 hover:bg-pink-50/30 border-b border-slate-100">
                            <TableCell className="pl-4 font-bold text-slate-800 py-2">{sub.name}</TableCell>
                            <TableCell className="text-center font-mono font-bold text-slate-500 py-2">{sub.total}</TableCell>
                            <TableCell className="text-center py-2">
                              <div className="inline-flex items-center justify-center">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={sub.obtained}
                                  onChange={e => handleMarkChange(sub.id, parseInt(e.target.value) || 0)}
                                  className="w-14 h-7 text-center font-mono font-black text-emerald-800 bg-emerald-50/90 border border-emerald-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 no-print-btn"
                                />
                                <span className="font-mono font-black text-emerald-800 text-xs hidden print:inline">{sub.obtained}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-4 py-2">
                              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] px-2 py-0.5">
                                {sub.obtained >= 90 ? 'A+ Exceptional' : sub.obtained >= 80 ? 'A Outstanding' : 'B Good'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* OVERALL PERFORMANCE GRAND BANNER */}
                  <div className="bg-gradient-to-r from-pink-100/90 via-rose-100/90 to-sky-100/90 text-slate-900 px-5 py-3 rounded-xl flex items-center justify-between gap-4 shadow-sm relative z-10 border border-pink-200">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🏆</span>
                      <div>
                        <span className="text-[9px] text-rose-800 font-bold uppercase block leading-none">{isUrdu ? "پوزیشن" : "Class Standing"}</span>
                        <span className="font-black text-base text-slate-900 leading-tight block">{isUrdu ? "پہلی پوزیشن (گولڈ میڈل)" : "1st Position (Gold Medallist)"}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-600 block">{isUrdu ? "کل نمبر" : "Total"}: {totalObtained} / {totalMax}</span>
                      <span className="text-base font-black text-emerald-800 font-mono">{isUrdu ? "فیصد" : "Percentage"}: {percentage}%</span>
                    </div>
                  </div>

                  {/* SIGNATURES & EMBOSSED SEAL STAMP */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-center text-xs relative z-10">
                    <div>
                      <div className="h-8 border-b border-slate-300 font-serif text-sm font-bold italic flex items-end justify-center pb-0.5 text-slate-800">
                        Mrs. Ayesha Saddiqa
                      </div>
                      <span className="text-slate-500 font-bold block mt-1 uppercase text-[9px]">{isUrdu ? "کلاس ٹیچر کے دستخط" : "Class Teacher Sign"}</span>
                    </div>
                    
                    {/* OFFICIAL EMBOSSED SEAL STAMP */}
                    <div className="flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-rose-400 flex flex-col items-center justify-center text-center p-0.5 transform rotate-[-6deg] bg-rose-50/80 shrink-0">
                        <Stamp className="w-4 h-4 text-rose-500" />
                        <span className="text-[6px] font-black uppercase text-rose-700 leading-none mt-0.5">SEAL APPROVED</span>
                      </div>
                    </div>

                    <div>
                      <div className="h-8 border-b border-rose-400 font-serif text-sm font-bold italic text-rose-700 flex items-end justify-center pb-0.5">
                        Prof. Tariq Mahmood
                      </div>
                      <span className="text-slate-500 font-bold block mt-1 uppercase text-[9px]">{isUrdu ? "پرنسپل کی مہر" : "Principal Seal Stamp"}</span>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
