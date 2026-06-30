"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ArrowRight, CheckCircle2, RefreshCw, Layers, Calendar } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useLocale } from "next-intl";

type AcademicYear = { id: string; title: string };
type ClassRecord = { id: string; name: string; numeric_value: number };
type SectionRecord = { id: string; class_id: string; name: string };
type StudentRecord = { id: string; admission_number: string; roll_number: string; class_id?: string; section_id?: string; full_name?: string };

export function PromotionClient({
  initialYears,
  initialClasses,
  initialSections,
  initialStudents
}: {
  initialYears: AcademicYear[];
  initialClasses: ClassRecord[];
  initialSections: SectionRecord[];
  initialStudents: StudentRecord[];
}) {
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const profile = useAdminProfile();
  const supabase = createClient();

  const [fromYear, setFromYear] = useState<string>(initialYears[0]?.id || "");
  const [toYear, setToYear] = useState<string>(initialYears[1]?.id || initialYears[0]?.id || "");

  const [fromClass, setFromClass] = useState<string>(initialClasses[0]?.id || "");
  const [toClass, setToClass] = useState<string>(initialClasses[1]?.id || initialClasses[0]?.id || "");

  const [fromSection, setFromSection] = useState<string>(initialSections[0]?.id || "");
  const [toSection, setToSection] = useState<string>(initialSections[0]?.id || "");

  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    initialStudents.map(s => s.id)
  );
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const filteredStudents = students.filter(s => !fromClass || s.class_id === fromClass || !s.class_id);

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleBatchPromote = async () => {
    if (selectedStudentIds.length === 0) return;
    setLoading(true);
    setSuccessMsg("");

    try {
      const promotionLogs = selectedStudentIds.map(sId => ({
        student_id: sId,
        from_academic_year_id: fromYear || null,
        to_academic_year_id: toYear || null,
        from_class_id: fromClass || null,
        to_class_id: toClass || null,
        from_section_id: fromSection || null,
        to_section_id: toSection || null,
        status: 'promoted',
        remarks: 'Batch Academic Promotion'
      }));

      await supabase.from('student_promotions').insert(promotionLogs);

      // Update students table
      for (const sId of selectedStudentIds) {
        await supabase.from('students').update({
          class_id: toClass,
          section_id: toSection,
          academic_year_id: toYear
        }).eq('id', sId);
      }

      // Optimistic state update
      setStudents(prev => prev.map(s => {
        if (selectedStudentIds.includes(s.id)) {
          return { ...s, class_id: toClass, section_id: toSection };
        }
        return s;
      }));

      setSuccessMsg(isUrdu ? `${selectedStudentIds.length} طلباء کو کامیابی کے ساتھ اگلی کلاس میں پروموٹ کر دیا گیا ہے!` : `Successfully promoted ${selectedStudentIds.length} students to the next grade!`);
    } catch (err) {
      console.error("Promotion error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <NotificationBell />
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
              <GraduationCap className="h-8 w-8 text-rose-600" />
              {isUrdu ? "خودکار طالب علم پروموشن اور سیشن رول اوور" : "Student Batch Promotion & Session Rollover"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isUrdu ? "طالبات اور طلباء کو نئے اکیڈمک ایئر اور اگلی کلاس میں منتقل کریں" : "Promote students to the next academic grade and session seamlessly."}
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Current Session & Class Card */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="bg-muted/50 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                {isUrdu ? "موجودہ کلاس اور سیشن (From)" : "Current Class & Session (From)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{isUrdu ? "اکیڈمک ایئر" : "Academic Year"}</label>
                <select value={fromYear} onChange={e => setFromYear(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-background text-sm">
                  {initialYears.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{isUrdu ? "کلاس" : "Class"}</label>
                  <select value={fromClass} onChange={e => setFromClass(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-background text-sm">
                    {initialClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{isUrdu ? "سیکشن" : "Section"}</label>
                  <select value={fromSection} onChange={e => setFromSection(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-background text-sm">
                    {initialSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Session & Class Card */}
          <Card className="border-border shadow-sm bg-card border-rose-500/20">
            <CardHeader className="bg-rose-500/5 border-b border-rose-500/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-600">
                <ArrowRight className="w-4 h-4" />
                {isUrdu ? "اگلی کلاس اور اکیڈمک سیشن (To)" : "Target Class & Session (To)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">{isUrdu ? "نیا اکیڈمک ایئر" : "New Academic Year"}</label>
                <select value={toYear} onChange={e => setToYear(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-background text-sm font-semibold text-rose-600">
                  {initialYears.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{isUrdu ? "پروموٹ کلاس" : "Promote To Class"}</label>
                  <select value={toClass} onChange={e => setToClass(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-background text-sm font-semibold text-rose-600">
                    {initialClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{isUrdu ? "پروموٹ سیکشن" : "Promote To Section"}</label>
                  <select value={toSection} onChange={e => setToSection(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-background text-sm font-semibold text-rose-600">
                    {initialSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List for Selection */}
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="bg-muted/30 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">{isUrdu ? "طلباء کی لسٹ انتخاب کریں" : "Select Students to Promote"}</CardTitle>
              <CardDescription>{isUrdu ? `کل منتخب شدہ: ${selectedStudentIds.length}` : `Selected ${selectedStudentIds.length} students`}</CardDescription>
            </div>
            <Button
              onClick={handleBatchPromote}
              disabled={loading || selectedStudentIds.length === 0}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <GraduationCap className="w-4 h-4 mr-2" />}
              {isUrdu ? "منتخب شدہ طلباء کو پروموٹ کریں" : "Promote Selected Batch"}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>{isUrdu ? "ایڈمیشن نمبر" : "Admission No"}</TableHead>
                  <TableHead>{isUrdu ? "رول نمبر" : "Roll No"}</TableHead>
                  <TableHead>{isUrdu ? "موجودہ اسٹیٹس" : "Current Status"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map(student => (
                  <TableRow key={student.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => toggleSelectStudent(student.id)}
                        className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-bold">{student.admission_number}</TableCell>
                    <TableCell><Badge variant="outline">{student.roll_number}</Badge></TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {isUrdu ? "پروموشن کے لیے تیار" : "Ready for Promotion"}
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
