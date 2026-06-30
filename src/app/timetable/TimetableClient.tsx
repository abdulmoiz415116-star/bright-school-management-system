"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell 
} from "@/components/ui/table";
import { 
  Calendar, Plus, Clock, BookOpen, UserCheck, Printer, Pencil, X, 
  Coffee, LayoutGrid, Filter, GraduationCap, School, Layers, Search, Sparkles, CheckCircle2
} from "lucide-react";
import { useLocale } from "next-intl";
import { TopNav } from "@/components/TopNav";

type PeriodItem = {
  id?: string;
  periodNo: number | string;
  time: string;
  subject: string;
  teacher?: string;
  room?: string;
  isBreak?: boolean;
};

type ClassCard = {
  id: string;
  className: string;
  room: string;
  bgColor: string;
  badgeColor: string;
  periods: PeriodItem[];
};

interface TimetableClientProps {
  classes?: any[];
  sections?: any[];
  subjects?: any[];
  teachers?: any[];
  initialPeriods?: any[];
}

export function TimetableClient(props: TimetableClientProps) {
  const locale = useLocale();
  const isUrdu = locale === 'ur';

  // View Mode: 'cards' = All Classes Cards View, 'classSelection' = Class & Section Selection View
  const [viewMode, setViewMode] = useState<'cards' | 'classSelection'>('cards');

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [selectedSection, setSelectedSection] = useState("Section A");

  const DAYS = [
    { id: "Monday", en: "Monday", ur: "پیر (Monday)" },
    { id: "Tuesday", en: "Tuesday", ur: "منگل (Tuesday)" },
    { id: "Wednesday", en: "Wednesday", ur: "بدھ (Wednesday)" },
    { id: "Thursday", en: "Thursday", ur: "جمعرات (Thursday)" },
    { id: "Friday", en: "Friday", ur: "جمعہ (Friday)" },
    { id: "Saturday", en: "Saturday", ur: "ہفتہ (Saturday)" }
  ];

  const CLASS_OPTIONS = [
    "Playgroup", "Nursery", "Prep", 
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", 
    "Class 6", "Class 7", "Class 8", "Class 9 (Matric)", "Class 10 (Matric)"
  ];

  const SECTION_OPTIONS = [
    "Section A", "Section B", "Section C"
  ];

  // Comprehensive uniform class schedule data for Cards View
  const initialClassCards: ClassCard[] = [
    {
      id: "cls-pg",
      className: "Playgroup",
      room: "Room 101",
      bgColor: "bg-pink-50/90 border-pink-200",
      badgeColor: "bg-pink-100 text-pink-800 border-pink-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "Alphabet Rhymes", teacher: "Miss Sana Malik" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "Montessori Toys", teacher: "Mrs. Ayesha Saddiqa" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Snack Break 🍎", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "Story Time", teacher: "Miss Hira Khan" }
      ]
    },
    {
      id: "cls-nur",
      className: "Nursery",
      room: "Room 102",
      bgColor: "bg-sky-50/90 border-sky-200",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "Phonics & Arts", teacher: "Mrs. Ayesha Saddiqa" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "Basic Numbers", teacher: "Miss Sana Malik" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break 🥪", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "General Knowledge", teacher: "Prof. Tariq Mahmood" }
      ]
    },
    {
      id: "cls-prep",
      className: "Prep",
      room: "Room 103",
      bgColor: "bg-emerald-50/90 border-emerald-200",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "English Reading", teacher: "Miss Hira Khan" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "Mathematics", teacher: "Prof. Tariq Mahmood" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break 🧃", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "Urdu Writing", teacher: "Sir Hamza Ali" }
      ]
    },
    {
      id: "cls-1",
      className: "Class 1",
      room: "Room 201",
      bgColor: "bg-purple-50/90 border-purple-200",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "English Lit.", teacher: "Miss Sana Malik" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "Mathematics", teacher: "Prof. Tariq Mahmood" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break 🍌", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "General Science", teacher: "Sir Hamza Ali" }
      ]
    },
    {
      id: "cls-2",
      className: "Class 2",
      room: "Room 202",
      bgColor: "bg-amber-50/90 border-amber-200",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "Mathematics", teacher: "Prof. Tariq Mahmood" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "Urdu Language", teacher: "Miss Hira Khan" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break 🥛", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "Computer Science", teacher: "Miss Sana Malik" }
      ]
    },
    {
      id: "cls-3",
      className: "Class 3",
      room: "Room 203",
      bgColor: "bg-rose-50/90 border-rose-200",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "Science & Lab", teacher: "Sir Hamza Ali" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "English Grammar", teacher: "Mrs. Ayesha Saddiqa" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break 🥐", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "Social Studies", teacher: "Miss Hira Khan" }
      ]
    },
    {
      id: "cls-4",
      className: "Class 4",
      room: "Room 301",
      bgColor: "bg-indigo-50/90 border-indigo-200",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "Geography", teacher: "Miss Hira Khan" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "Algebra Math", teacher: "Prof. Tariq Mahmood" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break 🍎", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "Islamiat Study", teacher: "Sir Hamza Ali" }
      ]
    },
    {
      id: "cls-5",
      className: "Class 5",
      room: "Room 302",
      bgColor: "bg-teal-50/90 border-teal-200",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "Computer Robotics", teacher: "Miss Sana Malik" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "Physics Prep", teacher: "Sir Hamza Ali" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break 🥪", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "English Essay", teacher: "Mrs. Ayesha Saddiqa" }
      ]
    },
    {
      id: "cls-6",
      className: "Class 6",
      room: "Room 303",
      bgColor: "bg-cyan-50/90 border-cyan-200",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "Biology Intro", teacher: "Sir Hamza Ali" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "Mathematics", teacher: "Prof. Tariq Mahmood" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break 🍱", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "History", teacher: "Miss Hira Khan" }
      ]
    },
    {
      id: "cls-7",
      className: "Class 7",
      room: "Room 401",
      bgColor: "bg-orange-50/90 border-orange-200",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "Chemistry Lab", teacher: "Sir Hamza Ali" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "English Comp", teacher: "Mrs. Ayesha Saddiqa" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break 🧃", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "Geometry", teacher: "Prof. Tariq Mahmood" }
      ]
    },
    {
      id: "cls-8",
      className: "Class 8",
      room: "Room 402",
      bgColor: "bg-pink-50/90 border-pink-200",
      badgeColor: "bg-pink-100 text-pink-800 border-pink-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "Advanced Math", teacher: "Prof. Tariq Mahmood" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "Computer Lab", teacher: "Miss Sana Malik" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break 🍌", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "Physics", teacher: "Sir Hamza Ali" }
      ]
    },
    {
      id: "cls-9",
      className: "Class 9 (Matric)",
      room: "Room 501",
      bgColor: "bg-violet-50/90 border-violet-200",
      badgeColor: "bg-violet-100 text-violet-800 border-violet-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "Biology / Comp", teacher: "Sir Hamza Ali" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "Chemistry", teacher: "Prof. Tariq Mahmood" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break 🥐", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "Physics Theory", teacher: "Miss Sana Malik" }
      ]
    },
    {
      id: "cls-10",
      className: "Class 10 (Matric)",
      room: "Room 502",
      bgColor: "bg-rose-50/90 border-rose-200",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      periods: [
        { periodNo: 1, time: "08:00 - 08:45 AM", subject: "Board Math Prep", teacher: "Prof. Tariq Mahmood" },
        { periodNo: 2, time: "08:45 - 09:30 AM", subject: "Physics Lab", teacher: "Sir Hamza Ali" },
        { periodNo: "Break", time: "10:15 - 10:30 AM", subject: "Recess Break ☕", isBreak: true },
        { periodNo: 4, time: "10:30 - 11:15 AM", subject: "English Board", teacher: "Mrs. Ayesha Saddiqa" }
      ]
    }
  ];

  const [classCardsList, setClassCardsList] = useState<ClassCard[]>(initialClassCards);

  // Class & Section detailed full schedule data
  const generateDetailedSchedule = (className: string, sectionName: string) => {
    return [
      { id: "p1", periodNo: 1, time: "08:00 - 08:45 AM", subject: "English Language & Literature", teacher: "Miss Sana Malik", room: "Room 201" },
      { id: "p2", periodNo: 2, time: "08:45 - 09:30 AM", subject: "Mathematics & Algebra", teacher: "Prof. Tariq Mahmood", room: "Room 201" },
      { id: "p3", periodNo: 3, time: "09:30 - 10:15 AM", subject: "General Science & Experiments", teacher: "Sir Hamza Ali", room: "Lab 2" },
      { id: "pb", periodNo: "Break", time: "10:15 - 10:45 AM", subject: "Recess & Snack Break 🍎", teacher: "-", room: "Courtyard", isBreak: true },
      { id: "p4", periodNo: 4, time: "10:45 - 11:30 AM", subject: "Urdu Language & Grammar", teacher: "Miss Hira Khan", room: "Room 201" },
      { id: "p5", periodNo: 5, time: "11:30 - 12:15 PM", subject: "Computer Science & IT", teacher: "Miss Sana Malik", room: "Comp Lab 1" },
      { id: "p6", periodNo: 6, time: "12:15 - 01:00 PM", subject: "Islamiat & Social Studies", teacher: "Mrs. Ayesha Saddiqa", room: "Room 201" },
      { id: "p7", periodNo: 7, time: "01:00 - 01:45 PM", subject: "Arts, Crafts & Physical Ed", teacher: "Sir Usman Ahmed", room: "Ground" },
    ];
  };

  const [detailedSchedule, setDetailedSchedule] = useState<PeriodItem[]>(generateDetailedSchedule("Class 1", "Section A"));

  // Edit Period Modal State
  const [editingModal, setEditingModal] = useState<{ 
    source: 'cards' | 'selection';
    cardId?: string; 
    periodIndex: number; 
    period: PeriodItem; 
    className: string 
  } | null>(null);

  const [editForm, setEditForm] = useState({ subject: "", teacher: "", time: "", room: "" });

  const handleOpenEdit = (
    source: 'cards' | 'selection',
    periodIndex: number, 
    period: PeriodItem, 
    className: string,
    cardId?: string
  ) => {
    if (period.isBreak) return;
    setEditingModal({ source, cardId, periodIndex, period, className });
    setEditForm({
      subject: period.subject || "",
      teacher: period.teacher || "",
      time: period.time || "08:00 - 08:45 AM",
      room: period.room || "Room 201"
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModal) return;

    if (editingModal.source === 'cards' && editingModal.cardId) {
      setClassCardsList(prev => prev.map(card => {
        if (card.id === editingModal.cardId) {
          const updatedPeriods = [...card.periods];
          updatedPeriods[editingModal.periodIndex] = {
            ...updatedPeriods[editingModal.periodIndex],
            subject: editForm.subject,
            teacher: editForm.teacher,
            time: editForm.time
          };
          return { ...card, periods: updatedPeriods };
        }
        return card;
      }));
    } else {
      setDetailedSchedule(prev => {
        const updated = [...prev];
        updated[editingModal.periodIndex] = {
          ...updated[editingModal.periodIndex],
          subject: editForm.subject,
          teacher: editForm.teacher,
          time: editForm.time,
          room: editForm.room
        };
        return updated;
      });
    }

    setEditingModal(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-gradient-to-br from-pink-50/50 via-sky-50/30 to-rose-50/30 animate-in fade-in duration-300">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .printable-timetable, .printable-timetable * { visibility: visible !important; }
          .printable-timetable { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; background: white !important; color: black !important; }
          .no-print-btn { display: none !important; }
        }
      `}</style>

      <TopNav />

      {/* EDIT PERIOD ENTRY MODAL */}
      {editingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print-btn">
          <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-200">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                  <Pencil className="w-4 h-4 text-rose-600" />
                  {isUrdu ? `${editingModal.className} - پیریڈ ایڈٹ کریں` : `Edit Period - ${editingModal.className}`}
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-rose-600 mt-0.5">
                  تیندیلی کریں اور لائیو محفوظ کریں
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingModal(null)} className="rounded-full h-8 w-8"><X className="w-4 h-4"/></Button>
            </CardHeader>
            <form onSubmit={handleSaveEdit}>
              <CardContent className="p-5 space-y-4">
                <div>
                  <Label className="font-bold text-xs uppercase text-slate-700">{isUrdu ? 'مضمون کا نام (Subject) *' : 'Subject Title *'}</Label>
                  <Input required value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })} className="rounded-xl font-bold mt-1 h-10 text-xs border-pink-200" />
                </div>
                <div>
                  <Label className="font-bold text-xs uppercase text-slate-700">{isUrdu ? 'استاد کا نام (Teacher) *' : 'Teacher Name *'}</Label>
                  <Input required value={editForm.teacher} onChange={e => setEditForm({ ...editForm, teacher: e.target.value })} className="rounded-xl font-bold mt-1 h-10 text-xs border-pink-200" />
                </div>
                <div>
                  <Label className="font-bold text-xs uppercase text-slate-700">{isUrdu ? 'پیریڈ کا وقت (Time Slot)' : 'Time Slot'}</Label>
                  <Input value={editForm.time} onChange={e => setEditForm({ ...editForm, time: e.target.value })} className="rounded-xl font-mono font-bold mt-1 h-10 text-xs border-pink-200" />
                </div>
                {editingModal.source === 'selection' && (
                  <div>
                    <Label className="font-bold text-xs uppercase text-slate-700">{isUrdu ? 'کمرہ / لیب (Room)' : 'Room / Lab'}</Label>
                    <Input value={editForm.room} onChange={e => setEditForm({ ...editForm, room: e.target.value })} className="rounded-xl font-bold mt-1 h-10 text-xs border-pink-200" />
                  </div>
                )}
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingModal(null)} className="rounded-xl font-bold h-9 text-xs">{isUrdu ? 'منسوخ' : 'Cancel'}</Button>
                  <Button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 text-xs px-5">{isUrdu ? 'محفوظ کریں' : 'Save Entry'}</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 printable-timetable">
        
        {/* LIGHT SOFT TOP HEADER BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-pink-200 shadow-sm no-print-btn">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-700 flex items-center justify-center font-black text-3xl border border-pink-200 shrink-0 shadow-sm">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  {isUrdu ? 'سکول ٹائم ٹیبل مینجمنٹ' : 'School Timetable Portal'}
                </h1>
                <Badge className="bg-rose-100 text-rose-800 font-bold text-[11px] px-3 py-1 border border-rose-200">
                  {viewMode === 'cards' ? (isUrdu ? 'تمام کارڈز ویو' : 'Cards Grid Mode') : (isUrdu ? 'کلاس و سیکشن ویو' : 'Class & Section Mode')}
                </Badge>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                {isUrdu 
                  ? 'تمام کلاسز کے کارڈز اور الگ کلاس و سیکشن کا تفصیلی ٹائم ٹیبل دونوں دستیاب ہیں' 
                  : 'Switch seamlessly between All Classes Cards View and Class & Section Detailed View'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto flex-wrap">
            <Button onClick={handlePrint} variant="outline" className="rounded-2xl border-pink-300 text-pink-700 hover:bg-pink-50 font-bold px-5 h-11 flex items-center gap-2 shadow-sm text-xs">
              <Printer className="w-4 h-4 text-pink-600" />
              {isUrdu ? 'پرنٹ کریں / PDF' : 'Print Timetable'}
            </Button>
          </div>
        </div>

        {/* VIEW MODE TOGGLE SWITCHER & DAY SELECTOR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-pink-200 shadow-sm no-print-btn">
          
          {/* VIEW MODE TABS */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`py-2 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${viewMode === 'cards' ? 'bg-white text-pink-700 shadow-sm scale-[1.02]' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <LayoutGrid className="w-4 h-4 text-pink-600" />
              <span>{isUrdu ? '🎴 تمام کلاسز کارڈز (Cards View)' : 'All Classes Cards View'}</span>
            </button>
            <button
              onClick={() => setViewMode('classSelection')}
              className={`py-2 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${viewMode === 'classSelection' ? 'bg-white text-rose-700 shadow-sm scale-[1.02]' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Filter className="w-4 h-4 text-rose-600" />
              <span>{isUrdu ? '🔍 کلاس و سیکشن انتخاب (Class & Section)' : 'Class & Section Filter View'}</span>
            </button>
          </div>

          {/* DAY SELECTOR TABS */}
          <div className="flex flex-wrap items-center gap-1.5">
            {DAYS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                className={`py-1.5 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${selectedDay === d.id ? 'bg-pink-100 text-pink-800 border-2 border-pink-300 shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-pink-50 border border-slate-200'}`}
              >
                <Clock className="w-3 h-3 text-pink-600" />
                <span>{isUrdu ? d.ur.split(' ')[0] : d.en}</span>
              </button>
            ))}
          </div>

        </div>

        {/* VIEW MODE 1: ALL CLASSES CARDS GRID */}
        {viewMode === 'cards' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex items-center justify-between no-print-btn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-600" />
                <h2 className="text-lg font-black text-slate-800">
                  {isUrdu ? `تمام 13 کلاسز کا یکساں کارڈز گرڈ (${selectedDay})` : `All 13 Classes Timetable Cards Grid (${selectedDay})`}
                </h2>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 border border-emerald-200">
                100% UNIFORM ALIGNED
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {classCardsList.map((card) => (
                <Card key={card.id} className="border border-pink-200/80 shadow-md bg-white rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-[380px] justify-between">
                  
                  {/* Soft Light Pastel Header */}
                  <CardHeader className={`${card.bgColor} p-4 space-y-1 shrink-0 border-b`}>
                    <div className="flex items-center justify-between">
                      <Badge className={`${card.badgeColor} font-bold text-[10px] px-2.5 py-0.5 border`}>
                        {selectedDay.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono font-bold text-slate-600">{card.room}</span>
                    </div>
                    <CardTitle className="text-lg font-black tracking-tight text-slate-800 pt-0.5">
                      {card.className}
                    </CardTitle>
                  </CardHeader>

                  {/* Periods List - Fixed Height & Flex Layout */}
                  <CardContent className="p-4 space-y-2.5 bg-white flex-1 overflow-y-auto">
                    {card.periods.map((p, pIdx) => (
                      <div 
                        key={pIdx}
                        className={`p-2.5 rounded-2xl border transition-all ${p.isBreak ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-slate-50/80 border-slate-200 hover:bg-pink-50/40 hover:border-pink-200 group'}`}
                      >
                        {p.isBreak ? (
                          <div className="flex items-center justify-between text-xs font-bold py-0.5">
                            <div className="flex items-center gap-2 text-amber-800">
                              <Coffee className="w-3.5 h-3.5 text-amber-600" />
                              <span>{p.subject}</span>
                            </div>
                            <span className="font-mono text-[10px] bg-amber-200/60 px-2 py-0.5 rounded-lg text-amber-900">{p.time}</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 overflow-hidden pr-2">
                                <span className="w-4 h-4 rounded-full bg-pink-100 text-pink-700 font-black text-[9px] flex items-center justify-center shrink-0 border border-pink-200">
                                  P{p.periodNo}
                                </span>
                                <span className="font-bold text-xs text-slate-800 truncate">{p.subject}</span>
                              </div>
                              
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="font-mono font-bold text-[10px] text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">
                                  {p.time}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit('cards', pIdx, p, card.className, card.id)}
                                  className="p-1 rounded-md hover:bg-pink-200 text-pink-700 transition no-print-btn"
                                  title="Edit Entry"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-slate-200/60">
                              <span className="text-slate-500 font-semibold flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                {isUrdu ? 'ٹیچر:' : 'Teacher:'}
                              </span>
                              <span className="font-bold text-slate-700">{p.teacher}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>

                </Card>
              ))}
            </div>
          </div>
        )}

        {/* VIEW MODE 2: CLASS & SECTION FILTER SELECTION VIEW */}
        {viewMode === 'classSelection' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* SELECTION DROPDOWNS BAR */}
            <Card className="border border-rose-200 shadow-md bg-white rounded-3xl p-6 no-print-btn">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                  {/* SELECT CLASS */}
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase text-slate-700 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-rose-600" />
                      {isUrdu ? 'کلاس منتخب کریں (Select Class)' : 'Select Class'}
                    </Label>
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setDetailedSchedule(generateDetailedSchedule(e.target.value, selectedSection));
                      }}
                      className="w-full h-11 px-4 rounded-2xl border border-rose-200 bg-rose-50/30 text-slate-800 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
                    >
                      {CLASS_OPTIONS.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  {/* SELECT SECTION */}
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-sky-600" />
                      {isUrdu ? 'سیکشن منتخب کریں (Select Section)' : 'Select Section'}
                    </Label>
                    <select
                      value={selectedSection}
                      onChange={(e) => {
                        setSelectedSection(e.target.value);
                        setDetailedSchedule(generateDetailedSchedule(selectedClass, e.target.value));
                      }}
                      className="w-full h-11 px-4 rounded-2xl border border-sky-200 bg-sky-50/30 text-slate-800 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                    >
                      {SECTION_OPTIONS.map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>

                  {/* ACTIVE DAY INDICATOR */}
                  <div className="space-y-1.5">
                    <Label className="font-bold text-xs uppercase text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      {isUrdu ? 'منتخب شدہ دن (Active Day)' : 'Active Schedule Day'}
                    </Label>
                    <div className="h-11 px-4 rounded-2xl border border-amber-200 bg-amber-50/40 text-amber-900 font-bold text-xs flex items-center justify-between">
                      <span>{selectedDay}</span>
                      <Badge className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 border-0 font-bold">LIVELY</Badge>
                    </div>
                  </div>
                </div>

              </div>
            </Card>

            {/* SELECTED CLASS & SECTION TIMETABLE DISPLAY */}
            <Card className="border border-pink-200 shadow-xl bg-white rounded-3xl overflow-hidden">
              
              {/* Soft Gradient Header for Selected Class */}
              <CardHeader className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/20 text-white font-bold text-xs px-3 py-1 backdrop-blur-md border border-white/30">
                        {selectedDay.toUpperCase()} SCHEDULE
                      </Badge>
                      <Badge className="bg-emerald-400 text-slate-950 font-black text-xs px-3 py-1">
                        ACTIVE TIMETABLE
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
                      {selectedClass} <span className="opacity-90">({selectedSection})</span>
                    </CardTitle>
                    <CardDescription className="text-rose-100 font-semibold text-xs sm:text-sm mt-1">
                      {isUrdu ? `انچارج: Miss Sana Malik | کمرہ: Room 201 | کل پیریڈز: 7` : `Class Incharge: Miss Sana Malik | Assigned Room: Room 201 | Total Periods: 7`}
                    </CardDescription>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
                    <span className="block text-[10px] uppercase font-bold text-rose-100">School Timings</span>
                    <span className="text-base font-mono font-black text-white">08:00 AM - 01:45 PM</span>
                  </div>
                </div>
              </CardHeader>

              {/* DETAILED TIMETABLE TABLE */}
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/90">
                    <TableRow className="border-b border-slate-200">
                      <TableHead className="font-black text-xs uppercase text-slate-700 py-4 px-6">{isUrdu ? 'پیریڈ #' : 'Period #'}</TableHead>
                      <TableHead className="font-black text-xs uppercase text-slate-700 py-4 px-6">{isUrdu ? 'وقت (Time Slot)' : 'Time Slot'}</TableHead>
                      <TableHead className="font-black text-xs uppercase text-slate-700 py-4 px-6">{isUrdu ? 'مضمون (Subject)' : 'Subject Title'}</TableHead>
                      <TableHead className="font-black text-xs uppercase text-slate-700 py-4 px-6">{isUrdu ? 'استاد (Teacher)' : 'Assigned Teacher'}</TableHead>
                      <TableHead className="font-black text-xs uppercase text-slate-700 py-4 px-6">{isUrdu ? 'کمرہ / لیب' : 'Room / Lab'}</TableHead>
                      <TableHead className="font-black text-xs uppercase text-slate-700 py-4 px-6 text-right no-print-btn">{isUrdu ? 'ایکشن' : 'Action'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedSchedule.map((row, idx) => (
                      <TableRow 
                        key={idx}
                        className={`transition-colors border-b border-slate-100 ${row.isBreak ? 'bg-amber-50/60 font-bold text-amber-900' : 'hover:bg-pink-50/30'}`}
                      >
                        <TableCell className="py-4 px-6">
                          {row.isBreak ? (
                            <Badge className="bg-amber-200 text-amber-900 font-black text-xs px-2.5 py-1 border-0">BREAK</Badge>
                          ) : (
                            <span className="w-7 h-7 rounded-xl bg-pink-100 text-pink-800 font-black text-xs flex items-center justify-center border border-pink-200">
                              P{row.periodNo}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-6 font-mono font-bold text-xs text-slate-700">{row.time}</TableCell>
                        <TableCell className="py-4 px-6">
                          <span className={`font-bold text-sm ${row.isBreak ? 'text-amber-900' : 'text-slate-900'}`}>{row.subject}</span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {row.isBreak ? (
                            <span className="text-xs font-semibold text-amber-700">-</span>
                          ) : (
                            <span className="font-semibold text-xs text-slate-700 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              {row.teacher}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {row.room || 'Room 201'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right no-print-btn">
                          {!row.isBreak && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit('selection', idx, row, `${selectedClass} (${selectedSection})`)}
                              className="rounded-xl border-pink-200 hover:bg-pink-100 text-pink-700 font-bold text-xs h-8 px-3 flex items-center gap-1 ml-auto"
                            >
                              <Pencil className="w-3 h-3" />
                              {isUrdu ? 'ایڈٹ' : 'Edit'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
