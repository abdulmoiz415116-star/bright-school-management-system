"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Loader2, Trash2, Layers, Users, BookOpen, ShieldCheck, UserCheck, ArrowLeft, Search, Check, GraduationCap } from "lucide-react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useLocale } from "next-intl";

type AttendanceRecord = {
  id?: number;
  record_date: string;
  person_type: 'student' | 'teacher' | 'staff';
  person_id: number;
  person_name: string;
  status: 'present' | 'absent' | 'leave';
};

export function AttendanceClient({ 
  students, teachers, staff, initialRecords 
}: { 
  students: any[], teachers: any[], staff: any[], initialRecords: AttendanceRecord[] 
}) {
  const profile = useAdminProfile();
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'staff'>('student');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch records if date changes
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('record_date', selectedDate);
      if (data) setRecords(data);
      setLoading(false);
    };
    if (selectedDate !== new Date().toISOString().split('T')[0]) {
      fetchRecords();
    }
  }, [selectedDate, supabase]);

  const handleMarkAttendance = async (person_id: number, person_name: string, status: 'present' | 'absent' | 'leave') => {
    const newRecord: AttendanceRecord = {
      record_date: selectedDate,
      person_type: activeTab,
      person_id,
      person_name,
      status
    };

    // Optimistic UI update
    setRecords(prev => {
      const filtered = prev.filter(r => !(r.person_id === person_id && r.person_type === activeTab));
      return [...filtered, newRecord];
    });

    const { error } = await supabase.from('attendance').upsert(newRecord, {
      onConflict: 'record_date,person_type,person_id'
    });

    if (error) {
      console.warn("Supabase upsert note:", error.message);
    }
  };

  const handleMarkAllPresent = async (className: string) => {
    const classStudents = classesMap[className] || [];
    if (classStudents.length === 0) return;

    // Optimistic UI update
    setRecords(prev => {
      const filtered = prev.filter(r => !(r.person_type === 'student' && classStudents.some(s => s.id === r.person_id)));
      const newRecords = classStudents.map(s => ({
        record_date: selectedDate,
        person_type: 'student' as const,
        person_id: s.id,
        person_name: s.name,
        status: 'present' as const
      }));
      return [...filtered, ...newRecords];
    });

    const promises = classStudents.map(s => {
      const newRecord: AttendanceRecord = {
        record_date: selectedDate,
        person_type: 'student',
        person_id: s.id,
        person_name: s.name,
        status: 'present'
      };
      return supabase.from('attendance').upsert(newRecord, {
        onConflict: 'record_date,person_type,person_id'
      });
    });

    await Promise.all(promises);
  };

  const handleResetRegister = async (className: string) => {
    const classStudents = classesMap[className] || [];
    if (classStudents.length === 0) return;

    // Optimistic UI update
    setRecords(prev => prev.filter(r => !(r.person_type === 'student' && classStudents.some(s => s.id === r.person_id))));

    const promises = classStudents.map(s => {
      return supabase
        .from('attendance')
        .delete()
        .eq('record_date', selectedDate)
        .eq('person_type', 'student')
        .eq('person_id', s.id);
    });

    await Promise.all(promises);
  };

  const handleDeleteAttendance = async (person_id: number) => {
    // Optimistic UI delete
    setRecords(prev => prev.filter(r => !(r.person_id === person_id && r.person_type === activeTab)));

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('record_date', selectedDate)
      .eq('person_type', activeTab)
      .eq('person_id', person_id);

    if (error) {
      console.warn("Delete note:", error.message);
    }
  };

  const getStatus = (person_id: number, type: 'student' | 'teacher' | 'staff') => {
    const record = records.find(r => r.person_id === person_id && r.person_type === type);
    return record ? record.status : null;
  };

  // Group Students Class-Wise for Cards
  const classesMap: { [className: string]: any[] } = {};
  students.forEach(s => {
    const cName = s.class_name || (isUrdu ? 'Grade 1' : 'Grade 1');
    if (!classesMap[cName]) classesMap[cName] = [];
    classesMap[cName].push(s);
  });

  const classOrder = [
    "Playgroup",
    "KG 1",
    "KG 2",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10"
  ];

  const uniqueClassNames = Object.keys(classesMap).sort((a, b) => {
    const idxA = classOrder.indexOf(a);
    const idxB = classOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  // Summary Counts Across Entire School
  const totalStudentsCount = students.length;
  const totalPresentCount = students.filter(s => getStatus(s.id, 'student') === 'present').length;
  const totalAbsentCount = students.filter(s => getStatus(s.id, 'student') === 'absent').length;
  const totalLeaveCount = students.filter(s => getStatus(s.id, 'student') === 'leave').length;

  return (
    <div className="flex-1 w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-semibold text-foreground">{profile.firstName} {profile.lastName}</span>
            <span className="text-xs text-muted-foreground">{isUrdu ? "سپر ایڈمن" : "Super Admin"}</span>
          </div>
          <Avatar className="h-9 w-9 border border-border shadow-sm">
            <AvatarImage src="/admin_avatar.png" />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <CalendarCheck className="h-8 w-8 text-rose-600 animate-pulse" />
              {isUrdu ? "سکول سمارٹ حاضری سسٹم" : "School Smart Attendance System"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isUrdu ? "کلاس وائز حاضری رجسٹرز، سمری رپورٹس اور عملے کا ریکارڈ۔" : "Class-wise attendance registers, overview dashboard, and employee records."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-card px-4 py-2 rounded-xl border border-border shadow-sm flex items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">{isUrdu ? "حاضری کی تاریخ:" : "Date:"}</span>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 text-sm w-[150px] font-bold text-rose-600 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Top Overview Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">{isUrdu ? "کل طلباء (Total Students)" : "Total Students"}</p>
                <h3 className="text-2xl font-black text-foreground">{totalStudentsCount}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">{isUrdu ? "کل حاضر (Present)" : "Total Present"}</p>
                <h3 className="text-2xl font-black text-emerald-600">{totalPresentCount}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">{isUrdu ? "کل غائب (Absent)" : "Total Absent"}</p>
                <h3 className="text-2xl font-black text-rose-600">{totalAbsentCount}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">{isUrdu ? "کل رخصت (Leave)" : "Total On Leave"}</p>
                <h3 className="text-2xl font-black text-blue-600">{totalLeaveCount}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs (Students vs Teachers vs Staff) */}
        <div className="flex space-x-2 bg-muted p-1.5 rounded-2xl mb-8 w-fit border border-border/50">
          <button
            onClick={() => { setActiveTab('student'); setSearchQuery(''); }}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'student' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isUrdu ? "طلباء کی حاضری (Students)" : "Student Attendance"}
          </button>
          <button
            onClick={() => { setActiveTab('teacher'); setSelectedClass(null); setSearchQuery(''); }}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'teacher' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isUrdu ? "اساتذہ کی حاضری (Teachers)" : "Teachers Attendance"}
          </button>
          <button
            onClick={() => { setActiveTab('staff'); setSelectedClass(null); setSearchQuery(''); }}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'staff' ? 'bg-background shadow-md text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isUrdu ? "دیگر عملہ (Staff)" : "Staff Attendance"}
          </button>
        </div>

        {/* STUDENT ATTENDANCE SECTION */}
        {activeTab === 'student' && (
          <>
            {/* VIEW A: CLASSES SUMMARY DASHBOARD */}
            {selectedClass === null ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b pb-4">
                  <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-rose-600" />
                    {isUrdu ? "تمام کلاسز کی سمری رپورٹ" : "Class-Wise Summaries"}
                  </h2>
                  <Badge variant="secondary" className="px-3 py-1 font-bold text-xs">
                    {uniqueClassNames.length} {isUrdu ? "کلاسز" : "Classes"}
                  </Badge>
                </div>

                {/* Quick Class Dropdown Switcher */}
                <Card className="bg-muted/40 border border-border/80 shadow-sm p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-foreground flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-rose-600" />
                      {isUrdu ? "رجسٹر تک فوری رسائی" : "Quick Access to Register"}
                    </p>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {isUrdu ? "کسی بھی کلاس کا رجسٹر کھولنے کے لیے نیچے سے منتخب کریں:" : "Choose a class from the dropdown to open its register immediately:"}
                    </p>
                  </div>
                  <div className="w-full sm:w-[250px]">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedClass(e.target.value);
                          setSearchQuery('');
                        }
                      }}
                      className="w-full h-10 px-3.5 text-sm font-bold rounded-xl border border-rose-200 dark:border-rose-950 bg-background text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm transition-all cursor-pointer"
                    >
                      <option value="">{isUrdu ? "کلاس منتخب کریں..." : "Select Class..."}</option>
                      {classOrder.map(cName => (
                        <option key={cName} value={cName}>{cName}</option>
                      ))}
                    </select>
                  </div>
                </Card>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {classOrder.map(cName => {
                    const classStudents = classesMap[cName] || [];
                    const cPresent = classStudents.filter(s => getStatus(s.id, 'student') === 'present').length;
                    const cAbsent = classStudents.filter(s => getStatus(s.id, 'student') === 'absent').length;
                    const cLeave = classStudents.filter(s => getStatus(s.id, 'student') === 'leave').length;
                    const cTotal = classStudents.length;
                    const cUnmarked = cTotal - (cPresent + cAbsent + cLeave);

                    // Completion percentage
                    const percentMarked = Math.round(((cTotal - cUnmarked) / cTotal) * 100) || 0;

                    // Completion badge
                    let statusLabel = isUrdu ? "غیر شروع شدہ" : "Pending";
                    let badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                    if (cTotal === 0) {
                      statusLabel = isUrdu ? "کوئی طالب علم نہیں" : "No Students";
                      badgeColor = "bg-slate-500/10 text-slate-600 border-slate-500/20";
                    } else if (cUnmarked === 0) {
                      statusLabel = isUrdu ? "مکمل شدہ" : "Completed";
                      badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                    } else if (cUnmarked < cTotal) {
                      statusLabel = isUrdu ? "جاری ہے" : "In Progress";
                      badgeColor = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
                    }

                    return (
                      <Card key={cName} className="border border-border/80 shadow-sm bg-card overflow-hidden hover:border-rose-400/50 hover:shadow-md transition-all duration-300 flex flex-col">
                        <CardHeader className="bg-muted/30 border-b border-border/60 p-5 pb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-rose-600 shrink-0" />
                                {cName}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground font-semibold mt-1">
                                {cTotal} {isUrdu ? "طلباء رجسٹرڈ" : "Students Registered"}
                              </p>
                            </div>
                            <Badge className={`border font-black text-[10px] ${badgeColor}`} variant="outline">
                              {statusLabel}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          {/* Mini Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-muted-foreground">{isUrdu ? "حاضری کی شرح" : "Marked Status"}</span>
                              <span className="text-foreground">{percentMarked}%</span>
                            </div>
                            <div className="w-full bg-muted dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  cUnmarked === 0 ? 'bg-emerald-600' : 'bg-rose-500'
                                }`} 
                                style={{ width: `${percentMarked}%` }}
                              />
                            </div>
                          </div>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{isUrdu ? "حاضر" : "Present"}</p>
                              <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{cPresent}</p>
                            </div>
                            <div className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">{isUrdu ? "غائب" : "Absent"}</p>
                              <p className="text-base font-black text-rose-600 dark:text-rose-400">{cAbsent}</p>
                            </div>
                            <div className="p-2 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{isUrdu ? "رخصت" : "Leave"}</p>
                              <p className="text-base font-black text-blue-600 dark:text-blue-400">{cLeave}</p>
                            </div>
                          </div>

                          {/* Card Action Footer */}
                          <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-950 dark:hover:bg-rose-950/40 px-3 h-8"
                              onClick={() => handleMarkAllPresent(cName)}
                              disabled={cTotal === 0}
                            >
                              <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              {isUrdu ? "سب حاضر کریں" : "Mark All Present"}
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 h-8"
                              onClick={() => setSelectedClass(cName)}
                            >
                              {isUrdu ? "رجسٹر کھولیں" : "Open Register"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* VIEW B: CLASS ATTENDANCE REGISTER ROSTER */
              <Card className="border-border shadow-md bg-card overflow-hidden animate-in fade-in duration-300">
                <CardHeader className="bg-muted/40 border-b border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Side: Back button, Class Title & Switcher */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Button 
                      variant="ghost" 
                      onClick={() => { setSelectedClass(null); setSearchQuery(''); }}
                      className="w-fit font-bold text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 pl-0 hover:bg-transparent"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{isUrdu ? "کلاس ڈیش بورڈ" : "Back to Classes"}</span>
                    </Button>
                    <div className="h-4 w-px bg-border hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-foreground">
                        {isUrdu ? `${selectedClass} کا رجسٹر` : `${selectedClass} Register`}
                      </h2>
                      <select 
                        value={selectedClass} 
                        onChange={(e) => { setSelectedClass(e.target.value); setSearchQuery(''); }}
                        className="h-8 text-xs font-bold rounded-lg border border-border bg-background px-2.5 text-rose-600 focus:outline-none cursor-pointer"
                      >
                        {classOrder.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Side: Quick Action Controls */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-950 dark:hover:bg-emerald-950/20 font-bold text-xs"
                      onClick={() => handleMarkAllPresent(selectedClass)}
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      {isUrdu ? "سب کو حاضر کریں" : "Mark All Present"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-950 dark:hover:bg-rose-950/20 font-bold text-xs"
                      onClick={() => handleResetRegister(selectedClass)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      {isUrdu ? "ری سیٹ کریں" : "Reset Register"}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Search Bar */}
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder={isUrdu ? "طالب علم کا نام تلاش کریں..." : "Search student by name..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm bg-background border-border"
                    />
                  </div>

                  {/* Roster list filtered */}
                  <div className="space-y-3">
                    {(() => {
                      const classStudents = classesMap[selectedClass] || [];
                      const filteredStudents = classStudents.filter(s => 
                        s.name.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      if (filteredStudents.length === 0) {
                        return (
                          <div className="p-12 text-center text-muted-foreground border border-dashed rounded-2xl">
                            <Search className="w-10 h-10 mx-auto opacity-20 mb-3" />
                            <p className="font-bold">{isUrdu ? "کوئی طالب علم نہیں ملا" : "No students found"}</p>
                            <p className="text-xs">{isUrdu ? "نام یا ہجے درست کریں اور دوبارہ کوشش کریں۔" : "Try searching for a different name."}</p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {filteredStudents.map(student => {
                            const status = getStatus(student.id, 'student');
                            const isAbsent = status === 'absent';
                            const isLeave = status === 'leave';
                            const isPresent = status === 'present';

                            return (
                              <div 
                                key={student.id} 
                                className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${
                                  isAbsent 
                                    ? 'bg-rose-500/10 border-rose-500/40 dark:bg-rose-950/20' 
                                    : isLeave 
                                    ? 'bg-blue-500/10 border-blue-500/40 dark:bg-blue-950/20' 
                                    : isPresent
                                    ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20'
                                    : 'bg-card border-border hover:border-muted-foreground/30'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-bold text-[10px] px-1.5 h-5 flex items-center">
                                      #{student.roll_number || 'N/A'}
                                    </Badge>
                                    <span className={`font-black text-sm truncate max-w-[120px] ${
                                      isAbsent ? 'text-rose-600 dark:text-rose-400 font-bold' : isLeave ? 'text-blue-600 dark:text-blue-400 font-bold' : isPresent ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-foreground'
                                    }`}>
                                      {student.name}
                                    </span>
                                  </div>

                                  {/* Status Indicator */}
                                  <div>
                                    {isAbsent && <Badge className="bg-rose-600 text-white font-bold text-[9px] px-1.5 py-0.5">{isUrdu ? "غائب" : "Absent"}</Badge>}
                                    {isLeave && <Badge className="bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0.5">{isUrdu ? "رخصت" : "On Leave"}</Badge>}
                                    {isPresent && <Badge className="bg-emerald-600 text-white font-bold text-[9px] px-1.5 py-0.5">{isUrdu ? "حاضر" : "Present"}</Badge>}
                                    {!status && <Badge variant="outline" className="text-muted-foreground text-[9px] px-1.5 py-0.5">{isUrdu ? "غیر نشان زدہ" : "Unmarked"}</Badge>}
                                  </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
                                  <Button 
                                    size="sm" 
                                    variant={isPresent ? "default" : "outline"}
                                    className={`h-7 px-2.5 text-xs font-bold ${isPresent ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none" : "hover:text-emerald-600"}`}
                                    onClick={() => handleMarkAttendance(student.id, student.name, 'present')}
                                  >
                                    {isUrdu ? "حاضر" : "Present"}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant={isAbsent ? "default" : "outline"}
                                    className={`h-7 px-2.5 text-xs font-bold ${isAbsent ? "bg-rose-600 hover:bg-rose-700 text-white border-none" : "hover:text-rose-600"}`}
                                    onClick={() => handleMarkAttendance(student.id, student.name, 'absent')}
                                  >
                                    {isUrdu ? "غائب" : "Absent"}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant={isLeave ? "default" : "outline"}
                                    className={`h-7 px-2.5 text-xs font-bold ${isLeave ? "bg-blue-600 hover:bg-blue-700 text-white border-none" : "hover:text-blue-600"}`}
                                    onClick={() => handleMarkAttendance(student.id, student.name, 'leave')}
                                  >
                                    {isUrdu ? "رخصت" : "Leave"}
                                  </Button>
                                  {status && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      title={isUrdu ? "حاضری ڈیلیٹ کریں" : "Delete"}
                                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg shrink-0"
                                      onClick={() => handleDeleteAttendance(student.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* TEACHERS & STAFF ATTENDANCE SECTION */}
        {(activeTab === 'teacher' || activeTab === 'staff') && (
          <Card className="border-border shadow-sm overflow-hidden bg-card animate-in fade-in duration-300">
            <CardHeader className="bg-muted/40 border-b border-border p-6">
              <CardTitle className="capitalize text-lg font-bold flex items-center gap-2">
                {activeTab === 'teacher' ? <BookOpen className="w-5 h-5 text-rose-600" /> : <ShieldCheck className="w-5 h-5 text-indigo-600" />}
                {isUrdu ? `${activeTab === 'teacher' ? 'اساتذہ' : 'عملہ'} کا حاضری رجسٹر` : `${activeTab.toUpperCase()} Attendance Register`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(activeTab === 'teacher' ? teachers : staff).map(person => {
                  const status = getStatus(person.id, activeTab);
                  const isAbsent = status === 'absent';
                  const isLeave = status === 'leave';
                  const isPresent = status === 'present';

                  return (
                    <div 
                      key={person.id}
                      className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${
                        isAbsent 
                          ? 'bg-rose-500/10 border-rose-500/40' 
                          : isLeave 
                          ? 'bg-blue-500/10 border-blue-500/40' 
                          : isPresent 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-card border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-base text-foreground">{person.name}</p>
                          {person.role && <p className="text-xs text-muted-foreground">{person.role}</p>}
                        </div>
                        <div>
                          {isAbsent && <Badge className="bg-rose-600 text-white font-bold">{isUrdu ? "غائب" : "Absent"}</Badge>}
                          {isLeave && <Badge className="bg-blue-600 text-white font-bold">{isUrdu ? "رخصت" : "On Leave"}</Badge>}
                          {isPresent && <Badge className="bg-emerald-600 text-white font-bold">{isUrdu ? "حاضر" : "Present"}</Badge>}
                          {!status && <Badge variant="outline" className="text-muted-foreground">{isUrdu ? "غیر نشان زدہ" : "Unmarked"}</Badge>}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                        <Button 
                          size="sm" 
                          variant={isPresent ? "default" : "outline"}
                          className={`font-bold ${isPresent ? "bg-emerald-600 text-white border-none" : ""}`}
                          onClick={() => handleMarkAttendance(person.id, person.name, 'present')}
                        >
                          {isUrdu ? "حاضر" : "Present"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant={isAbsent ? "default" : "outline"}
                          className={`font-bold ${isAbsent ? "bg-rose-600 text-white border-none" : ""}`}
                          onClick={() => handleMarkAttendance(person.id, person.name, 'absent')}
                        >
                          {isUrdu ? "غائب" : "Absent"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant={isLeave ? "default" : "outline"}
                          className={`font-bold ${isLeave ? "bg-blue-600 text-white border-none" : ""}`}
                          onClick={() => handleMarkAttendance(person.id, person.name, 'leave')}
                        >
                          {isUrdu ? "رخصت" : "Leave"}
                        </Button>
                        {status && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-500 hover:text-rose-700 p-2 rounded-lg"
                            onClick={() => handleDeleteAttendance(person.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
